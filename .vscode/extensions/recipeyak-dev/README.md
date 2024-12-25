# recipeyak-dev

> VSCode extension for recipeyak development

## features

1. click from UI API calls to API implementations
2. click from API implementations to UI API calls

## install

1. install deps and build

```sh
cd .vscode/extensions/recipeyak-dev
pnpm install
s/build
```

2. enable extension in vscode

In the command palette run:

```
Extensions: Show Recommended Extensions
```

You should then see the `recipeyak-dev` extension in the results.

Press the `Install Workspace Extension` button.

Done!

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

## related

<https://code.visualstudio.com/updates/v1_89#_local-workspace-extensions>
