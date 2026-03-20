import {execSync} from 'child_process';
import semver from 'semver';

const commit = execSync('git rev-parse HEAD').toString().trim();
let releaseId: string;
let latestTag: string;

try {
  releaseId = execSync('git describe').toString().trim();
  latestTag = execSync('git describe --abbrev=0').toString().trim();
} catch {
  releaseId = latestTag = commit.slice(0, 6);
}

// Are we building a specifically tagged commit?
const isTagged = latestTag === releaseId;

// Specify the release channel (environment)
const releaseChannel = isTagged
  ? semver.prerelease(releaseId) !== null
    ? 'stable'
    : 'prerelease'
  : 'main';

export {releaseId, releaseChannel, commit};
