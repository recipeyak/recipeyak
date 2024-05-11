import path from "path"
import {
  Range,
  Selection,
  TextEditorRevealType,
  Uri,
  window,
  workspace,
} from "vscode"

import { TYPESCRIPT_FUNCTION_DEF } from "./regex"
import { snakeToCamel } from "./textUtils"

export const findAPICallerCommand = {
  name: "recipeyak-dev.findAPICaller",
  callback: async () => {
    const editor = window.activeTextEditor
    if (!editor) {
      await window.showErrorMessage("No editor found")
      return
    }
    // member_update_view.py
    const fileName = path.basename(editor.document.fileName)
    // memberUpdate.ts
    const relativeFilePath =
      "frontend/src/api/" + snakeToCamel(fileName.replace("_view.py", ".ts"))
    const rootUri = workspace.workspaceFolders?.[0]?.uri
    if (!rootUri) {
      await window.showErrorMessage("No workspace folder found")
      return
    }
    const absolutePath = Uri.joinPath(rootUri, relativeFilePath)
    const document = await workspace.openTextDocument(absolutePath)
    const text = document.getText()
    const offset = text.search(TYPESCRIPT_FUNCTION_DEF)
    if (offset === -1) {
      await window.showErrorMessage(
        "Couldn't find typescript function def in file",
      )
      return
    }
    const pos = document.positionAt(offset)
    await window.showTextDocument(document)
    if (!window.activeTextEditor) {
      return
    }
    window.activeTextEditor.revealRange(
      new Range(pos, pos),
      TextEditorRevealType.InCenter,
    )
    window.activeTextEditor.selection = new Selection(pos, pos)
  },
} as const
