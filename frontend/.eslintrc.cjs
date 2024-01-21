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
    "@tanstack/query",
    "react-refresh",
  ],
  extends: [
    "prettier",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "plugin:tailwindcss/recommended",
  ],
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
    "react-refresh/only-export-components": "error",
    "no-restricted-syntax": [
      "error",
      {
        selector: "TSEnumDeclaration",
        message: "Don't declare enums. Use a union of literals instead.",
      },
      {
        selector:
          "JSXAttribute[name.name='style'][value.type='JSXExpressionContainer'][value.expression.type='ObjectExpression'][value.expression.properties.length=0]",
        message: "Avoid empty style={{}}.",
      },
      {
        selector: "Literal[value=/var\\(--.*]/]",
        message:
          "Use tailwind css variable shorthand instead. eg. text-[--color-primary] instead of text-[var(--color-primary)]",
      },
      {
        selector: "JSXAttribute[name.name='className'][value.value='']",
        message: 'Avoid empty className="".',
      },
      {
        selector:
          "JSXAttribute[name.name='style'][value.type='JSXExpressionContainer'][value.expression.type='ObjectExpression']",
        message: "Avoid inline styles.",
      },
      {
        selector: "CallExpression[callee.property.name='setQueryData']",
        message: "Use a type safe wrapper instead.",
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
      "localStorage",
      "focus",
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
            name: "react-textarea-autosize",
            message: "Please import Textarea instead.",
          },
          {
            name: "react-aria-components",
            importNames: ["Button"],
            message: "Please import @/components/Button instead.",
          },
          {
            name: "react-aria-components",
            importNames: ["MenuItem"],
            message: "Please import @/components/MenuItem instead.",
          },
        ],
        patterns: [
          {
            group: [".*"],
            message: "Relative imports are not allowed.",
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
    "@typescript-eslint/no-misused-promises": "error",
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
    "react/forbid-elements": [
      "error",
      { forbid: ["p", "style", "section", "b", "em", "i", "select", "button"] },
    ],
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
    "tailwindcss/classnames-order": "error",
    "tailwindcss/enforces-negative-arbitrary-values": "error",
    "tailwindcss/enforces-shorthand": "error",
    "tailwindcss/migration-from-tailwind-2": "error",
    "tailwindcss/no-arbitrary-value": "off",
    "tailwindcss/no-custom-classname": "error",
    "tailwindcss/no-custom-classname": [
      "error",
      {
        callees: [
          "classnames",
          "clsx",
          "ctl",
          "cva",
          "tv",
          "clx",
          "cls",
          "classNames",
        ],
      },
    ],
    "tailwindcss/no-contradicting-classname": "error",
  },
}
