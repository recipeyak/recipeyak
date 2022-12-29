module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json",
    // Ensure VSCode doesn't try to look for tsconfig.json in the directory of
    // the component you're viewing.
    // from: https://stackoverflow.com/a/66088074/3720597
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "simple-import-sort",
    "import",
  ],
  extends: ["prettier"],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
  },
  rules: {
    "import/first": "error",
    "import/no-duplicates": "error",
    "import/newline-after-import": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "no-restricted-syntax": [
      "error",
      {
        selector: "TSEnumDeclaration",
        message: "Don't declare enums. Use a union of literals instead.",
      },
    ],
    "no-restricted-globals": [
      "error",
      "close",
      "closed",
      "status",
      "name",
      "length",
      "origin",
      "event",
    ],
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "lodash",
            message: "Please impor from 'lodash-es' instead.",
          },
          {
            name: "react-hot-toast",
            message: "Please import from '@/toast' instead.",
          },
          {
            name: "styled-components",
            message:
              "Please import from '@/theme' for type safe versions of 'styled-components' instead.",
          },
        ],
      },
    ],
    "react/self-closing-comp": [
      "error",
      {
        component: true,
        html: true,
      },
    ],
    "no-unneeded-ternary": ["error", { defaultAssignment: false }],
    "no-console": "error",
    "no-constant-binary-expression": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/require-array-sort-compare": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/no-confusing-void-expression": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/no-redundant-type-constituents": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/restrict-plus-operands": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "no-type-imports" },
    ],
    "react/jsx-fragments": "error",
    "no-lonely-if": "error",
    "object-shorthand": ["error", "always"],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-expect-error": "allow-with-description" },
    ],
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      {
        assertionStyle: "never",
      },
    ],
    "react/jsx-key": ["error", { checkFragmentShorthand: true }],
    "react/no-danger": "error",
    eqeqeq: ["error", "smart"],
  },
}
