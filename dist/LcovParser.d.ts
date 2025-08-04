import { CoverageData } from './types';
export declare class LcovParser {
    parse(lcovFilePath: string): Promise<CoverageData>;
}
