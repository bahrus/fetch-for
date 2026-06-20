# Coding Standards

## JavaScript Module Conventions

### Import Maps
- Use import maps with explicit, bare specifiers ending with `*.js` for all JavaScript references that run in the browser
- Example: `"be-hive/": "/node_modules/be-hive/"`

### File Extensions
- Use `*.mjs` files exclusively for npm build scripts, not for browser code
- Use `*.js` files (not `*.ts`) for all browser-executable code
- Enable TypeScript support in `*.js` files via `@ts-check` directive at the top of files

### TypeScript Support
- Add `// @ts-check` at the beginning of JavaScript files to enable TypeScript checking
- Use JSDoc comments for type annotations when needed
- Leverage type definitions from the `types` submodule
