// https://stackoverflow.com/a/50136346
type GetComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never

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

/** Extract arguments from a function
 *
 * This is based on ReturnType
 */
// tslint:disable-next-line:no-any
type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never

// from https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#improved-control-over-mapped-type-modifiers
type Mutable<T> = { -readonly [P in keyof T]-?: T[P] }

type TeamID = number | "personal"
