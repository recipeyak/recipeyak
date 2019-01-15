#!/usr/bin/env node

const fs = require("fs")
const puppeteer = require("puppeteer")

const HELP = `usage: ./crawl.js url [file]`

/** @param {string} filename
 *  @param {string} content
 */
function writeFile(filename, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, content, err => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

async function main() {
  // we slice off the `node` binary and the script filename
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.error(HELP)
    process.exit(1)
  }
  const URL = args[0]
  const filename = args.length === 2 ? args[1] : null

  // we run as root since, 'Running as root without --no-sandbox is not supported.
  // See https://crbug.com/638180.'
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] })
  const page = await browser.newPage()
  await page.goto(URL)
  const content = await page.content()

  if (filename) {
    try {
      await writeFile(filename, content)
    } catch (e) {
      console.error(e)
      await browser.close()
      process.exit(1)
    }
  } else {
    console.log(content)
  }

  await browser.close()
  process.exit(0)
}

main()
