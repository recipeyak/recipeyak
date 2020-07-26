/* eslint-disable init-declarations*/
declare module "react-dev-utils/checkRequiredFiles" {
  // https://github.com/facebook/create-react-app/blob/fd382772a1ab656087c1467c5fe9ab8926af1d01/packages/react-dev-utils/checkRequiredFiles.js#L14
  const checkRequiredFiles: (files: string[]) => boolean

  export = checkRequiredFiles
}

declare module "react-dev-utils/FileSizeReporter" {
  // https://github.com/facebook/create-react-app/blob/fd382772a1ab656087c1467c5fe9ab8926af1d01/packages/react-dev-utils/FileSizeReporter.js#L133
  const measureFileSizesBeforeBuild: (
    buildFolder: string
  ) => Promise<{ root: string; sizes: unknown }>

  // https://github.com/facebook/create-react-app/blob/fd382772a1ab656087c1467c5fe9ab8926af1d01/packages/react-dev-utils/FileSizeReporter.js#L27
  const printFileSizesAfterBuild: (
    webpackStats: unknown,
    previousSizeMap: unknown,
    buildFolder?: unknown,
    maxBundleGzipSize?: unknown,
    maxChunkGzipSize?: unknown
  ) => void

  export = {
    measureFileSizesBeforeBuild,
    printFileSizesAfterBuild
  }
}

declare module "react-dev-utils/InterpolateHtmlPlugin" {
  // https://github.com/facebook/create-react-app/blob/fd382772a1ab656087c1467c5fe9ab8926af1d01/packages/react-dev-utils/InterpolateHtmlPlugin.js#L19
  class InterpolateHtmlPlugin {
    constructor(htmlWebpackPlugin, replacements?)
  }
  export = InterpolateHtmlPlugin
}

declare module "react-dev-utils/WatchMissingNodeModulesPlugin" {
  // https://github.com/facebook/create-react-app/blob/fd382772a1ab656087c1467c5fe9ab8926af1d01/packages/react-dev-utils/WatchMissingNodeModulesPlugin.js#L14

  class WatchMissingNodeModulesPlugin {
    constructor(nodeModulesPath: string)
  }

  export = WatchMissingNodeModulesPlugin
}
