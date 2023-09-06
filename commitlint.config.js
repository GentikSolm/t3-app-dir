/* eslint-env node */
module.exports = {
  parserPreset: {
    parserOpts: { headerPattern: /^([^\(\):]*)(?:\((.*)\))?!?: (.*)$/ },
  },
  /*
   * Resolve and load @commitlint/config-conventional from node_modules.
   * Referenced packages must be installed
   */
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0, "never", ""],
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "hotfix",
        "perf",
        "ref",
        "revert",
        "style",
        "test",
        "terraform-docs",
        "fire",
      ],
    ],
  },
};
