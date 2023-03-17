import { useState } from "react"

import { ISession } from "@/api"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import { formatDistanceToNow } from "@/date"
import { useSessionDelete } from "@/queries/sessionDelete"
import { useSessionDeleteAll } from "@/queries/sessionDeleteAll"
import { useSessionList } from "@/queries/sessionList"

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

interface IDeviceNameProps {
  readonly device: ISession["device"]
}

function DeviceName({ device }: IDeviceNameProps) {
  return <div>{getDeviceName(device)}</div>
}

function Session(props: ISession) {
  const lastActivity = formatDistanceToNow(new Date(props.last_activity))
  const sessionDelete = useSessionDelete()
  return (
    <Box dir="col" align="start" space="between" wrap>
      <div>{props.ip}</div>
      <Box align="center" space="between" grow={1} w={100} gap={4}>
        <Box dir="col">
          <DeviceName device={props.device} />
          <Box gap={2}>
            <div>Last used: {lastActivity}</div>
            {props.current ? (
              <span className="has-text-success fw-500">Current</span>
            ) : null}
          </Box>
        </Box>

        <Button
          size="small"
          onClick={() => {
            sessionDelete.mutate({ sessionId: props.id })
          }}
          loading={sessionDelete.isLoading}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )
}

function SessionList() {
  const sessions = useSessionList()
  const sessonsDeleteAll = useSessionDeleteAll()
  const [showAll, setShowAll] = useState(false)
  const preview = 5

  if (sessions.isLoading) {
    return <Loader />
  }

  if (sessions.isError) {
    return <p className="text-muted">Failure fetching sessions</p>
  }

  return (
    <Box dir="col" align="start" gap={2}>
      <Box dir="col" gap={3}>
        {sessions.data.slice(0, showAll ? undefined : preview).map((s) => (
          <Session key={s.id} {...s} />
        ))}
        {!showAll && (
          <Button
            size="small"
            onClick={() => {
              setShowAll(true)
            }}
          >
            Show All Sessions ({sessions.data.length - preview} hidden)
          </Button>
        )}
      </Box>
      <Button
        size="small"
        className="mb-2"
        onClick={() => {
          sessonsDeleteAll.mutate()
        }}
        loading={sessonsDeleteAll.isLoading}
      >
        Logout Other Sessions
      </Button>
    </Box>
  )
}

export default function Sessions() {
  return (
    <Box dir="col">
      <label className="fw-bold">Sessions</label>
      <SessionList />
    </Box>
  )
}
