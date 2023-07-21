const config = {
  extends: [
    "@abstracter/eslint-config/jest",
    "@abstracter/eslint-config/javascript",
    "@abstracter/eslint-config/typescript-node",
  ],

  rules: {
    // Handled by TypeScript
    "n/no-missing-import": "off",
  },

  overrides: [
    {
      files: "tests/**",

      rules: {
        "max-nested-callbacks": "off",

        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};

module.exports = config;
