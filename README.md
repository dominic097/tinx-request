# Tinx 🚀

A modern, open-source API testing and development tool built with React, TypeScript, Tailwind CSS, and Shadcn UI. Designed with a VS Code-like interface, supporting dark mode, and deployable as web, desktop (Electron), and mobile (PWA) applications.

## ✨ Features

### Current Features (Phase 1 - Foundation)
- ✅ Modern UI with VS Code-like appearance
- ✅ Dark mode support (default)
- ✅ Responsive layout structure
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Shadcn UI components

### Coming Soon
- 🔄 HTTP Request Builder (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- 🔄 Collections & Folders organization
- 🔄 Environment Variables management
- 🔄 Request History tracking
- 🔄 Response Viewer with multiple formats
- 🔄 Authentication support (Basic, Bearer, OAuth, API Key, etc.)
- 🔄 Pre-request & Test Scripts
- 🔄 Collection Runner
- 🔄 Code Generation (cURL, JavaScript, Python, etc.)
- 🔄 Import/Export (Postman, OpenAPI/Swagger)
- 🔄 Mock Servers
- 🔄 API Documentation

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Code Editor**: Monaco Editor
- **Database**: IndexedDB (Dexie.js)
- **Build Tool**: Vite
- **Desktop**: Electron (planned)
- **Mobile**: PWA (planned)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Navigate to the project directory
cd tinx

# Install dependencies (already done)
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests (coming soon)
```

## 🏗️ Project Structure

```
tinx/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── layout/          # Layout components
│   │   └── features/        # Feature-specific components
│   ├── lib/
│   │   ├── api/            # API client logic
│   │   ├── storage/        # IndexedDB operations
│   │   └── utils/          # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript types
│   ├── constants/          # Constants and enums
│   └── styles/             # Global styles
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🎨 Design Philosophy

Tinx is designed to provide a familiar, VS Code-like experience for API developers:

- **Dark Mode First**: Optimized for extended coding sessions
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Tab Management**: Work with multiple requests simultaneously
- **Split Views**: Compare requests and responses side-by-side
- **Command Palette**: Quick access to all features

## 🗺️ Roadmap

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the complete development roadmap.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Postman, Insomnia, and VS Code
- Built with [Shadcn UI](https://ui.shadcn.com/)
- Powered by [Vite](https://vitejs.dev/)

---

**Status**: 🚧 In Active Development | **Version**: 0.1.0 | **Last Updated**: February 12, 2026
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
