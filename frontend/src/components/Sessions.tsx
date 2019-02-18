import React, { useEffect } from "react"
import { ISession, LoggingOutStatus } from "@/store/reducers/user"
import { distanceInWordsToNow } from "date-fns"
import { WebData, isLoading, isInitial, isFailure } from "@/webdata"
import { Button } from "@/components/Buttons"
import Loader from "@/components/Loader"
import { connect } from "react-redux"
import { IState } from "@/store/store"
import {
  Dispatch,
  fetchingSessions,
  loggingOutSessionById,
  loggingOutAllSessions
} from "@/store/thunks"

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

interface ISessionProps extends ISession {
  readonly logout: (id: ISession["id"]) => void
}

function Session(props: ISessionProps) {
  const lastActivity = distanceInWordsToNow(props.last_activity) + " ago"
  return (
    <li className="mb-2">
      <section className="d-flex">
        <strong className="mr-2">{props.ip}</strong>
        <Button
          size="small"
          onClick={() => props.logout(props.id)}
          loading={props.loggingOut === LoggingOutStatus.Loading}>
          Logout
        </Button>
      </section>
      <DeviceName device={props.device} />
      <p>Last used: {lastActivity}</p>
      {props.current ? <span className="has-text-success">Current</span> : null}
    </li>
  )
}

interface ISessionListProps {
  readonly sessions: WebData<ReadonlyArray<ISession>>
  readonly fetchData: () => void
  readonly logoutAll: () => void
  readonly logoutById: (id: ISession["id"]) => void
  readonly loggingOutAll: LoggingOutStatus
}

function SessionListBasic({
  sessions,
  logoutAll,
  logoutById,
  loggingOutAll,
  fetchData
}: ISessionListProps) {
  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading(sessions) || isInitial(sessions)) {
    return <Loader />
  }

  if (isFailure(sessions)) {
    return <p className="text-muted">Failure fetching sessions</p>
  }
  return (
    <>
      <ul>
        {sessions.data.map(s => (
          <Session key={s.id} logout={logoutById} {...s} />
        ))}
      </ul>
      <Button
        size="small"
        className="mb-2"
        onClick={logoutAll}
        loading={loggingOutAll === LoggingOutStatus.Loading}>
        Logout Other Sessions
      </Button>
    </>
  )
}

const mapStateToProps = (state: IState) => ({
  sessions: state.user.sessions,
  loggingOutAll: state.user.loggingOutAllSessionsStatus
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingSessions(dispatch),
  logoutById: loggingOutSessionById(dispatch),
  logoutAll: loggingOutAllSessions(dispatch)
})

const SessionList = connect(
  mapStateToProps,
  mapDispatchToProps
)(SessionListBasic)

export default function Sessions() {
  return (
    <>
      <h1 className="fs-6">Sessions</h1>
      <SessionList />
    </>
  )
}
