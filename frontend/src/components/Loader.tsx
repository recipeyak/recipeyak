function Loader({ className = "" }) {
  return (
    <div className={"d-flex justify-content-center " + className}>
      <div className="ball-grid-pulse grid-entire-row justify-self-center">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  )
}

export default Loader
