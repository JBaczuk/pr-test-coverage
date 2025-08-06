# Code Coverage Pull Request Report

## Summary

I need a github action adds and updates a comment on a PR a summary of the full test coverage of the entire codebase as well as a summary of the coverage of the changed files. It should also include a table with a coverage report of each changed file.

## Requirements
1. The action should be named `pr-test-coverage`.
2. The action should be versioned using semantic versioning.
3. The action should add a comment to the PR on first run.
4. The action should update the comment on subsequent runs unless the `update-comment` input is set to `false`, in which case it should add a new comment.
5. The action uses an LCOV report to generate the coverage report. It takes a LCOV report file path as input parameter `lcov-file`.
6. Create a README.md in the root of the repository with instructions on how to use the action. It should also include example output using a fictitious LCOV report not the example I give below in this prompt. It should include the permissions required:
```yaml
permissions: 
  contents: read
  pull-requests: write
```
7. The action should add a comment to the PR with the summary of the full test coverage of the entire codebase as well as a summary of the coverage of the changed files. It should also include a table with the coverage of each changed file with the following columns:
- Lines
- Line Coverage
- Functions
- Function Coverage
- Branches
- Branch Coverage
8. Optionally the action should fail if the coverage of the changed files is below the `changed-files-minimum-coverage` input parameter.
9. Optionally the action should fail if the coverage of the entire codebase is below the `all-files-minimum-coverage` input parameter.
10. Optionally the action should upload the coverage report as an artifact if the `artifact-name` input parameter is set using the value of the `artifact-name` input parameter as the artifact name.
11. Optionally the action should use the `working-directory` input parameter to specify the working directory. Default: empty (repository root)
12. The report should include the full path of each file, ordered by directory, and should include coverage of each directory where files were changed.

## Example Workflow
```yaml
- uses: jbaczuk/pr-test-coverage@v1
  with:
    # Lcov file location. For example, coverage/lcov.info
    lcov-file: coverage/lcov.info

    # Github token required for getting list of changed files and posting comments
    github-token: ${{ secrets.GITHUB_TOKEN }}
    
    # Working directory
    # Default: empty (repository root)
    working-directory:

    # All files minimum coverage in percentage. For example, 0, 50, 100
    # Default: 0
    all-files-minimum-coverage:

    # Changed files minimum coverage in percentage. For example, 0, 50, 100
    # Default: 0
    changed-files-minimum-coverage:

    # Artifact name of the generated html. Requires LCOV to be installed
    # Default: empty (skip uploading artifact)
    artifact-name:

    # Update comment
    # Default: true
    update-comment:
```

## Example PR Comment

```markdown
## Coverage Report ✅

### All Files
- Lines: 847/1205 (70.3%) ✅
- Functions: 156/198 (78.8%)
- Branches: 234/298 (78.5%)

### Changed Files
- Lines: 22/40 (55.0%) ✅
- Functions: 15/19 (78.9%)
- Branches: 24/31 (77.4%)

Files changed:

| **File** | **Lines** | **Line %** | **Functions** | **Function %** | **Branches** | **Branch %** |
|------|-------|--------|-----------|------------|----------|----------|
| **📁 src**                                        | **22/40** | **55.0%** | **15/19** | **78.9%** | **24/31** | **77.4%** |
| **&emsp; 📁 components**                          | **19/36** | **52.8%** | **12/16** | **75.0%** | **22/27** | **81.5%** |
| **&emsp;&emsp;&nbsp; 📁 Button**                  | **6/10** | **60.0%** | **4/5** | **80.0%** | **8/10** | **80.0%** |
| &emsp;&emsp;&emsp;&nbsp;&nbsp; 📄 Button.tsx      | 6/10 | 60.0% | 4/5 | 80.0% | 8/10 | 80.0% |
| **&emsp;&emsp;&nbsp; 📁 Modal**                   | **13/26** | **50.0%** | **8/11** | **72.7%** | **14/17** | **82.4%** |
| &emsp;&emsp;&emsp;&nbsp;&nbsp; 📄 Modal.tsx       | 12/24 | 50.0% | 7/10 | 70.0% | 12/15 | 80.0% |
| &emsp;&emsp;&emsp;&nbsp;&nbsp; 📄 Modal.types.ts  | 1/2   | 50.0% | 1/1 | 100.0% | 2/2   | 100.0% |
| &emsp; 📄 useValidation.ts                        | 3/4 | 75.0% | 3/3  | 100.0% | 2/4   | 50.0% |
```