# CService Frontend

Vue 3 SPA for UnderNET IRC network's account and channel management system with MFA/2FA support.

## Tech Stack

Vue 3.5 • TypeScript 5.8 • Vite 6 • Pinia • Vue Router 4 • Tailwind CSS 4 • Element Plus • Vitest 3.1

## Quick Start

```sh
# Install dependencies
yarn install

# Start dev server (http://localhost:5173)
yarn dev

# Run tests
yarn test:unit

# Build for production
yarn build
```

## Development Commands

```sh
yarn dev           # Start dev server with HMR
yarn build         # Type check + production build
yarn type-check    # Run TypeScript type checking
yarn lint          # Run ESLint with auto-fix
yarn format        # Format code with Prettier
yarn test:unit     # Run unit tests (111 tests)
```

## Docker

```sh
docker build -f Dockerfile.production -t cservice-frontend:latest .
docker run -p 8080:80 cservice-frontend:latest
```

## Environment Variables

Create a `.env.local` file for local overrides:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_RECAPTCHA_SITE_KEY=your-key-here
```

## Features

- 🔐 JWT authentication with automatic refresh
- 🔒 MFA/TOTP support
- 📱 Cross-tab token synchronization
- 🌐 Channel management with grid/list views
- 👥 Role-based admin panel
- 🎨 Dark theme UI

## CI/CD

- **CI Workflow**: Runs on push/PR - linting, type check, tests, build
- **Release Workflow**: Runs on tags - builds Docker images (amd64/arm64), deploys to K8s
- **Dependabot**: Weekly automated dependency updates

## Project Structure

```
src/
├── components/   # Reusable components
├── views/        # Page components
├── stores/       # Pinia state management
├── services/     # API layer
├── router/       # Route configuration
├── types/        # TypeScript types
└── utils/        # Helper functions
```

## License

See [LICENSE](LICENSE) file.
