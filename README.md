# @enonic/ui

A modern UI component library built with Preact/React, TypeScript, and Tailwind CSS.

## Installation

#### pnpm

#### With React

```bash
pnpm add @enonic/ui react react-dom @radix-ui/react-slot focus-trap-react
```

#### With Preact

```bash
pnpm add @enonic/ui preact @radix-ui/react-slot focus-trap-react
```

<details>
<summary><b>npm</b></summary>

#### With React

```bash
npm install @enonic/ui react react-dom @radix-ui/react-slot focus-trap-react
```

#### With Preact

```bash
npm install @enonic/ui preact @radix-ui/react-slot focus-trap-react
```

</details>

<details>
<summary><b>Yarn</b></summary>

#### With React

```bash
yarn add @enonic/ui react react-dom @radix-ui/react-slot focus-trap-react
```

#### With Preact

```bash
yarn add @enonic/ui preact @radix-ui/react-slot focus-trap-react
```

</details>

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
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@radix-ui/react-slot": "^1.2.0",
  "focus-trap-react": "^11.0.0"
}
```

### Preact

```json
{
  "preact": ">=10.0.0",
  "@radix-ui/react-slot": "^1.2.0",
  "focus-trap-react": "^11.0.0"
}
```

### Icon Libraries (Optional)

The library uses and expects one of the following icon libraries to be used to provide icons for the components:

- `lucide-react` (>=0.500.0) - For React projects
- `lucide-preact` (>=0.500.0) - For Preact projects

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
