import { Context } from '@actions/github/lib/context';
import { ActionInputs } from './types';
export declare class PrTestCoverageAction {
    private readonly inputs;
    private readonly context;
    private readonly githubService;
    private readonly lcovParser;
    private readonly coverageReporter;
    constructor(inputs: ActionInputs, context: Context);
    execute(): Promise<void>;
    private checkCoverageThresholds;
    private uploadArtifact;
}
