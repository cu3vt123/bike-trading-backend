# Technology Stack

## Frontend Framework
- **React 19.2** with TypeScript
- **Vite** as build tool and dev server
- **React Router DOM** for client-side routing

## State Management
- **Zustand** for global state management
- Persistent storage with Zustand middleware for auth state

## Styling
- **Tailwind CSS** for utility-first styling
- Custom brand colors defined in config
- PostCSS for CSS processing

## HTTP Client
- **Axios** for API communication
- Centralized API client configuration

## Development Tools
- **ESLint** for code linting
- **TypeScript** for type safety
- **Vite** for hot module replacement

## Common Commands

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Path Aliases
- `@/*` maps to `./src/*` for clean imports
- Configured in both Vite and TypeScript