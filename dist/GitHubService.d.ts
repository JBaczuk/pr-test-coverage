import { Context } from '@actions/github/lib/context';
import { ChangedFile } from './types';
export declare class GitHubService {
    private static readonly FILES_PER_PAGE;
    private static readonly COMMENTS_PER_PAGE;
    private readonly octokit;
    private readonly context;
    private readonly commentIdentifier;
    constructor(githubToken: string, context: Context);
    getChangedFiles(): Promise<ChangedFile[]>;
    postOrUpdateComment(commentBody: string, shouldUpdate: boolean): Promise<void>;
    private findExistingComment;
}
