# Fleet Panda (po)

## Getting started

### 1. Install dependencies

```sh
npm install
```

### 2. Environment variables

This app reads config from `.env.development`, which is gitignored and not committed. Create it yourself in the `po/` directory with the following contents:

```sh
VITE_API_URL="https://po-be.onrender.com/api"
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZGlqaW5rcyIsImEiOiJjbXJzbTY0ZWg0ank3MnlzZGlrY3J1ejRiIn0.wUY2Hhw4Mpr3l3nHnqJjZQ
```

### 3. Run the app

```sh
npm run dev
```

This starts Vite's dev server (default: http://localhost:5173). `VITE_API_URL` should point at a running instance of `po-backend`.

## Running tests

### Unit / component tests (Jest)

```sh
npm run test            # run once
npm run test:watch      # watch mode
npm run test:coverage   # with coverage report
```

### End-to-end tests (Playwright)

```sh
npm run test:e2e         # run once (auto-starts the dev server)
npm run test:e2e:ui      # interactive UI mode
npm run test:e2e:report  # view the last HTML report
```

E2E tests mock all API calls via `page.route`, so `po-backend` does not need to be running.

## Other useful scripts

```sh
npm run lint           # ESLint
npm run format:check   # Prettier check
npm run format:write   # Prettier write
npm run check          # format + lint --fix + knip + tsc --noEmit
npm run build          # type-check and build for production
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
