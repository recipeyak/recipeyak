// https://prettier.io/docs/en/options.html
/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["clx", "clsx", "classNames", "cls", "className"],
  semi: false,
  useTabs: false,
  tabWidth: 2,
  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
}
