import { CodeLens, CodeLensProvider, Range, TextDocument } from "vscode"

import { findAPICallerCommand } from "./findAPICallerCommand"
import { API_ENDPOINT_DEF } from "./regex"

export class FindAPICallerCodeLensProvider implements CodeLensProvider {
  async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    const text = document.getText()
    const index = text.search(API_ENDPOINT_DEF)
    if (index === -1) {
      return []
    }
    const position = document.positionAt(index)
    return [
      new CodeLens(new Range(position, position), {
        command: findAPICallerCommand.name,
        title: "Jump to Client",
      }),
    ]
  }
}
