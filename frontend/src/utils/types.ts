// https://stackoverflow.com/a/50136346
type GetComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

type Diff<T, U> = T extends U ? never : T

/** subtract an `interface` from another `interface`
 *
 * @example
 * interface UserPage {
 *    id: number
 *    email: string
 *    fetchData: () => void
 * }
 *
 * interface DispatchProps {
 *    fetchData: () => void
 * }
 *
 * interface StoreProps {
 *    email: string
 * }
 *
 * type Result = Minus<UserPage, DispatchProps & StoreProps>
 *
 * const foo: Result = {
 *    id: 1
 * }
 */
type Minus<T, U> = { [P in Diff<keyof T, keyof U>]: T[P] }

type TeamID = number | "personal"
