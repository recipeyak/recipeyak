import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import { formatDistanceToNow } from "@/date"
import { useSessionDelete } from "@/queries/sessionDelete"
import { useSessionDeleteAll } from "@/queries/sessionDeleteAll"
import { useSessionList } from "@/queries/sessionList"
import { ISession } from "@/api"

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
  return <p>{getDeviceName(device)}</p>
}

function Session(props: ISession) {
  const lastActivity = formatDistanceToNow(new Date(props.last_activity))
  const sessionDelete = useSessionDelete()
  return (
    <li className="mb-2">
      <section className="d-flex">
        <strong className="mr-2">{props.ip}</strong>
        <Button
          size="small"
          onClick={() => {
            sessionDelete.mutate({ sessionId: props.id })
          }}
          loading={sessionDelete.isLoading}
        >
          Logout
        </Button>
      </section>
      <DeviceName device={props.device} />
      <p>Last used: {lastActivity}</p>
      {props.current ? <span className="has-text-success">Current</span> : null}
    </li>
  )
}

function SessionList() {
  const sessions = useSessionList()
  const sessonsDeleteAll = useSessionDeleteAll()

  if (sessions.isLoading) {
    return <Loader />
  }

  if (sessions.isError) {
    return <p className="text-muted">Failure fetching sessions</p>
  }
  return (
    <>
      <ul>
        {sessions.data.map((s) => (
          <Session key={s.id} {...s} />
        ))}
      </ul>
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
    </>
  )
}

export default function Sessions() {
  return (
    <>
      <h1 className="fs-6">Sessions</h1>
      <SessionList />
    </>
  )
}
