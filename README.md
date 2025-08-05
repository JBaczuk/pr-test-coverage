# PR Test Coverage

A Github Action to report the test coverage of changed files in a pull request. It provides a summary of the coverage for all files and changed files separately, and a detailed table with coverage metrics per changed file.

## Features

- 📊 Generates comprehensive coverage reports from LCOV files
- 💬 Posts coverage summaries as PR comments
- 🔄 Updates existing comments or creates new ones
- 📈 Shows coverage for all files and changed files separately
- 📋 Detailed table with coverage metrics per changed file
- ⚠️ Configurable coverage thresholds with action failure
- 📦 Optional artifact upload for coverage reports
- 🎯 Supports custom working directories

## Usage

### Basic Usage

```yaml
name: Test Coverage
on:
  pull_request:
    branches: [ main ]

jobs:
  coverage:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests and generate coverage
        run: |
          # Your test commands here that generate LCOV report
          npm test -- --coverage
      
      - name: PR Test Coverage
        uses: jbaczuk/pr-test-coverage@v1
        with:
          lcov-file: coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Advanced Usage

```yaml
- name: PR Test Coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    # Required: Path to LCOV file
    lcov-file: coverage/lcov.info
    
    # Required: GitHub token for API access
    github-token: ${{ secrets.GITHUB_TOKEN }}
    
    # Optional: Working directory (default: repository root)
    working-directory: ./my-app
    
    # Optional: Minimum coverage for all files (default: 0)
    all-files-minimum-coverage: 80
    
    # Optional: Minimum coverage for changed files (default: 0)
    changed-files-minimum-coverage: 90
    
    # Optional: Upload coverage as artifact (default: empty/disabled)
    artifact-name: coverage-report
    
    # Optional: Update existing comment vs create new (default: true)
    update-comment: true
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `lcov-file` | Path to the LCOV file (e.g., `coverage/lcov.info`) | ✅ | - |
| `github-token` | GitHub token for API access and posting comments | ✅ | `${{ github.token }}` |
| `working-directory` | Working directory to run the action from | ❌ | `''` (repository root) |
| `all-files-minimum-coverage` | Minimum coverage percentage for all files (0-100) | ❌ | `0` |
| `changed-files-minimum-coverage` | Minimum coverage percentage for changed files (0-100) | ❌ | `0` |
| `artifact-name` | Name for coverage artifact upload (empty to skip) | ❌ | `''` |
| `update-comment` | Whether to update existing comment or create new one | ❌ | `true` |

## Required Permissions

The action requires the following permissions in your workflow:

```yaml
permissions:
  contents: read        # To access repository files
  pull-requests: write  # To post and update PR comments
```

## Example Output

The action will post a comment on your pull request that looks like this:

```markdown
## Coverage Report ✅

### All Files
- Lines: 847/1205 (70.3%) ✅
- Functions: 156/198 (78.8%)
- Branches: 234/298 (78.5%)

### Changed Files
- Lines: 142/165 (86.1%) ✅
- Functions: 28/32 (87.5%)
- Branches: 45/52 (86.5%)

Files changed:

| File | Lines | Line % | Functions | Function % | Branches | Branch % |
|------|-------|--------|-----------|------------|----------|----------|
| src/components/Button/Button.tsx | 24/28 | 85.7% | 4/5 | 80.0% | 8/10 | 80.0% |
| src/components/Modal/Modal.tsx | 45/52 | 86.5% | 8/9 | 88.9% | 12/15 | 80.0% |
| src/hooks/useAuth.ts | 32/35 | 91.4% | 6/7 | 85.7% | 10/12 | 83.3% |
| src/services/api/userService.ts | 28/32 | 87.5% | 7/8 | 87.5% | 11/13 | 84.6% |
| src/utils/validation.ts | 13/18 | 72.2% | 3/3 | 100.0% | 4/2 | 66.7% |
```

## Coverage Status Icons

The action uses visual indicators to quickly show coverage status:

- ✅ **Good coverage** (≥80%)
- ⚠️ **Moderate coverage** (60-79%)
- ❌ **Low coverage** (<60%)

## Failure Conditions

The action will fail if:

1. **LCOV file not found** - The specified LCOV file doesn't exist
2. **Not a pull request** - The action is not running in a PR context
3. **Coverage below threshold** - When coverage falls below specified minimums:
   - All files coverage below `all-files-minimum-coverage`
   - Changed files coverage below `changed-files-minimum-coverage`

## Supported LCOV Format

The action supports standard LCOV format with the following metrics:

- **Lines**: `LF` (lines found) and `LH` (lines hit)
- **Functions**: `FNF` (functions found) and `FNH` (functions hit)
- **Branches**: `BRF` (branches found) and `BRH` (branches hit)

## Common Integration Examples

### Node.js with Jest

```yaml
- name: Install dependencies
  run: npm ci

- name: Run tests with coverage
  run: npm test -- --coverage --coverageReporters=lcov

- name: PR Test Coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    lcov-file: coverage/lcov.info
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Python with pytest-cov

```yaml
- name: Install dependencies
  run: |
    pip install pytest pytest-cov

- name: Run tests with coverage
  run: pytest --cov=. --cov-report=lcov

- name: PR Test Coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    lcov-file: coverage.lcov
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Go with go-test-coverage

```yaml
- name: Run tests with coverage
  run: |
    go test -coverprofile=coverage.out ./...
    go tool cover -func=coverage.out -o=coverage.lcov

- name: PR Test Coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    lcov-file: coverage.lcov
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
