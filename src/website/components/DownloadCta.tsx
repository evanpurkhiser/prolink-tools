import styled from '@emotion/styled';
import {format, parseISO} from 'date-fns';
import {motion} from 'framer-motion';

import {AppleLogo, LinuxLogo, WindowsLogo} from 'src/shared/components/OsIcons';
import useRelease from 'src/utils/useLatestRelease';

type Platform = NonNullable<ReturnType<typeof getPlatform>>;

const getPlatform = () => {
  const platform = window.navigator.platform.toLowerCase();

  if (platform.startsWith('win')) {
    return 'win';
  }
  if (platform.startsWith('mac')) {
    return 'mac';
  }
  if (platform.startsWith('linux')) {
    return 'linux';
  }

  return null;
};

const PLATFORM: Record<Platform, {Icon: typeof AppleLogo; label: string}> = {
  mac: {Icon: AppleLogo, label: 'macOS'},
  win: {Icon: WindowsLogo, label: 'windows'},
  linux: {Icon: LinuxLogo, label: 'linux'},
};

const DownloadCta = (props: React.ComponentProps<typeof motion.div>) => {
  const platform = getPlatform() ?? 'mac';
  const release = useRelease();

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();

    if (release === null) {
      return;
    }

    // Find the asset for the paltform they're on
    const asset = release.assets.find(asset => asset.name.includes(platform));
    if (asset) {
      window.location.replace(asset.browser_download_url);
    }
  };

  const {Icon, label} = PLATFORM[platform];

  const otherPlatforms = (Object.keys(PLATFORM) as Platform[])
    .filter(p => p !== platform)
    .map(p => ({
      url: release?.assets?.find(asset => asset.name.includes(p))?.browser_download_url,
      ...PLATFORM[p],
    }))
    .map(({Icon, label, url}) =>
      url ? (
        <OtherPlatform href={url}>
          <Icon size={16} />
          {label}
        </OtherPlatform>
      ) : null
    );

  return (
    <motion.div {...props}>
      <DownloadButton onClick={handleDownload}>
        <Icon />
        download for {label}
      </DownloadButton>

      <VersionTag>
        version {release?.name?.slice(1) ?? 'x.x.x'}
        <small>
          {!release
            ? 'Fetching release...'
            : !release.published_at
            ? 'Unknown release date'
            : format(parseISO(release.published_at), 'MMMM do yyyy')}
        </small>
      </VersionTag>
      <AlsoOn>
        Also for <OtherList>{otherPlatforms}</OtherList>
      </AlsoOn>
    </motion.div>
  );
};

const DownloadButton = styled('button')`
  font-family: 'DM Mono';
  letter-spacing: -0.75px;
  font-size: 1rem;
  background: #f84b4b;
  color: #fff;
  padding: 0.5rem 0.75rem;
  border: 0;
  display: flex;
  align-items: center;
  border-radius: 2px;
  cursor: pointer;
  transition: background 200ms ease-in-out;

  svg {
    margin-right: 0.5rem;
  }

  &:hover {
    background: #e54949;
  }
`;

const VersionTag = styled('div')`
  font-size: 0.875rem;
  margin-top: 0.75rem;

  small {
    display: block;
    font-weight: 300;
    line-height: 2;
    color: #939393;
  }
`;

const AlsoOn = styled('div')`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OtherList = styled('div')`
  display: inline-flex;
  gap: 0.5rem;
`;

const OtherPlatform = styled('a')`
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  background: #f6f6f6;
  padding: 0 4px;
  border-radius: 2px;
  color: #939393;
  text-decoration: none;
`;

export default DownloadCta;
