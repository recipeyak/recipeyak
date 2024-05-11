import { commands, ExtensionContext, languages } from "vscode"

import { FindAPICallerCodeLensProvider } from "./findAPICallerCodeLensProvider"
import { findAPICallerCommand } from "./findAPICallerCommand"
import { FindAPIImplementationCodeLensProvider } from "./findAPIImplementationCodeLensProvider"
import { findAPIImplementationCommand } from "./findAPIImplementationCommand"

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    languages.registerCodeLensProvider(
      { language: "typescript" },
      new FindAPIImplementationCodeLensProvider(),
    ),
  )
  context.subscriptions.push(
    languages.registerCodeLensProvider(
      { language: "python" },
      new FindAPICallerCodeLensProvider(),
    ),
  )
  context.subscriptions.push(
    commands.registerCommand(
      findAPIImplementationCommand.name,
      findAPIImplementationCommand.callback,
    ),
  )
  context.subscriptions.push(
    commands.registerCommand(
      findAPICallerCommand.name,
      findAPICallerCommand.callback,
    ),
  )
}

export function deactivate() {}
