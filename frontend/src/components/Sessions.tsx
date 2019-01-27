import React from "react"
import { ISession, LoggingOutStatus } from "@/store/reducers/user"
import { distanceInWordsToNow } from "date-fns"
import { WebData, isLoading, isInitial, isFailure } from "@/webdata"
import { Button } from "@/components/Buttons"
import Loader from "@/components/Loader"
import { connect } from "react-redux"
import { RootState } from "@/store/store"
import {
  Dispatch,
  fetchingSessions,
  loggingOutSessionById,
  loggingOutAllSessions
} from "@/store/thunks"

interface ISessionProps extends ISession {
  readonly logout: (id: ISession["id"]) => void
}

function Session(props: ISessionProps) {
  const last_activity = distanceInWordsToNow(props.last_activity) + " ago"
  return (
    <li className="mb-2">
      <section className="d-flex">
        <strong className="mr-2">{props.ip}</strong>{" "}
        <Button
          size="small"
          onClick={() => props.logout(props.id)}
          loading={props.loggingOut === LoggingOutStatus.Loading}>
          Logout
        </Button>
      </section>
      <p>Last used: {last_activity}</p>
      <p>{props.device}</p>
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

class SessionListBasic extends React.Component<ISessionListProps> {
  componentDidMount() {
    this.props.fetchData()
  }
  render() {
    const { sessions, logoutAll, logoutById, loggingOutAll } = this.props

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
}

const mapStateToProps = (state: RootState) => ({
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
