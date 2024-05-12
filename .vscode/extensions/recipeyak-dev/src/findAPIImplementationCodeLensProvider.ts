import { CodeLens, CodeLensProvider, Range, TextDocument } from "vscode"

import { findAPIImplementationCommand } from "./findAPIImplementationCommand"
import { TYPESCRIPT_FUNCTION_DEF } from "./regex"

const TYPESCRIPT_CLIENT_CODE_GEN_HEADER =
  "// generated by recipeyak.api.base.codegen"

export class FindAPIImplementationCodeLensProvider implements CodeLensProvider {
  async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    const text = document.getText()
    if (!text.startsWith(TYPESCRIPT_CLIENT_CODE_GEN_HEADER)) {
      return []
    }
    const index = text.search(TYPESCRIPT_FUNCTION_DEF)
    if (index === -1) {
      return []
    }
    const position = document.positionAt(index)
    return [
      new CodeLens(new Range(position, position), {
        command: findAPIImplementationCommand.name,
        title: "Jump to Implementation",
      }),
    ]
  }
}