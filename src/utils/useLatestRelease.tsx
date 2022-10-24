import {useEffect, useState} from 'react';
import {request} from '@octokit/request';
import {Endpoints} from '@octokit/types';

import {GITHUB_REPO} from 'src/shared/constants';

type Release = Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response'];

const useRelease = () => {
  const [release, setRelease] = useState<Release['data'] | null>(null);

  const getReleases = async () => {
    const release = await request('GET /repos/:owner/:repo/releases/latest', GITHUB_REPO);
    setRelease(release['data']);
  };

  useEffect(() => void getReleases(), []);

  return release;
};

export type LatestRelease = ReturnType<typeof useRelease>;

export default useRelease;
