# @enonic/ui

A modern UI component library built with Preact/React, TypeScript, and Tailwind CSS.

## Installation

#### NPM

```bash
npm install @enonic/ui
```

#### PNPM

```bash
pnpm add @enonic/ui
```

#### Yarn

```bash
yarn add @enonic/ui
```

## Usage

### Import Components

```tsx
import { Button, IconButton, Input } from '@enonic/ui';
import '@enonic/ui/style.css';

function App() {
  return (
    <div>
      <Button variant='primary' size='md'>
        Click Me
      </Button>
      <Input placeholder='Enter text...' />
    </div>
  );
}
```

### Import Styles Only

If you only need the CSS styles:

```css
@import '@enonic/ui/style.css';
```

## Components

- **Button** - Versatile button component with multiple variants and sizes
- **IconButton** - Button component optimized for icon usage
- **Input** - Form input component with built-in validation states

## Peer Dependencies

This library requires one of the following frameworks:

### React

```json
{
  "react": ">=18.0.0 || >=19.0.0",
  "react-dom": ">=18.0.0 || >=19.0.0"
}
```

### Preact

```json
{
  "preact": ">=10.0.0",
  "@preact/compat": ">=17.0.0 || >=18.0.0"
}
```

### Icon Libraries (Optional)

- `lucide-react` (>=0.300.0) - For React projects
- `lucide-preact` (>=0.300.0) - For Preact projects

## Features

- 🎨 Built with Tailwind CSS for easy customization
- 📦 Tree-shakeable ES modules
- 🔧 TypeScript support out of the box
- ⚡ Optimized bundle size
- 🎯 Framework agnostic (React/Preact)
- ♿ Accessibility-first components

## Development

```bash
# Install dependencies
pnpm install

# Start development server with Storybook
pnpm dev

# Build the library
pnpm build

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Check bundle size
pnpm size
```

## License

MIT
