```
███████╗ ██████╗ 
╚══███╔╝██╔═══██╗
  ███╔╝ ██║   ██║
 ███╔╝  ██║   ██║
███████╗╚██████╔╝
╚══════╝ ╚═════╝ 
```

**Open-source clone of v0.app with AI-powered React component generation**

[![GitHub Stars](https://img.shields.io/github/stars/ravirraj/Z0?style=flat-square&logo=github&labelColor=1a1a2e&color=4a4e69)](https://github.com/ravirraj/Z0/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/ravirraj/Z0?style=flat-square&logo=github&labelColor=1a1a2e&color=4a4e69)](https://github.com/ravirraj/Z0/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/ravirraj/Z0?style=flat-square&logo=github&labelColor=1a1a2e&color=4a4e69)](https://github.com/ravirraj/Z0/issues)
[![License](https://img.shields.io/github/license/ravirraj/Z0?style=flat-square&labelColor=1a1a2e&color=4a4e69)](LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Getting Started](#getting-started) · [Features](#features) · [Tech Stack](#tech-stack) · [Project Structure](#project-structure) · [Contributing](#contributing)

---

## Overview

Z0 is a self-hosted, open-source alternative to [v0.app](https://v0.app) that transforms natural language descriptions into production-ready React components. Built with the latest web technologies and designed for developers who want full control over their AI-assisted development workflow.

## Features

| Feature | Description |
|---------|-------------|
| **AI Component Generation** | Convert natural language prompts into functional React components |
| **Real-time Streaming** | Watch code generation happen live with streaming responses |
| **User Authentication** | Email/password plus Google OAuth with Better Auth |
| **Rate Limiting** | 50 messages per day for authenticated users |
| **Persistent Chat History** | Conversations and generated components saved to PostgreSQL |
| **Projects Dashboard** | View and manage all your generated projects |
| **Live Preview** | Split-screen resizable layout with instant component preview |
| **Dark/Light Theme** | Full theme support with system preference detection |
| **Image Attachments** | Attach images to your prompts for context |
| **Voice Input** | Microphone support for voice-based prompts |

## Getting Started

> **New contributor?** Follow the full **[Local Setup Guide](docs/LOCAL_SETUP.md)**
> (clone → Postgres → env → migrate → run, plus troubleshooting).

### Prerequisites

- Node.js 22.x or later
- pnpm 10.0 or later
- PostgreSQL database (local or hosted)
- v0 API key from [v0.app](https://v0.app/settings/keys) for each end user (BYOK)
- Google OAuth credentials (for Google sign-in, see [Google OAuth Setup](#google-oauth-setup))

### Installation

```bash
# Clone the repository
git clone https://github.com/ravirraj/Z0.git
cd Z0

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

### Environment Configuration

Create a `.env` file with the following variables:

```bash
# Environment
NODE_ENV=development

# Database (required)
POSTGRES_URL=postgresql://user:password@localhost:5432/z0

# Authentication (required - generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your_auth_secret_here

# Base URL of the app (used by Better Auth for callbacks)
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (required for "Continue with Google")
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional: Custom v0 API URL
V0_API_URL=
```

After sign in, each user adds their own v0 API key from the account menu.

> **Note:** In development mode, if `BETTER_AUTH_SECRET` is not set, a default development secret will be used automatically.

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a new project (or select an existing one).
3. Create an **OAuth client ID** of type **Web application**.
4. Add an authorized redirect URI:
   `http://localhost:3000/api/auth/callback/google`
   (replace with your production URL when deploying, e.g.
   `https://your-domain.com/api/auth/callback/google`).
5. Copy the client ID and client secret into `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET`.

Without these variables, email/password sign-in still works but the
"Continue with Google" button will fail.

### Database Setup

```bash
# Apply database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

> **Note:** The Better Auth migration (`0005_better_auth`) replaces the legacy
> auth tables. If you are upgrading from the old NextAuth-based version,
> existing accounts are reset: sign up again (email/password or Google) and
> re-enter your v0 API key.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Run migrations and build for production |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate migration files from schema changes |
| `pnpm db:migrate` | Apply pending migrations to the database |
| `pnpm db:studio` | Open Drizzle Studio for database inspection |
| `pnpm db:push` | Push schema changes directly to the database |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Run Biome linter with auto-fix |
| `pnpm format` | Format code with Biome |
| `pnpm check` | Run Biome check (lint + format) |
| `pnpm typecheck` | Run TypeScript type checking |

## Tech Stack

### Frontend
- **React 19.2.4** — Latest React with concurrent rendering and React Compiler
- **Next.js 16.1.6** — Full-stack React framework with App Router & Turbopack
- **TypeScript 5.9.3** — Static type checking
- **Tailwind CSS 4.2.0** — Utility-first CSS framework
- **Radix UI** — Accessible UI primitives
- **Geist Font** — Typography by Vercel

### Backend & Data
- **Better Auth 1.7.5** — Authentication with email/password + Google OAuth
- **PostgreSQL** — Relational database
- **Drizzle ORM 0.45.1** — Type-safe database operations

### AI Integration
- **v0 SDK 0.16.1** — Official v0.app API client
- **AI SDK 6.0.97** — Streaming AI response handling
- **@v0-sdk/react 0.5.0** — React components for AI interactions

### Developer Experience
- **Biome 2.4.4** — Fast linter and formatter
- **Husky** — Git hooks for code quality
- **lint-staged** — Run linters on staged files

## Project Structure

```
Z0/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication helpers & pages
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── api/                 # API routes
│   │   ├── auth/            # Better Auth handler ([...all])
│   │   ├── chat/            # Chat API (create, fork, delete)
│   │   └── chats/           # Chat list & detail endpoints
│   ├── chats/               # Chat pages
│   └── projects/            # Projects dashboard
├── components/
│   ├── ai-elements/         # AI-specific components (prompt, response, etc.)
│   ├── chat/                # Chat interface components
│   ├── chats/               # Chat list components
│   ├── home/                # Home page components
│   ├── projects/            # Projects page components
│   ├── providers/           # React context providers
│   ├── shared/              # Shared layout components
│   └── ui/                  # Reusable UI primitives
├── contexts/                # React contexts
├── hooks/                   # Custom React hooks
├── lib/
│   ├── auth.ts              # Better Auth server instance
│   ├── auth-client.ts       # Better Auth client (useSession, signIn, ...)
│   ├── db/                  # Database schema, queries & migrations
│   └── ...                  # Utilities and configurations
├── types/                   # TypeScript type definitions
└── public/                  # Static assets
```

## Authentication & Rate Limits

Login is required to use the chat functionality. Users can create an account with email/password or sign in with Google before submitting prompts.

| User Type | Max Messages/Day | Description |
|-----------|------------------|-------------|
| Registered | 50 | Email/password or Google authenticated users |

> **Note:** Unauthenticated users will be redirected to the login page when attempting to submit a prompt. Any typed message will be preserved and restored after login.

## Contributing

Contributions are welcome. Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

### Code Quality

This project uses Biome for linting and formatting. Before submitting a PR:

```bash
pnpm check:fix  # Auto-fix linting and formatting issues
pnpm typecheck  # Ensure no TypeScript errors
```

## Testing

This project is tested with BrowserStack

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contributors

<a href="https://github.com/ravirraj/Z0/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ravirraj/Z0" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ravirraj/Z0&type=Date)](https://star-history.com/#ravirraj/Z0&Date)

> **⭐ If you found this project helpful, please consider giving it a star!**
