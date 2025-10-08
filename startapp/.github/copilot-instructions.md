
# Copilot Instructions for AI Agents

## Project Overview
This is an Expo React Native app (TypeScript) with modular file-based routing, custom UI, and business logic separation. The codebase is organized for maintainability and rapid feature development.

## Architecture & Data Flow
- **Routing:** Screens are defined in `app/` using Expo Router. Private/tabbed routes are nested under `app/(private)/(tabs)/`. The main navigation logic is in `app/_layout.tsx`.
- **State Management:** App-wide state (e.g., notifications, session/auth) is managed via React Contexts in `contexts/` (see `NotificationContext.tsx`, `SessionProvider.tsx`).
- **API Layer:** All HTTP requests use Axios via `services/api.ts`, with authentication handled by interceptors and tokens stored in SecureStore. Business logic is wrapped in custom hooks (e.g., `useChatApi.ts`, `useListExtract.ts`).
- **UI Components:** Shared UI primitives and forms are in `components/`, organized by domain (e.g., `notifications/`, `ui/`). Theming is handled via hooks (`useTheme`, `useThemeColor`) and `constants/Colors.ts`.
- **Notifications:** Managed via context and service (`contexts/notifications/NotificationContext.tsx`, `services/notifications.ts`). Supports reminders, marking as read, CRUD operations, and filtering by type.
- **Analytics & Extracts:** Financial analytics and extract lists are fetched via hooks (`useAnalytics.ts`, `useListExtract.ts`) and displayed in tab screens.

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npx expo start` (choose device/simulator)
- **Run on Android:** `npx expo run:android --device`
- **Reset project:** `npm run reset-project` (moves starter code, creates blank app)
- **Lint:** `npm run lint` (uses `eslint.config.js`)
- **Type check:** TypeScript enforced via `tsconfig.json`
- **Builds:** Use Expo CLI; see `Dockerfile` for containerization

## Project-Specific Conventions
- **Routing:** Place new screens in `app/`, nest for private/tabbed routes. Example: add a tab by creating `app/(private)/(tabs)/new-tab.tsx`.
- **Component Naming:** PascalCase for components, camelCase for hooks. UI primitives in `components/ui/`, forms in `components/form/`.
- **Theming:** Use `useTheme` and `Colors.ts` for light/dark mode. StyleSheets are generated per theme.
- **API Integration:** Extend `services/api.ts` for new endpoints. Use hooks for API logic (see `useChatApi.ts`, `useListExtract.ts`).
- **Notifications:** Types in `types/notification.ts`. Context provides CRUD and filtering. Example: `addReminder`, `markAsRead`.
- **Session/Auth:** Managed in `SessionProvider.tsx`, with token storage in SecureStore. Use `useSession` for login/logout.
- **Assets:** Fonts in `assets/fonts/`, images in `assets/images/`.
- **Testing:** No explicit test folder; follow Expo/React Native best practices if adding tests.

## Integration Points & External Dependencies
- **Expo:** Core platform for builds, device/simulator integration, and environment management.
- **React Query:** Used for data fetching/caching (`@tanstack/react-query`).
- **OneSignal:** Push notifications via `react-native-onesignal` and `onesignal-expo-plugin` (see `_layout.tsx`).
- **Form Validation:** Uses `react-hook-form` and `zod` for schema validation.
- **Secure Storage:** Auth tokens managed via `expo-secure-store`.

## Examples & Patterns
- **Add a tab screen:** Create `app/(private)/(tabs)/financeiro.tsx` and export a React component.
- **Add notification type:** Update `types/notification.ts`, then update context and UI in `NotificationContext.tsx` and `NotificationList.tsx`.
- **Add API endpoint:** Extend `services/api.ts`, create a hook in `hooks/` (e.g., `useChatApi.ts`), and use React Query for data fetching.
- **Session login:** Use `useSession().signIn(data)` in sign-in screen; token is stored and used for authenticated requests.
- **Theming:** Use `useTheme()` and `Colors.ts` for dynamic styles; see `createStyles` pattern in screens/components.
- **Notification CRUD:** Use context methods (`addReminder`, `updateReminder`, `deleteReminder`, `markAsRead`) for notification management.

---
For questions about unclear conventions or missing documentation, ask for feedback or clarification from maintainers. If you discover undocumented patterns, document them here for future agents.
