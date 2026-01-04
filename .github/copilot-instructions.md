# ProSeed AI Coding Instructions

## Links
- **GitHub**: https://github.com/mdhdbr/mhb1a
- **Vercel**: https://vercel.com/mohameds-projects-51a126ff/mhb1a

## Architecture Overview
ProSeed is a Next.js 14 transportation management system using Firebase backend. Core architecture:
- **Frontend**: Next.js app router with TypeScript, Tailwind CSS, shadcn/ui components
- **State Management**: Zustand stores per domain (e.g., `user-store.ts`, `job-store.ts`)
- **Backend**: Firebase Auth (OTP-based), Firestore for data, Genkit AI for intelligent features
- **Maps**: React Leaflet with custom patches for vehicle tracking
- **Data Model**: Defined in `docs/backend.json` with entities like UserProfile, Job, Driver, Vehicle

Key directories:
- `src/app/` - App router pages and API routes
- `src/components/` - UI components, including shadcn/ui in `ui/`
- `src/stores/` - Zustand state management
- `src/firebase/` - Firebase config and utilities
- `src/ai/` - Genkit AI flows for driver suggestions, OTP

## Developer Workflows
- **Development**: `npm run dev -p 9002` (runs on port 9002)
- **Build**: `npm run build` (outputs to `.next`, static export to `out` for Firebase hosting)
- **Type Checking**: `npm run typecheck` (run before commits)
- **Linting**: `npm run lint`
- **Firebase Deploy**: `firebase deploy` (hosts from `out` directory)
- **Vercel Deploy**: `vercel --prod` (auto-deploys from GitHub at https://vercel.com/mohameds-projects-51a126ff/mhb1a)
- **AI Flows**: Use Genkit CLI for testing AI features in `src/ai/flows/`

## Project Conventions
- **Authentication**: Firebase Auth with OTP (phone/email), role-based access (admin, agent, driver)
- **Styling**: Primary #A099FF, background #F5F4F9, accent #99A0FF; fonts Space Grotesk (headings), Inter (body)
- **UI Components**: shadcn/ui variants with `cn()` utility from `src/lib/utils.ts`
- **State Updates**: Use Zustand stores; e.g., `useUserStore` for user data
- **Maps**: Leaflet with React Leaflet; apply patches from `patches/react-leaflet+4.2.1.patch`
- **AI Integration**: Genkit with Google Gemini 1.5 Flash; flows in `src/ai/flows/`
- **Data Types**: Centralized in `lib/types.ts` and `src/lib/types.ts`
- **Admin Features**: Excel-like editing, right-click context menus (see `vehicle-context-menu.tsx`)
- **Error Handling**: Firebase error emitter in `src/firebase/error-emitter.ts`

## Integration Points
- **Firebase**: Auth via `src/firebase/client-provider.tsx`, Firestore queries in stores
- **AI Suggestions**: Call Genkit flows for driver matching (e.g., `suggest-suitable-drivers.ts`)
- **Real-time Updates**: Firestore listeners in stores for live data
- **External APIs**: Windy weather iframe, SMS via Firestore

## Common Patterns
- **Component Structure**: Functional components with hooks; props typed with interfaces from `lib/types.ts`
- **API Routes**: In `src/app/api/` for server-side logic
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React icons
- **Charts**: Recharts for analytics (fleet composition, driver fatigue)

Reference `docs/blueprint.md` for feature requirements and `README.md` for setup.</content>
<parameter name="filePath">c:\Users\Hameed\Downloads\ProSeed 1a\.github\copilot-instructions.md