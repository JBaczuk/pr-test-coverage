import { DirectoryNode } from './DirectoryStructure';
export declare class MarkdownTableGenerator {
    generateTable(directoryTree: DirectoryNode | null): string;
    private generateTableRows;
    private getIndentation;
    private padName;
}
