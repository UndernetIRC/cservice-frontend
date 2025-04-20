# cservice-frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

## API Configuration

The application connects to the UnderNET IRC network API. You can configure the API endpoint using environment variables:

### Environment Variables

- `VITE_API_BASE_URL`: The base URL for the API (default: `http://localhost:8080/api/v1`)

### Environment Files

The project includes the following environment files:

- `.env`: Default environment variables for development
- `.env.production`: Environment variables for production

To use a different API endpoint, you can:

1. Modify the `.env` file for development
2. Create a `.env.local` file (which is git-ignored) for local overrides
3. Set the environment variable directly when running the application

Example:

```
# For development
VITE_API_BASE_URL=http://localhost:8080/api/v1

# For production
VITE_API_BASE_URL=https://api.undernet.org/api/v1
```
