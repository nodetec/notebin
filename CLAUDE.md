# CLAUDE.md

## Project Overview
- **Notebin**: A decentralized code snippet sharing platform using Nostr protocol (NIP-C0 implementation)
- Built with Next.js 15, React 19, TypeScript, and Tailwind CSS
- Uses shadcn/ui components and Radix UI primitives

## Architecture & Patterns
- **Feature-based structure**: Components organized in `src/features/` by domain (editor, login, navigation, post, snippet-feed, zap)
- **Barrel exports**: Each feature exports components via `index.ts` files
- **State management**: Zustand store in `src/store/index.ts` with localStorage persistence
- **Path aliases**: Uses `~/` for `src/` directory

## Key Technologies
- **Nostr integration**: Uses `nostr-tools` for decentralized functionality
- **Authentication**: NextAuth with custom Nostr credentials provider
- **Code editor**: CodeMirror with language extensions and themes
- **Data fetching**: TanStack Query for server state
- **Styling**: Tailwind CSS with `cn()` utility function combining clsx and tailwind-merge
- **Icons**: Lucide React icons
- **Avatars**: Dicebear for generated avatars

## Development Commands
```bash
npm run dev        # Development server with Turbopack
npm run build      # Production build
npm run start      # Production server
npm run lint       # Next.js linting (also runs Biome)
```

## Code Quality
- **Linting/Formatting**: Biome (configured in `biome.json`)
- **TypeScript**: Strict mode enabled with path mapping
- **Component conventions**:
  - "use client" directive for client components
  - Custom hooks prefixed with `use`
  - Feature components exported via barrel files

## Development Guidelines
- **shadcn/ui Components**: Before implementing features that may require new UI components, check if additional shadcn/ui components are needed and ask the user to install them first. Do not attempt to create missing components yourself.

## Key File Locations
- Global state: `src/store/index.ts`
- Types: `src/types/index.ts`
- Utilities: `src/lib/utils.ts`
- Constants: `src/lib/constants.ts`
- Auth config: `src/auth/index.ts`
- Nostr utilities: `src/lib/nostr/`

## Documentation
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/reference/react
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/docs
- **Radix UI**: https://www.radix-ui.com/primitives/docs/overview/introduction
- **Zustand**: https://zustand.docs.pmnd.rs/
- **TanStack Query**: https://tanstack.com/query/latest/docs/framework/react/overview
- **NextAuth.js**: https://next-auth.js.org/getting-started/introduction
- **CodeMirror**: https://codemirror.net/docs/
- **nostr-tools**: https://github.com/nbd-wtf/nostr-tools
- **Nostr NIPs**: https://github.com/nostr-protocol/nips
- **Nostr Protocol**: https://nostr.com/
- **NIP-C0 Spec**: https://github.com/nostr-protocol/nips/blob/master/C0.md
- **Lucide Icons**: https://lucide.dev/icons/
- **Dicebear**: https://www.dicebear.com/styles
- **Biome**: https://biomejs.dev/
