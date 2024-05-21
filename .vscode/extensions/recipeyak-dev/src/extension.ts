import { commands, ExtensionContext, languages } from "vscode"

import { FindAPICallerCodeLensProvider } from "./findAPICallerCodeLensProvider"
import { findAPICallerCommand } from "./findAPICallerCommand"
import { FindAPICallerUrlProvider } from "./findAPICallerUrlProvider"
import { FindAPICodeLensProvider } from "./findAPICodeLensProvider"
import { FindAPIDefinitionUrlProvider } from "./findAPIDefinitionUrlProvider"
import { findAPIImplementationCommand } from "./findAPIImplementationCommand"

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    languages.registerDefinitionProvider(
      { language: "typescript" },
      new FindAPIDefinitionUrlProvider(context.subscriptions),
    ),
    languages.registerDefinitionProvider(
      { language: "python" },
      new FindAPICallerUrlProvider(context.subscriptions),
    ),
    languages.registerCodeLensProvider(
      { language: "typescript" },
      new FindAPICodeLensProvider(),
    ),
    languages.registerCodeLensProvider(
      { language: "python" },
      new FindAPICallerCodeLensProvider(),
    ),
    commands.registerCommand(
      findAPIImplementationCommand.name,
      findAPIImplementationCommand.callback,
    ),
    commands.registerCommand(
      findAPICallerCommand.name,
      findAPICallerCommand.callback,
    ),
  )
}

export function deactivate() {}
