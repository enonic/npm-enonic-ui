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
import { Button, Input } from '@enonic/ui';

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

### Styles

#### Tailwind CSS

If your project uses Tailwind CSS, you can import the styles directly from the library:

```css
/* Import Tailwind CSS */
@import 'tailwindcss';
/* Required by some components that use animations */
@import 'tw-animate-css';

/* Preset styles (includes tokens, base, and utilities) */
@import '@enonic/ui/preset.css';
```

#### CSS Only

If you only need the pre-built CSS styles:

```css
@import '@enonic/ui/style.css';
```

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
