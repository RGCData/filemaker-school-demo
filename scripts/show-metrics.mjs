import { readFile } from "node:fs/promises"

const reportUrl = new URL("../../alex.txt", import.meta.url)

try {
  const report = await readFile(reportUrl, "utf8")
  const marker = "FINAL ROUND-UP - 2026-08-15"
  const start = report.indexOf(marker)

  if (start === -1) {
    throw new Error("The final metrics section was not found in alex.txt.")
  }

  console.log(report.slice(start).trim())
} catch (error) {
  console.error(`Unable to read model metrics: ${error.message}`)
  process.exitCode = 1
}
