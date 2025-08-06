import * as path from 'path'

export interface FileDetail {
  file: string
  lines: {
    hit: number
    total: number
    percentage: number
  }
  functions: {
    hit: number
    total: number
    percentage: number
  }
  branches: {
    hit: number
    total: number
    percentage: number
  }
}

export interface CoverageStats {
  lines: {
    hit: number
    total: number
    percentage: number
  }
  functions: {
    hit: number
    total: number
    percentage: number
  }
  branches: {
    hit: number
    total: number
    percentage: number
  }
}

export interface DirectoryNode {
  name: string
  isDirectory: boolean
  children: DirectoryNode[]
  coverage: CoverageStats
  fileDetail?: FileDetail
}

export class DirectoryStructure {
  buildDirectoryTree(fileDetails: FileDetail[]): DirectoryNode | null {
    if (fileDetails.length === 0) {
      return null
    }

    // Create a map to store directory nodes by their full path
    const nodeMap = new Map<string, DirectoryNode>()
    const rootNodes = new Set<string>()

    // Process each file and create directory structure
    for (const fileDetail of fileDetails) {
      const filePath = fileDetail.file
      const pathParts = filePath.split(path.sep).filter(part => part !== '')
      
      // Track the root directory
      if (pathParts.length > 0) {
        rootNodes.add(pathParts[0])
      }

      // Create nodes for each path segment
      for (let i = 0; i < pathParts.length; i++) {
        const currentPath = pathParts.slice(0, i + 1).join(path.sep)
        const isFile = i === pathParts.length - 1
        const nodeName = pathParts[i]

        if (!nodeMap.has(currentPath)) {
          const node: DirectoryNode = {
            name: nodeName,
            isDirectory: !isFile,
            children: [],
            coverage: {
              lines: { hit: 0, total: 0, percentage: 0 },
              functions: { hit: 0, total: 0, percentage: 0 },
              branches: { hit: 0, total: 0, percentage: 0 }
            },
            fileDetail: isFile ? fileDetail : undefined
          }

          // If this is a file, copy its coverage data
          if (isFile) {
            node.coverage = {
              lines: { ...fileDetail.lines },
              functions: { ...fileDetail.functions },
              branches: { ...fileDetail.branches }
            }
          }

          nodeMap.set(currentPath, node)
        }

        // Establish parent-child relationships
        if (i > 0) {
          const parentPath = pathParts.slice(0, i).join(path.sep)
          const parentNode = nodeMap.get(parentPath)
          const currentNode = nodeMap.get(currentPath)
          
          if (parentNode && currentNode && !parentNode.children.includes(currentNode)) {
            parentNode.children.push(currentNode)
          }
        }
      }
    }

    // Calculate aggregated statistics for directories (bottom-up)
    this.calculateDirectoryStats(nodeMap)

    // Sort all children alphabetically
    this.sortChildren(nodeMap)

    // Determine the root structure
    if (rootNodes.size === 1) {
      // Single root directory
      const rootName = Array.from(rootNodes)[0]
      return nodeMap.get(rootName) || null
    } else {
      // Multiple root directories - create virtual root
      const virtualRoot: DirectoryNode = {
        name: '',
        isDirectory: true,
        children: [],
        coverage: {
          lines: { hit: 0, total: 0, percentage: 0 },
          functions: { hit: 0, total: 0, percentage: 0 },
          branches: { hit: 0, total: 0, percentage: 0 }
        }
      }

      // Add all root directories as children
      for (const rootName of Array.from(rootNodes).sort()) {
        const rootNode = nodeMap.get(rootName)
        if (rootNode) {
          virtualRoot.children.push(rootNode)
        }
      }

      // Calculate stats for virtual root
      virtualRoot.coverage = this.aggregateStats(virtualRoot.children)

      return virtualRoot
    }
  }

  private calculateDirectoryStats(nodeMap: Map<string, DirectoryNode>): void {
    // Get all paths sorted by depth (deepest first) to ensure bottom-up calculation
    const pathsByDepth = Array.from(nodeMap.keys())
      .sort((a, b) => {
        const aDepth = a.split(path.sep).length
        const bDepth = b.split(path.sep).length
        return bDepth - aDepth // Deepest first
      })

    // Calculate stats bottom-up for directories
    for (const nodePath of pathsByDepth) {
      const node = nodeMap.get(nodePath)!
      if (node.isDirectory && node.children.length > 0) {
        node.coverage = this.aggregateStats(node.children)
      }
    }
  }

  private aggregateStats(children: DirectoryNode[]): CoverageStats {
    const totals = children.reduce(
      (acc, child) => ({
        linesHit: acc.linesHit + child.coverage.lines.hit,
        linesTotal: acc.linesTotal + child.coverage.lines.total,
        functionsHit: acc.functionsHit + child.coverage.functions.hit,
        functionsTotal: acc.functionsTotal + child.coverage.functions.total,
        branchesHit: acc.branchesHit + child.coverage.branches.hit,
        branchesTotal: acc.branchesTotal + child.coverage.branches.total
      }),
      {
        linesHit: 0,
        linesTotal: 0,
        functionsHit: 0,
        functionsTotal: 0,
        branchesHit: 0,
        branchesTotal: 0
      }
    )

    return {
      lines: {
        hit: totals.linesHit,
        total: totals.linesTotal,
        percentage: totals.linesTotal > 0 ? Math.round((totals.linesHit / totals.linesTotal) * 1000) / 10 : 0
      },
      functions: {
        hit: totals.functionsHit,
        total: totals.functionsTotal,
        percentage: totals.functionsTotal > 0 ? Math.round((totals.functionsHit / totals.functionsTotal) * 1000) / 10 : 0
      },
      branches: {
        hit: totals.branchesHit,
        total: totals.branchesTotal,
        percentage: totals.branchesTotal > 0 ? Math.round((totals.branchesHit / totals.branchesTotal) * 1000) / 10 : 0
      }
    }
  }

  private sortChildren(nodeMap: Map<string, DirectoryNode>): void {
    for (const node of nodeMap.values()) {
      if (node.children.length > 0) {
        node.children.sort((a, b) => a.name.localeCompare(b.name))
      }
    }
  }
}
