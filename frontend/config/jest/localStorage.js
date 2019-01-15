// https://stackoverflow.com/a/41434763
class LocalStorageMock {
  constructor() {
    /** @type {{ [key: string]: string}} key */
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  /** @param {string} key */
  getItem(key) {
    return this.store[key] || null
  }

  /** @param {string} key @param {string} value */
  setItem(key, value) {
    this.store[key] = value.toString()
  }

  /** @param {string} key */
  removeItem(key) {
    delete this.store[key]
  }
}

// @ts-ignore
global.localStorage = new LocalStorageMock()
