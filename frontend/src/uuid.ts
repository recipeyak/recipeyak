// https://stackoverflow.com/a/2117523/3720597
export const uuid4 = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    // tslint:disable-next-line:no-bitwise
    const r = (Math.random() * 16) | 0
    // tslint:disable-next-line:no-bitwise
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })

/**
 * Generate a random 32bit number
 *
 * **Note:** We are limited to 32bit ints because of JS. An int UUID must be
 * 128 bits, so this is not considered unique, however, for our frontend
 * purposes, it is acceptable
 *
 * @example
 *
 * const id = random32Id()
 *
 * const pendingRecipe = {
 *  ...existingRecipe,
 *  id,
 *  pending: true
 * }
 *
 */
export const random32Id = () => crypto.getRandomValues(new Uint32Array(1))[0]
