const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "../");

const PACKAGE_ROOT = path.resolve(PROJECT_ROOT, "dist");

module.exports = {
  PROJECT_ROOT,
  PACKAGE_ROOT,
};
