import * as core from '@actions/core'
import * as github from '@actions/github'
import artifact from '@actions/artifact'
import { Context } from '@actions/github/lib/context'
import { LcovParser } from './LcovParser'
import { CoverageReporter } from './CoverageReporter'
import { GitHubService } from './GitHubService'
import { CoverageData, ActionInputs } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class PrTestCoverageAction {
  private readonly inputs: ActionInputs
  private readonly context: Context
  private readonly githubService: GitHubService
  private readonly lcovParser: LcovParser
  private readonly coverageReporter: CoverageReporter

  constructor(inputs: ActionInputs, context: Context) {
    this.inputs = inputs
    this.context = context
    this.githubService = new GitHubService(inputs.githubToken, context)
    this.lcovParser = new LcovParser()
    this.coverageReporter = new CoverageReporter()
  }

  async execute(): Promise<void> {
    core.info('Starting PR Test Coverage Action...')

    // Validate that we're running in a PR context
    if (!this.context.payload.pull_request) {
      throw new Error('This action can only be run on pull request events')
    }

    // Change to working directory if specified
    if (this.inputs.workingDirectory) {
      process.chdir(this.inputs.workingDirectory)
      core.info(`Changed working directory to: ${this.inputs.workingDirectory}`)
    }

    // Parse LCOV file
    const lcovPath = path.resolve(this.inputs.lcovFile)
    if (!fs.existsSync(lcovPath)) {
      throw new Error(`LCOV file not found: ${lcovPath}`)
    }

    core.info(`Parsing LCOV file: ${lcovPath}`)
    const coverageData = await this.lcovParser.parse(lcovPath)

    // Get changed files from PR
    core.info('Getting changed files from PR...')
    const changedFiles = await this.githubService.getChangedFiles()
    core.info(`Found ${changedFiles.length} changed files`)

    // Generate coverage report
    core.info('Generating coverage report...')
    const report = this.coverageReporter.generateReport(coverageData, changedFiles)

    // Check coverage thresholds
    this.checkCoverageThresholds(report)

    // Post or update PR comment
    core.info('Posting coverage report to PR...')
    const commentBody = this.coverageReporter.generateMarkdownReport(report)
    await this.githubService.postOrUpdateComment(commentBody, this.inputs.updateComment)

    // Upload artifact if requested
    if (this.inputs.artifactName) {
      core.info(`Uploading coverage artifact: ${this.inputs.artifactName}`)
      await this.uploadArtifact()
    }

    core.info('PR Test Coverage Action completed successfully!')
  }

  private checkCoverageThresholds(report: any): void {
    // Check all files coverage threshold
    if (this.inputs.allFilesMinimumCoverage > 0) {
      const allFilesCoverage = report.allFiles.linesCoverage
      if (allFilesCoverage < this.inputs.allFilesMinimumCoverage) {
        throw new Error(
          `All files coverage (${allFilesCoverage.toFixed(1)}%) is below minimum threshold (${this.inputs.allFilesMinimumCoverage}%)`
        )
      }
    }

    // Check changed files coverage threshold
    if (this.inputs.changedFilesMinimumCoverage > 0) {
      const changedFilesCoverage = report.changedFiles.linesCoverage
      if (changedFilesCoverage < this.inputs.changedFilesMinimumCoverage) {
        throw new Error(
          `Changed files coverage (${changedFilesCoverage.toFixed(1)}%) is below minimum threshold (${this.inputs.changedFilesMinimumCoverage}%)`
        )
      }
    }
  }

  private async uploadArtifact(): Promise<void> {
    try {
      const files = [this.inputs.lcovFile]
      
      const { id, size } = await artifact.uploadArtifact(
        this.inputs.artifactName,
        files,
        process.cwd(), // rootDirectory
        {
          retentionDays: 30 // Default retention period
        }
      )
      
      core.info(`Successfully uploaded artifact: ${this.inputs.artifactName} (ID: ${id}, Size: ${size} bytes)`)
    } catch (error) {
      core.warning(`Failed to upload artifact: ${error}`)
    }
  }
}
