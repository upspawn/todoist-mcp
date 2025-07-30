# Contributing to Todoist MCP

Thank you for your interest in contributing to the Todoist MCP server! This document provides guidelines and information about contributing to this project.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/todoist-mcp.git
   cd todoist-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   # Copy example environment file
   cp .env.example .env
   # Edit .env with your Todoist API token
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Start development**
   ```bash
   npm run dev
   ```

## Code Standards

### TypeScript
- Use strict TypeScript settings (already configured)
- Avoid `any` types - find appropriate specific types
- Use proper JSDoc comments for public APIs

### Code Style
- We use ESLint and Prettier for code formatting
- Run `npm run lint` to check for issues
- Run `npm run format` to auto-format code
- All code must pass linting before submission

### Testing
- Write unit tests for all new functionality
- Maintain test coverage above 80% (configured in Jest)
- Write integration tests for API interactions
- Test error conditions and edge cases

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code standards above
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new functionality"
   ```
   
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test changes
   - `ci:` for CI/CD changes

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then create a pull request on GitHub.

## CI/CD Pipeline

Our comprehensive CI pipeline includes:

### Main CI (`ci.yml`)
- **Linting & Formatting**: ESLint and Prettier checks
- **Multi-version Testing**: Tests on Node.js 18, 20, and 22
- **Type Checking**: TypeScript compilation verification
- **Build Verification**: Ensures the project builds correctly
- **Integration Testing**: Tests the built package
- **Coverage Reporting**: Uploads coverage to Codecov

### Code Quality (`code-quality.yml`)
- **Security Audit**: npm audit for vulnerabilities
- **CodeQL Analysis**: GitHub's security analysis
- **Dependency Review**: Checks for risky dependencies
- **Coverage Reporting**: Detailed coverage analysis
- **Bundle Size Analysis**: Monitors package size

### Release (`release.yml`)
- **Automated Releases**: On version tags
- **npm Publishing**: Automatic package publishing
- **Docker Images**: Multi-platform container builds
- **GitHub Releases**: With auto-generated release notes

### Dependency Management
- **Dependabot**: Automated dependency updates
- **Weekly Reports**: Outdated dependency notifications
- **Stale Issue Management**: Automatic issue cleanup

## Project Structure

```
src/
├── handlers/           # MCP tool handlers
├── services/          # External service integrations
├── types/             # TypeScript type definitions
└── utils/             # Utility functions

tests/
├── unit/              # Unit tests
└── integration/       # Integration tests

docs/                  # Project documentation
```

## Todoist API Guidelines

When working with Todoist integration:

1. **Rate Limiting**: Respect Todoist's rate limits
2. **Error Handling**: Handle API errors gracefully
3. **Data Validation**: Use Zod schemas for validation
4. **Caching**: Consider caching strategies for performance

## MCP Protocol Compliance

Ensure all changes maintain MCP protocol compliance:

1. **Tool Definitions**: Follow MCP tool specification
2. **Resource Schemas**: Properly define resource types
3. **Error Responses**: Use standard MCP error formats
4. **JSON-RPC**: Maintain proper JSON-RPC message format

## Getting Help

- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the `docs/` directory

## Code Review

All submissions require review. We may ask for changes before merging. The CI pipeline must pass, and all tests must be green.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.