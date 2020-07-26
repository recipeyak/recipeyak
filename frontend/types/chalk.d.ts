declare module "chalk" {
  type fn = (...string: (string | undefined)[]) => string
  /* eslint-disable init-declarations*/
  export const yellow: fn
  export const red: fn
  export const cyan: fn
  export const green: fn
  export const dim: fn
  /* eslint-enable init-declarations */
}
