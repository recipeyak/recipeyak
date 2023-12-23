import { useState } from "react"

import { assertNever } from "@/assert"
import { Badge } from "@/components/Badge"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@/components/Table"
import { formatDistanceToNow } from "@/date"
import { useSessionDelete } from "@/queries/sessionDelete"
import { useSessionDeleteAll } from "@/queries/sessionDeleteAll"
import { ISession, useSessionList } from "@/queries/sessionList"

function getDeviceEmoji(kind: ISession["device"]["kind"]): string | null {
  switch (kind) {
    case null:
      return null
    case "mobile":
      return "📱"
    case "desktop":
      return "🖥"
  }
}

function getOSBrowser(device: ISession["device"]): string | null {
  if (device.browser && device.os) {
    return `${device.browser} on ${device.os}`
  }
  if (device.browser) {
    return device.browser
  }
  if (device.os) {
    return device.os
  }
  return null
}

function getDeviceName(device: ISession["device"]): string | null {
  const deviceEmoji = getDeviceEmoji(device.kind)
  const osBrowser = getOSBrowser(device)

  if (osBrowser && deviceEmoji) {
    return deviceEmoji + " " + osBrowser
  }

  if (osBrowser) {
    return osBrowser
  }

  if (deviceEmoji) {
    return deviceEmoji
  }

  return null
}

function LogoutAction({ sessionId }: { sessionId: string }) {
  const sessionDelete = useSessionDelete()
  return (
    <Button
      size="small"
      onClick={() => {
        sessionDelete.mutate({ sessionId })
      }}
      loading={sessionDelete.isPending}
    >
      Logout
    </Button>
  )
}

function SessionList() {
  const sessions = useSessionList()
  const [showAll, setShowAll] = useState(false)
  const preview = 5

  if (sessions.isPending) {
    return <Loader />
  }

  if (sessions.isError) {
    return (
      <div className="text-[var(--color-text-muted)]">
        Failure fetching sessions
      </div>
    )
  }

  const columns = [
    {
      id: "ip" as const,
      name: "IP Address",
    },
    {
      id: "userAgent" as const,
      name: "User Agent",
    },
    {
      id: "lastUsed" as const,
      name: "Last Used",
    },
    {
      id: "action" as const,
      name: "Action",
    },
  ]

  return (
    <div className="flex flex-col items-center gap-2">
      <Table label="sessions">
        <TableHeader columns={columns}>
          {(column) => {
            return <Column isRowHeader>{column.name}</Column>
          }}
        </TableHeader>
        <TableBody
          items={sessions.data.slice(0, showAll ? undefined : preview)}
        >
          {(session) => {
            return (
              <Row columns={columns}>
                {(column) => {
                  switch (column.id) {
                    case "ip": {
                      return <Cell>{session.ip}</Cell>
                    }
                    case "action": {
                      return (
                        <Cell>
                          <LogoutAction sessionId={session.id} />
                        </Cell>
                      )
                    }
                    case "lastUsed": {
                      return (
                        <Cell className="gap-2">
                          <div>
                            {formatDistanceToNow(
                              new Date(session.last_activity),
                            )}
                          </div>
                          {session.current ? (
                            <Badge status="success">Current</Badge>
                          ) : null}
                        </Cell>
                      )
                    }
                    case "userAgent": {
                      return <Cell>{getDeviceName(session.device)}</Cell>
                    }
                    default:
                      assertNever(column)
                  }
                }}
              </Row>
            )
          }}
        </TableBody>
      </Table>
      {!showAll && sessions.data.length > preview && (
        <Button
          size="small"
          onClick={() => {
            setShowAll(true)
          }}
        >
          Show All Sessions ({sessions.data.length - preview} hidden)
        </Button>
      )}
    </div>
  )
}

export default function Sessions() {
  const sessonsDeleteAll = useSessionDeleteAll()
  return (
    <Box dir="col">
      <div className="flex items-center justify-between">
        <label className="text-xl font-bold">Sessions</label>
        <Button
          size="small"
          className="mb-2"
          onClick={() => {
            sessonsDeleteAll.mutate()
          }}
          loading={sessonsDeleteAll.isPending}
        >
          Logout Other Sessions
        </Button>
      </div>
      <SessionList />
    </Box>
  )
}
