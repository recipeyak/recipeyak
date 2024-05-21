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

const JS_URL = /^ +url: "(.*)",\s+method: "(\S+)",$/m

// route(
//     "api/v1/auth/login/",
//     method="post",
//     view=user_login_view,
// ),

function jsPathToPyPath(jsUrl: string): string {
  // /api/v1/auth/login/
  // becomes
  // api/v1/auth/login/
  //
  // /api/v1/members/{member_id}/
  // becomes
  // api/v1/members/<int:member_id>/
  //
  // but for rip grep, we can just do:
  // api/v1/members/<.*:member_id>/
  return jsUrl.slice(1).replaceAll("{", "<.*:").replaceAll("}", ">")
}

async function findPythonUrlLocation(
  pyPath: string,
  method: string,
  cwd: string,
  signal: AbortSignal,
) {
  const regex = String.raw`"${pyPath}",\s+method="${method}",`
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

export class FindAPIDefinitionUrlProvider implements DefinitionProvider {
  constructor(private disposables: Disposable[]) {}
  provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
  ): ProviderResult<Definition | LocationLink[]> {
    const line =
      document.lineAt(position.line).text +
      document.lineAt(position.line + 1).text
    const matches = line.match(JS_URL)
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
        return null
      }

      const pyPath = jsPathToPyPath(jsPath)
      const workspaceRoot = workspace.workspaceFolders?.[0]?.uri
      if (workspaceRoot == null) {
        void window.showErrorMessage("Couldn't find workspace root")
        return
      }
      const cwd = Uri.joinPath(workspaceRoot, "backend")
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
      return findPythonUrlLocation(
        pyPath,
        method,
        cwd.fsPath,
        controller.signal,
      ).then((res) => {
        if (res == null) {
          return null
        }
        const actualPyPath = res.line.split(",")[0].trim()
        const start = res.line.indexOf(actualPyPath)
        const end = start + actualPyPath.length
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
    return null
  }
}
