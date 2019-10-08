module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["html", "react", "react-hooks", "@typescript-eslint", "import"],
  extends: ["prettier"],
  env: {
    browser: true
  },
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "import/no-duplicates": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "redux",
            importNames: ["Dispatch", "useDispatch"],
            message: "Please import 'Dispatch' from '@/store/thunks' instead."
          },
          {
            name: "styled-components",
            message:
              "Please import from '@/theme' for type safe versions of 'styled-components' instead."
          },
          {
            name: "typesafe-actions",
            importNames: ["action"],
            message:
              "Please use 'createStandardAction' or 'createAsyncAction' instead as they allow for easy discrimination with 'getType()'. see: https://github.com/piotrwitek/typesafe-actions#action"
          }
        ]
      }
    ]
  }
}
