import { CoverageData, CoverageReport, ChangedFile } from './types';
export declare class CoverageReporter {
    private readonly allFilesMinimumCoverage;
    private readonly changedFilesMinimumCoverage;
    constructor(allFilesMinimumCoverage?: number, changedFilesMinimumCoverage?: number);
    generateReport(coverageData: CoverageData, changedFiles: ChangedFile[]): CoverageReport;
    generateMarkdownReport(report: CoverageReport): string;
    private calculateSummary;
    private getCoverageStatus;
}
