import * as React from 'react';
import {Radio} from 'react-feather';
import styled from '@emotion/styled';
import rehype2react from 'rehype-react';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import unified from 'unified';
import {Node} from 'unist';

import Tag from 'src/shared/components/Tag';
import {GITHUB_REPO} from 'src/shared/constants';
import {LatestRelease} from 'src/utils/useLatestRelease';
import useModal, {ModalProps} from 'src/utils/useModal';

import ActionButton from '../components/ActionButton';

type Options = {
  hideUnreleased?: boolean;
};

const Heading = styled('header')`
  margin: 0.5rem -1rem;
  margin-top: 1.25rem;
  padding: 0 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${p => p.theme.subBorder};
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    font-size: 1.125rem;
    margin: 0;
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
  }

  small {
    color: ${p => p.theme.subText};
    font-size: 0.75rem;
  }

  a {
    text-decoration: none;
  }
`;

const MarkerCap = () => (
  <svg width="9" height="15" viewBox="0 0 9 15" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 7.50001C0 6.50002 9 0.138794 9 0.138794V14.8612C9 14.8612 0 8.5 0 7.50001Z"
      fill="currentColor"
    />
  </svg>
);

const OldVersionMarker = styled((p: React.HTMLProps<HTMLDivElement>) => (
  <div {...p}>
    <MarkerCap />
    <span>Past Versions</span>
  </div>
))`
  display: grid;
  grid-template-columns: 1fr max-content max-content;
  align-items: center;
  margin-left: -1rem;

  &:before {
    content: '';
    display: block;
    height: 1px;
    background: ${p => p.theme.subText};
  }

  svg {
    color: ${p => p.theme.subText};
  }

  span {
    font-size: 0.6rem;
    font-weight: bold;
    text-transform: uppercase;
    padding: 0.125rem 0.25rem;
    padding-left: 0.075rem;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    background: ${p => p.theme.subText};
    color: #fff;
  }
`;

const Notes = styled('div')`
  h3 {
    font-size: 0.825rem;
    text-transform: uppercase;
    color: ${p => p.theme.subText};
  }

  ul {
    padding-left: 0.75rem;
  }

  li {
    padding-left: 0.5rem;
  }

  li::marker {
    color: ${p => p.theme.subText};
    font-weight: bold;
    font-size: 0.75rem;
    content: '↪';
  }
`;

type NodeWithChildren = Node & {children: NodeWithChildren[]};

type HeadingNode = NodeWithChildren & {depth: number};

