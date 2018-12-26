import { RootState } from "@/store/store"

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state")

    if (serializedState === null) {
      return undefined
    }
    // We don't serialize all the state
    return JSON.parse(serializedState) as Partial<RootState>
  } catch (err) {
    return undefined
  }
}

export const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem("state", serializedState)
  } catch (err) {} // tslint:disable-line:no-empty
}
