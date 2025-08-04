import { CoverageData, CoverageReport, CoverageSummary, ChangedFile } from './types'
import * as core from '@actions/core'
import * as path from 'path'

export class CoverageReporter {
  generateReport(coverageData: CoverageData, changedFiles: ChangedFile[]): CoverageReport {
    const allFiles = this.calculateSummary(Object.values(coverageData))
    
    // Debug logging
    core.info(`Total files in LCOV: ${Object.keys(coverageData).length}`)
    core.info(`Changed files: ${changedFiles.length}`)
    
    // Log first few file paths for debugging
    const lcovFiles = Object.keys(coverageData).slice(0, 5)
    const changedFilePaths = changedFiles.slice(0, 5).map(f => f.filename)
    core.info(`Sample LCOV files: ${lcovFiles.join(', ')}`)
    core.info(`Sample changed files: ${changedFilePaths.join(', ')}`)
    
    // Filter coverage data for changed files only
    const changedFileCoverage = changedFiles
      .map(file => {
        const coverage = coverageData[file.filename]
        if (!coverage) {
          core.debug(`No coverage found for changed file: ${file.filename}`)
        }
        return coverage
      })
      .filter(coverage => coverage !== undefined)
    
    core.info(`Found coverage for ${changedFileCoverage.length} out of ${changedFiles.length} changed files`)
    
    const changedFilesSummary = this.calculateSummary(changedFileCoverage)
    
    // Generate file details for changed files, ordered by directory
    const fileDetails = changedFiles
      .filter(file => coverageData[file.filename])
      .map(file => {
        const coverage = coverageData[file.filename]
        return {
          file: file.filename,
          lines: {
            hit: coverage.lines.hit,
            total: coverage.lines.found,
            percentage: coverage.lines.found > 0 ? (coverage.lines.hit / coverage.lines.found) * 100 : 0
          },
          functions: {
            hit: coverage.functions.hit,
            total: coverage.functions.found,
            percentage: coverage.functions.found > 0 ? (coverage.functions.hit / coverage.functions.found) * 100 : 0
          },
          branches: {
            hit: coverage.branches.hit,
            total: coverage.branches.found,
            percentage: coverage.branches.found > 0 ? (coverage.branches.hit / coverage.branches.found) * 100 : 0
          }
        }
      })
      .sort((a, b) => {
        const dirA = path.dirname(a.file)
        const dirB = path.dirname(b.file)
        if (dirA !== dirB) {
          return dirA.localeCompare(dirB)
        }
        return a.file.localeCompare(b.file)
      })

    return {
      allFiles,
      changedFiles: changedFilesSummary,
      fileDetails
    }
  }

  generateMarkdownReport(report: CoverageReport): string {
    const allFilesStatus = this.getCoverageStatus(report.allFiles.linesCoverage)
    const changedFilesStatus = this.getCoverageStatus(report.changedFiles.linesCoverage)

    let markdown = `## LCOV Report ${allFilesStatus}\n\n`
    
    // All Files Summary
    markdown += `### All Files\n`
    markdown += `- Lines: ${report.allFiles.linesHit}/${report.allFiles.linesTotal} (${report.allFiles.linesCoverage.toFixed(1)}%) ${allFilesStatus}\n`
    markdown += `- Functions: ${report.allFiles.functionsHit}/${report.allFiles.functionsTotal} (${report.allFiles.functionsCoverage.toFixed(1)}%)\n`
    markdown += `- Branches: ${report.allFiles.branchesHit}/${report.allFiles.branchesTotal} (${report.allFiles.branchesCoverage.toFixed(1)}%)\n\n`

    // Changed Files Summary
    markdown += `### Changed Files\n`
    markdown += `- Lines: ${report.changedFiles.linesHit}/${report.changedFiles.linesTotal} (${report.changedFiles.linesCoverage.toFixed(1)}%) ${changedFilesStatus}\n`
    markdown += `- Functions: ${report.changedFiles.functionsHit}/${report.changedFiles.functionsTotal} (${report.changedFiles.functionsCoverage.toFixed(1)}%)\n`
    markdown += `- Branches: ${report.changedFiles.branchesHit}/${report.changedFiles.branchesTotal} (${report.changedFiles.branchesCoverage.toFixed(1)}%)\n\n`

    // File Details Table
    if (report.fileDetails.length > 0) {
      markdown += `Files changed:\n\n`
      markdown += `| File | Lines | Line % | Functions | Function % | Branches | Branch % |\n`
      markdown += `|------|-------|--------|-----------|------------|----------|----------|\n`

      for (const file of report.fileDetails) {
        markdown += `| ${file.file} | ${file.lines.hit}/${file.lines.total} | ${file.lines.percentage.toFixed(1)}% | ${file.functions.hit}/${file.functions.total} | ${file.functions.percentage.toFixed(1)}% | ${file.branches.hit}/${file.branches.total} | ${file.branches.percentage.toFixed(1)}% |\n`
      }
    }

    return markdown
  }

  private calculateSummary(coverageArray: any[]): CoverageSummary {
    const totals = coverageArray.reduce(
      (acc, coverage) => ({
        linesTotal: acc.linesTotal + coverage.lines.found,
        linesHit: acc.linesHit + coverage.lines.hit,
        functionsTotal: acc.functionsTotal + coverage.functions.found,
        functionsHit: acc.functionsHit + coverage.functions.hit,
        branchesTotal: acc.branchesTotal + coverage.branches.found,
        branchesHit: acc.branchesHit + coverage.branches.hit
      }),
      {
        linesTotal: 0,
        linesHit: 0,
        functionsTotal: 0,
        functionsHit: 0,
        branchesTotal: 0,
        branchesHit: 0
      }
    )

    return {
      ...totals,
      linesCoverage: totals.linesTotal > 0 ? (totals.linesHit / totals.linesTotal) * 100 : 0,
      functionsCoverage: totals.functionsTotal > 0 ? (totals.functionsHit / totals.functionsTotal) * 100 : 0,
      branchesCoverage: totals.branchesTotal > 0 ? (totals.branchesHit / totals.branchesTotal) * 100 : 0
    }
  }

  private getCoverageStatus(percentage: number): string {
    return percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️' : '❌'
  }
}
