import { Selection, TextEditorRevealType, Uri, window, workspace } from "vscode"

import { API_ENDPOINT_DEF, TYPESCRIPT_FUNCTION_DEF } from "./regex"
import { camelToSnake } from "./textUtils"

export const findAPIImplementationCommand = {
  name: "recipeyak-dev.findAPIImplementation",
  callback: async () => {
    const editor = window.activeTextEditor
    if (!editor) {
      await window.showErrorMessage("No editor found")
      return
    }
    const text = editor.document.getText()
    const match = text.match(TYPESCRIPT_FUNCTION_DEF)
    if (match?.[1]) {
      const functionName = match[1]
      const endpointModuleName = camelToSnake(functionName) + "_view.py"
      const relativeFilePath = "backend/recipeyak/api/" + endpointModuleName
      const rootUri = workspace.workspaceFolders?.[0]?.uri
      if (!rootUri) {
        await window.showErrorMessage("No workspace folder found")
        return
      }
      const absolutePath = Uri.joinPath(rootUri, relativeFilePath)
      const document = await workspace.openTextDocument(absolutePath)
      const implText = document.getText()
      let offset = implText.search(API_ENDPOINT_DEF)
      if (offset === -1) {
        await window.showErrorMessage(
          "Couldn't find API endpoint definition in file",
        )
        return
      }
      const pos = document.positionAt(offset)
      // next line is the actual function def
      const line = document.lineAt(pos.line + 1).range
      await window.showTextDocument(document)
      if (!window.activeTextEditor) {
        return
      }
      window.activeTextEditor.revealRange(line, TextEditorRevealType.InCenter)
      window.activeTextEditor.selection = new Selection(line.start, line.start)
    }
  },
} as const
