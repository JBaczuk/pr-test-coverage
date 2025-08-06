export interface FileDetail {
    file: string;
    lines: {
        hit: number;
        total: number;
        percentage: number;
    };
    functions: {
        hit: number;
        total: number;
        percentage: number;
    };
    branches: {
        hit: number;
        total: number;
        percentage: number;
    };
}
export interface CoverageStats {
    lines: {
        hit: number;
        total: number;
        percentage: number;
    };
    functions: {
        hit: number;
        total: number;
        percentage: number;
    };
    branches: {
        hit: number;
        total: number;
        percentage: number;
    };
}
export interface DirectoryNode {
    name: string;
    isDirectory: boolean;
    children: DirectoryNode[];
    coverage: CoverageStats;
    fileDetail?: FileDetail;
}
export declare class DirectoryStructure {
    buildDirectoryTree(fileDetails: FileDetail[]): DirectoryNode | null;
    private calculateDirectoryStats;
    private aggregateStats;
    private sortChildren;
}
