const { execSync } = require("node:child_process");

function getGitCommit() {
    try {
        return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    } catch {
        return "development";
    }
}

module.exports = ({ config }) => ({
    ...config,
    extra: {
        ...config.extra,
        gitCommit: getGitCommit(),
    },
});
