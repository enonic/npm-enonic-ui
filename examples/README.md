# Enonic UI - Examples

This directory contains live examples of the Enonic UI component library.

## Running the Examples

```bash
# Build the library and serve examples
pnpm preview

# Then open http://localhost:4000 in your browser
```

## Available Examples

- **Button** - All variants (text, filled, solid, outline) in all sizes (sm, md, lg)
- **IconButton** - Icon-only buttons in all variants and sizes
- **Input** - Various input states including:
  - Default input with label and description
  - Input with error state
  - Disabled input
  - Read-only input
  - Input with start/end addons

## Adding New Examples

To add examples for new components:

1. Import the component from `../dist/enonic-ui.es.js`
2. Create a new section in `index.html`
3. Use Preact's `h` and `render` functions to render the examples

The examples use the built library files from the `dist` directory, so make sure to run `pnpm build` before viewing changes.
