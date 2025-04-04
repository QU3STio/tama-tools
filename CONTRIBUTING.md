# Contributing to tama-tools

Thank you for your interest in contributing to tama-tools! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

If you find a bug in the code, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior and what actually happened
- Code samples or error messages if applicable
- Your environment (OS, Node.js version, etc.)

### Suggesting Enhancements

For feature requests or improvements:

- Use a clear, descriptive title
- Provide a detailed description of the suggested enhancement
- Include examples of how the feature would be used
- Explain why this enhancement would be useful to most users

### Pull Requests

We welcome pull requests! To contribute code:

1. Fork the repository
2. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Add or update tests as necessary
5. Make sure your code follows the coding standards
6. Update documentation if needed
7. Submit a pull request

## Development Guidelines

### Project Structure

Please follow the existing project structure:

```
tama-tools/
├── docs/                       # Documentation
├── src/                        # Source code
│   ├── token-creation/         # Token creation modules
│   ├── wallet-integration/     # Wallet integration modules
│   ├── utils/                  # Utility functions
│   └── shared/                 # Shared resources
└── README.md
```

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style and formatting
- Add JSDoc comments for all public functions, classes, and interfaces
- Keep functions focused on a single responsibility
- Use meaningful variable and function names

### Documentation

- Update README files when adding new features
- Document function parameters and return values
- Include examples of how to use your new code
- Update the main README.md if necessary

### Testing

- Test your code on both mainnet and Saigon testnet
- Verify that existing functionality works with your changes
- Add console logs where appropriate for better debugging

## Example Contribution Workflow

1. Find an issue to work on or create a new one
2. Comment on the issue to let others know you're working on it
3. Fork the repository and create a branch
4. Make your changes following the guidelines above
5. Test your changes
6. Submit a pull request
7. Address any feedback from the review

## Updating Documentation

Documentation is just as important as code. If you find documentation that is missing or unclear, please contribute improvements.

## Questions?

If you have questions about contributing, feel free to open an issue with the label "question".

Thank you for helping improve tama-tools for the tama meme community! 