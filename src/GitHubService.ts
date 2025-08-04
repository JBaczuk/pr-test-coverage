import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import { ChangedFile } from './types'

export class GitHubService {
  private readonly octokit: ReturnType<typeof github.getOctokit>
  private readonly context: Context
  private readonly commentIdentifier = '<!-- PR Test Coverage Report -->'

  constructor(githubToken: string, context: Context) {
    this.octokit = github.getOctokit(githubToken)
    this.context = context
  }

  async getChangedFiles(): Promise<ChangedFile[]> {
    const pullRequest = this.context.payload.pull_request
    if (!pullRequest) {
      throw new Error('No pull request found in context')
    }

    try {
      const { data: files } = await this.octokit.rest.pulls.listFiles({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        pull_number: pullRequest.number,
        per_page: 100
      })

      const changedFiles = files.map(file => ({
        filename: file.filename,
        status: file.status
      }))
      
      // Log all changed files for debugging
      core.info(`All changed files (${changedFiles.length}):`)      
      changedFiles.forEach((file, index) => {
        core.info(`  ${index + 1}. ${file.filename} (${file.status})`)
      })
      
      return changedFiles
    } catch (error) {
      core.error(`Failed to get changed files: ${error}`)
      throw new Error(`Failed to get changed files: ${error}`)
    }
  }

  async postOrUpdateComment(commentBody: string, shouldUpdate: boolean): Promise<void> {
    const pullRequest = this.context.payload.pull_request
    if (!pullRequest) {
      throw new Error('No pull request found in context')
    }

    const fullCommentBody = `${this.commentIdentifier}\n${commentBody}`

    try {
      if (shouldUpdate) {
        // Try to find and update existing comment
        const existingComment = await this.findExistingComment()
        if (existingComment) {
          await this.octokit.rest.issues.updateComment({
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            comment_id: existingComment.id,
            body: fullCommentBody
          })
          core.info(`Updated existing comment (ID: ${existingComment.id})`)
          return
        }
      }

      // Create new comment
      await this.octokit.rest.issues.createComment({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: pullRequest.number,
        body: fullCommentBody
      })
      core.info('Created new comment')
    } catch (error) {
      core.error(`Failed to post/update comment: ${error}`)
      throw new Error(`Failed to post/update comment: ${error}`)
    }
  }

  private async findExistingComment(): Promise<{ id: number } | null> {
    const pullRequest = this.context.payload.pull_request
    if (!pullRequest) {
      return null
    }

    try {
      const { data: comments } = await this.octokit.rest.issues.listComments({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: pullRequest.number,
        per_page: 100
      })

      const existingComment = comments.find(comment => 
        comment.body?.includes(this.commentIdentifier)
      )

      return existingComment ? { id: existingComment.id } : null
    } catch (error) {
      core.warning(`Failed to find existing comment: ${error}`)
      return null
    }
  }
}