function renderChangelog(changelogMd: string, {hideUnreleased = false}: Options = {}) {
  const changelogTree = unified().use(markdown).parse(changelogMd) as NodeWithChildren;

  // Break up each changelog entry

  // Start by removing the changelog links at the bottom, and the first three
  // nodes from the start of the changelog.
  const changeNodes = changelogTree.children
    .slice(3)
    .filter(node => node.type !== 'definition');

  // Locate version headings
  const versionHeadingIndicies = changeNodes
    .map((node, i) =>
      node.type === 'heading' && (node as HeadingNode).depth === 2 ? i : null
    )
    .filter(index => index !== null) as number[];

  // Get the closest current stable version. This takes into account
  // pre-releases by trimming off the additional release info.
  const closestCurrentStableVersion = process.env.RELEASE?.replace(
    /-[0-9]+-g[0-9a-fA-F]+/,
    ''
  );

  // Locate the heading indicie that matches the currently running version.
  const mostCurrentVersionIndex = versionHeadingIndicies.find(
    index =>
      changeNodes[index].children[0].children[0].value === closestCurrentStableVersion
  );

  return versionHeadingIndicies.map((headingIndex, i) => {
    const nextHeading = versionHeadingIndicies[i + 1];

    const headingNode = changeNodes[headingIndex];
    const releaseNotesAst = changeNodes.slice(headingIndex + 1, nextHeading);

    const release = headingNode.children[0].children[0].value as string;
    const date = (headingNode.children[1]?.value as string)?.substring(3);

    const isUnreleaseRelease = release === 'Unreleased';

    if (isUnreleaseRelease && hideUnreleased) {
      return null;
    }

    const isCurrentRelease =
      release === process.env.RELEASE && process.env.RELEASE_CHANNEL === 'stable';

    const isMostClosestStable =
      release === closestCurrentStableVersion && i !== versionHeadingIndicies.length - 1;

    const isNewVersion =
      !isUnreleaseRelease &&
      mostCurrentVersionIndex !== undefined &&
      mostCurrentVersionIndex < headingIndex;

    const releaseNotesHtml = unified()
      .use(markdown)
      .use(remark2rehype)
      .runSync({type: 'root', children: releaseNotesAst});

    const releaseNotes = unified()
      .use(rehype2react, {createElement: React.createElement, Fragment: React.Fragment})
      .stringify(releaseNotesHtml);

    return (
      <section key={release}>
        <Heading>
          <h2>
            {isUnreleaseRelease ? 'In Development' : release} <small>{date}</small>
          </h2>
          {isUnreleaseRelease && <Tag priority="ok">Coming Soon</Tag>}
          {isCurrentRelease && <Tag priority="good">You&apos;re Version</Tag>}
          {isNewVersion && <Tag priority="critical">New Version</Tag>}
        </Heading>
        <Notes>{releaseNotes}</Notes>

        {isMostClosestStable && <OldVersionMarker />}
      </section>
    );
  });
}

type Props = ModalProps & Options;

type InitOptions = {
  latestRelease: LatestRelease;
};

const useReleaseModal = ({latestRelease}: InitOptions) =>
  useModal(
    ({Modal, hideUnreleased}: Props) => {
      const [changelog, setChangelog] = React.useState<null | string>(null);

      const fetchChangelog = async () => {
        const resp = await fetch(
          `https://raw.githubusercontent.com/${GITHUB_REPO.owner}/${GITHUB_REPO.repo}/master/CHANGELOG.md`
        );
        const text = await resp.text();
        setChangelog(text);
      };

      React.useEffect(() => void fetchChangelog(), []);

      if (changelog === null) {
        return null;
      }

      const hasNewVersion =
        latestRelease &&
        process.env.RELEASE_CHANNEL === 'stable' &&
        process.env.RELEASE !== latestRelease.name;

      return (
        <Modal>
          <ModalHeader>
            <h1>What&apos;s new in Prolink Tools</h1>
            {latestRelease && hasNewVersion ? (
              <NewVersionButton onClick={() => location.assign(latestRelease.html_url)}>
                Download {latestRelease.name}
              </NewVersionButton>
            ) : (
              <LatestVersionOk />
            )}
          </ModalHeader>
          {renderChangelog(changelog, {hideUnreleased})}
        </Modal>
      );
    },
    {canClickOut: false}
  );

const ModalHeader = styled('header')`
  padding: 1.5rem 1rem;
  padding-bottom: 0.5rem;
  margin: -1rem;
  margin-bottom: -0.25rem;
  display: flex;
  justify-content: space-between;

  h1 {
    display: block;
    font-family: 'DM Mono';
    font-size: 1rem;
    margin: 0;
    background: #2d2d2d;
    color: #fff;
    padding: 0.25rem 0.5rem 0.25rem 1rem;
    margin-left: -1.25rem;
  }
`;

const NewVersionButton = styled(ActionButton)`
  background: ${p => p.theme.active};
  color: #fff;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
`;

const CheckOk = styled(Radio)`
  color: ${p => p.theme.active};
`;

CheckOk.defaultProps = {
  size: '1.25rem',
};

const LatestVersionOk = styled('div')`
  font-size: 0.8125rem;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

LatestVersionOk.defaultProps = {
  children: (
    <React.Fragment>
      You&apos;re up to date <CheckOk />
    </React.Fragment>
  ),
};

export default useReleaseModal;
