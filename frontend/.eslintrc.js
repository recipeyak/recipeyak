module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["html", "react", "react-hooks", "@typescript-eslint", "import"],
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
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "import/no-duplicates": "error",
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
            name: "redux",
            importNames: ["Dispatch", "useDispatch"],
            message: "Please import 'Dispatch' from '@/store/thunks' instead.",
          },
          {
            name: "styled-components",
            message:
              "Please import from '@/theme' for type safe versions of 'styled-components' instead.",
          },
          {
            name: "typesafe-actions",
            importNames: ["action"],
            message:
              "Please use 'createStandardAction' or 'createAsyncAction' instead as they allow for easy discrimination with 'getType()'. see: https://github.com/piotrwitek/typesafe-actions#action",
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
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/restrict-plus-operands": "error",
    "init-declarations": ["error", "always"],
    "react/jsx-fragments": "error",
    "no-lonely-if": "error",
    "object-shorthand": ["error", "always"],
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
