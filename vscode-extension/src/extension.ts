import { ExtensionContext, commands, languages } from "vscode";
import { findAPIImplementationCommand } from "./findAPIImplementationCommand";
import { FindAPIImplementationCodeLensProvider } from "./findAPIImplementationCodeLensProvider";
import { FindAPICallerCodeLensProvider } from "./findAPICallerCodeLensProvider";
import { findAPICallerCommand } from "./findAPICallerCommand";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    languages.registerCodeLensProvider(
      { language: "typescript" },
      new FindAPIImplementationCodeLensProvider()
    )
  );
  context.subscriptions.push(
    languages.registerCodeLensProvider(
      { language: "python" },
      new FindAPICallerCodeLensProvider()
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      findAPIImplementationCommand.name,
      findAPIImplementationCommand.callback
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      findAPICallerCommand.name,
      findAPICallerCommand.callback
    )
  );
}

export function deactivate() {}
