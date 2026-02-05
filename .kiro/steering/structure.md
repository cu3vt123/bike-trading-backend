# Project Structure

## Source Organization (`src/`)

```
src/
├── apis/           # API service layer
├── components/     # Reusable UI components
│   ├── common/     # Shared components (Header, etc.)
│   ├── forms/      # Form-specific components
│   ├── listing/    # Listing-related components
│   └── ui/         # Base UI components (Button, Card, Badge)
├── layouts/        # Page layout components
├── lib/            # Utility libraries and helpers
├── mocks/          # Mock data for development
├── pages/          # Page components (route handlers)
├── routes/         # Routing configuration
├── stores/         # Zustand state stores
└── types/          # TypeScript type definitions
```

## Naming Conventions

- **Files**: PascalCase for components (`HomePage.tsx`)
- **Directories**: camelCase for folders (`src/components/`)
- **Types**: PascalCase with descriptive names
- **API files**: camelCase with `Api` suffix (`authApi.ts`)

## Component Architecture

- **Pages**: Top-level route components in `src/pages/`
- **Layouts**: Wrapper components for page structure
- **UI Components**: Reusable base components in `src/components/ui/`
- **Feature Components**: Domain-specific components organized by feature

## Import Patterns

- Use `@/` alias for all internal imports
- Group imports: external libraries → internal modules → types
- Prefer named exports over default exports for utilities

## State Management

- Global state in `src/stores/` using Zustand
- Component-local state with React hooks
- Persistent auth state with Zustand middleware