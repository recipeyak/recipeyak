// https://stackoverflow.com/a/50136346
type GetComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
