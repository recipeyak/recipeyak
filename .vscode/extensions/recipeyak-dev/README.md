# recipeyak-dev

> VSCode extension for recipeyak development

## features

1. click from UI API calls to API implementations
2. click from API implementations to UI API calls

## install

```sh
cd .vscode/extensions/recipeyak-dev
pnpm install
s/build
# either install via:
code --install-extension *.vsix
# or navigate to `@recommended` extensions in VSCode and install recipeyak-dev
```

## dev

1. start esbuild

```sh
s/build_watch
```

2. open the extension in a new window

```sh
code vscode_extension
```

3. run `View: Show Run and Debug` from the command palette

4. run the extension using the play button
