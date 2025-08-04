import { CoverageData, CoverageReport, ChangedFile } from './types';
export declare class CoverageReporter {
    generateReport(coverageData: CoverageData, changedFiles: ChangedFile[]): CoverageReport;
    generateMarkdownReport(report: CoverageReport): string;
    private calculateSummary;
    private getCoverageStatus;
}
