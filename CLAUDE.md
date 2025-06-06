# CLAUDE.md - AI Assistant Usage Guide

> **Purpose**: This file documents how Claude AI assistant is used in this project, including workflows, preferences, and integration patterns. This helps maintain consistency across development sessions and serves as a reference for team members.

## 📋 Quick Reference

### Project Context

- **Project Type**: UI Component Library
- **Tech Stack**: Preact 10, TypeScript, Vite, Storybook
- **Architecture**: Collection of UI components and their styles
- **Usage**: Installable components; or Styles only; or both

### AI Assistant Role

- Code review and optimization suggestions
- Documentation generation and maintenance
- Debugging assistance and error analysis
- Architecture design discussions
- Test case generation
- UI design and development suggestions

## 🔧 Cursor IDE Integration

### .cursor/ Directory Structure

```
.cursor/
├── docs/              # Project documentation for AI context
├── rules/             # Coding standards and conventions
└── prompts/           # Reusable prompt templates
```

### Usage Instructions

1. **Context Loading**: Claude automatically reads `.cursor/docs/` for project context
2. **Rule Enforcement**: Coding standards from `.cursor/rules/` are applied during code reviews
3. **Prompt Templates**: Use `.cursor/prompts/` for consistent interaction patterns

## 🎯 Development Workflows

### Code Review Process

```markdown
# When requesting code review:

1. Provide the file path and function/component name
2. Include any specific concerns or requirements
3. Reference relevant architecture decisions from .cursor/docs/
4. Ask for suggestions based on .cursor/rules/ standards

Example: "Review the Button.ts component state logic, focusing on accessibility best practices."
```

### Debugging Workflow

```markdown
# When debugging:

1. Share error logs with context
2. Provide relevant code snippets
3. Include steps to reproduce
4. Reference similar issues from project history

Example: "Getting error during component rendering. Here's the stack trace ..."
```

### Documentation Generation

```markdown
# For documentation tasks:

1. Specify target audience (developers, users, designers)
2. Include existing doc structure for consistency
3. Reference .cursor/docs/ for context and standards
4. Request specific formats (JSDoc, README, API docs)
```

## 📝 Coding Preferences & Standards

### Code Style

- **Language**: TypeScript preferred, JavaScript when necessary. See `tsconfig.json` for details
- **Formatting**: Prettier with 2-space indentation. See `.prettierrc` for details
- **Linting**: ESLint default config + custom rules. See `eslint.config.js` for details
- **Comments**: JSDoc for public APIs, inline for complex logic

### Architecture Patterns

- **Frontend**: Component composition, custom hooks, context for state
- **Testing**: Jest + React Testing Library, integration tests for APIs

### Error Handling

Refer to rules under `.cursor/rules/`.

## 🧪 Testing Strategy

### Test Types & Coverage

- **Unit Tests**: 100%+ coverage for components and utilities

### Test Writing Guidelines

Here is preferred test structure, comments are just for demonstration:

```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

// Import the component to be tested
import { Button } from './Button';

describe('Button Component', () => {
  it('should render the button with the correct label', () => {
    // Arrange
    render(<Button label="Click Me" />);

    // Act
    const buttonElement = screen.getByRole('button', { name: /click me/i });

    // Assert
    expect(buttonElement).toBeInTheDocument();
  });
});
```

## 📚 Documentation Standards

### README Structure

1. Project overview and setup instructions
2. Architecture diagram and tech stack
3. Development workflow and contribution guidelines
4. Deployment and environment configuration
5. API documentation links

### Code Documentation

- **Functions**: JSDoc with @param, @returns, @throws
- **Classes**: Purpose, usage examples, constructor params
- **Modules**: Overview comment explaining responsibility
- **Complex Logic**: Inline comments explaining "why" not "what"

## 🚀 Deployment & DevOps

### Environment Management

- **Development**: Local Docker Compose setup

### CI/CD Pipeline

1. **Lint & Test**: ESLint, TypeScript check, Jest tests
2. **Build**: Vite & Storybook build

## 🔍 Common Tasks & Examples

### Adding New Feature

```markdown
1. "Help me design a user notification system"
2. "Generate tests for the Button component"
```

### Performance Optimization

```markdown
1. "Analyze this React component for performance issues"
2. "Review bundle size and recommend splitting strategies"
```

### Security Review

```markdown
1. "Audit authentication middleware for vulnerabilities"
2. "Review data validation in user input handlers"
```

## 📋 Project-Specific Context

### Business Logic Rules

- Minimal inner logic, focus on UI and styles

### Technical Constraints

- Support ECMAScript 2022

## 🔄 Regular Maintenance

### Weekly Tasks

- Dependency updates and security patches
- Performance metrics review
- Error log analysis and fixes
- Test coverage reports

### Monthly Tasks

- Architecture review and refactoring opportunities
- Documentation updates and link checks
- Security audit
- Accessibility audit
