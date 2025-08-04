import { CoverageData, FileCoverage, LcovParseResult } from './types'
import { promisify } from 'util'

// lcov-parse is a CommonJS module that exports a function directly
const lcovParse = require('lcov-parse')
const parseAsync = promisify(lcovParse)

export class LcovParser {
  async parse(lcovFilePath: string): Promise<CoverageData> {
    try {
      const parseResults = await parseAsync(lcovFilePath) as LcovParseResult[]
      const coverageData: CoverageData = {}

      for (const result of parseResults) {
        const fileCoverage: FileCoverage = {
          file: result.file,
          lines: {
            found: result.lines.found,
            hit: result.lines.hit
          },
          functions: {
            found: result.functions.found,
            hit: result.functions.hit
          },
          branches: {
            found: result.branches?.found || 0,
            hit: result.branches?.hit || 0
          }
        }

        coverageData[result.file] = fileCoverage
      }

      return coverageData
    } catch (error) {
      throw new Error(`Failed to parse LCOV file: ${error}`)
    }
  }
}
