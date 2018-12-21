module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["html", "react"],
  // https://github.com/standard/eslint-config-standard/blob/c4902d20cab15971932f591d0d8cf7915ade307f/eslintrc.json
  extends: ["react-app", "standard", "prettier"],
  env: {
    browser: true
  },
  // add your custom rules here
  rules: {
    // allow async-await
    "generator-star-spacing": 0,
    "import/first": ["warn", "always"],
    "one-var": ["warn", "never"],
    "no-constant-condition": ["warn", { checkLoops: false }],
    "no-unused-vars": [
      "warn",
      {
        vars: "all",
        args: "all",
        ignoreRestSiblings: false,
        argsIgnorePattern: "^_"
      }
    ],
    // we don't trigger on properties since the python backend returns json
    // with snake case
    camelcase: ["warn", { properties: "never" }],
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    "prefer-const": [
      "error",
      {
        destructuring: "any",
        ignoreReadBeforeAssign: false
      }
    ],
    "no-useless-return": "warn",
    "no-unreachable": "warn"
  }
}
