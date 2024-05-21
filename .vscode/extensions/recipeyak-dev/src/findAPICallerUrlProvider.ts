import {
  CancellationToken,
  Definition,
  DefinitionProvider,
  Disposable,
  LocationLink,
  Position,
  ProviderResult,
  Range,
  TextDocument,
  Uri,
  window,
  workspace,
} from "vscode"

import { exec } from "./exec"

const PYTHON_URL = /^\s+"(.*)",\s+method="(\S+)",$/m

// route(
//     "api/v1/members/<int:member_id>/",
//     method="patch",
//     view=member_update_view,
// ),

function pyPathToJsPath(pyPath: string): string {
  //
  // api/v1/members/<int:member_id>/
  // becomes
  // /api/v1/members/{member_id}/
  //
  return "/" + pyPath.replaceAll("<int:", "{").replaceAll(">", "}")
}

function rgEscape(text: string) {
  return text.replaceAll("{", String.raw`\{`).replaceAll("}", String.raw`\}`)
}

async function findJsUrlLocation(
  pyPath: string,
  method: string,
  cwd: string,
  signal: AbortSignal,
) {
  const regex = String.raw`url: "${rgEscape(pyPath)}",\s+method: "${method}",`
  const res = await exec(
    "/opt/homebrew/bin/rg",
    ["--json", "--multiline", regex, cwd],
    { signal, cwd },
  )
  const lines = res.stdout.split("\n")
  for (const line of lines) {
    if (line.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsedLine:
        | {
            type: "match"
            data: {
              path: { text: string }
              line_number: number
              submatches: { start: number }[]
              lines: { text: string }
            }
          }
        | { type: "summary" | "context" } = JSON.parse(line)
      if (parsedLine.type === "match") {
        const fileUri = parsedLine.data.path.text
        const lineNumber = Math.max(parsedLine.data.line_number - 1, 0)
        const offset =
          parsedLine.data.submatches.length === 0
            ? undefined
            : parsedLine.data.submatches[0].start
        const uri = Uri.file(fileUri)
        return { uri, lineNumber, offset, line: parsedLine.data.lines.text }
      }
    }
  }
}

export class FindAPICallerUrlProvider implements DefinitionProvider {
  constructor(private disposables: Disposable[]) {}
  provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
  ): ProviderResult<Definition | LocationLink[]> {
    const line =
      document.lineAt(position.line).text +
      document.lineAt(position.line + 1).text
    const matches = line.match(PYTHON_URL)
    if (matches?.[1] && matches?.[2]) {
      const jsPath = matches[1]
      const method = matches[2]

      // If the cursor is on the line, but outside the range of the URL string,
      // we return early.
      const startOfJsPath = line.indexOf(jsPath)
      const startValidPosition = startOfJsPath - 1
      const endValidPosition = startOfJsPath + jsPath.length + 1
      if (
        position.character < startValidPosition ||
        position.character > endValidPosition
      ) {
        return
      }

      const pyPath = pyPathToJsPath(jsPath)
      const workspaceRoot = workspace.workspaceFolders?.[0]?.uri
      if (workspaceRoot == null) {
        void window.showErrorMessage("Couldn't find workspace root")
        return
      }
      const cwd = Uri.joinPath(workspaceRoot, "frontend/src/api")
      const controller = new AbortController()
      this.disposables.push(
        token.onCancellationRequested(() => {
          controller.abort()
        }),
      )
      // add 1 to start and end to include quotes in selection highlight
      const start = line.indexOf(jsPath)
      const end = start + jsPath.length
      const originSelectionRange = new Range(
        new Position(position.line, start - 1),
        new Position(position.line, end + 1),
      )
      return findJsUrlLocation(
        pyPath,
        method,
        cwd.fsPath,
        controller.signal,
      ).then((res) => {
        if (res == null) {
          return
        }
        const extractUrl = res.line.match(/url: "(.*)"/)
        if (extractUrl == null) {
          return
        }
        const path = extractUrl[1]
        const start = res.line.indexOf(path)
        const end = start + path.length
        return [
          {
            originSelectionRange,
            targetUri: res.uri,
            targetRange: new Range(
              new Position(res.lineNumber, res.offset ?? 0),
              new Position(res.lineNumber, res.offset ?? 0),
            ),
            targetSelectionRange: new Range(
              new Position(res.lineNumber, start),
              new Position(res.lineNumber, end),
            ),
          } satisfies LocationLink,
        ]
      })
    }
  }
}
