# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android (requires Android Studio + SDK)
npm run android

# Run on iOS (requires Xcode + CocoaPods)
cd ios && bundle exec pod install && cd ..
npm run ios

# Lint
npm run lint

# Tests
npm test
```

Requires Node >= 22.11.0. The backend API runs at `10.203.241.245:3000` — the device/emulator must be able to reach that IP.

## Architecture

### App entry and providers

`src/App.tsx` wraps everything in this order: `SafeAreaProvider` → `GestureHandlerRootView` → Redux `Provider` → `NavigationContainer` (with `navigationRef`) → `DrawerNavigator`. In-app update check runs on mount via `useInAppUpdate()`.

### Navigation

Three navigators compose the routing tree:

- **DrawerNavigator** (`src/navigation/DrawerNavigator.tsx`) — outer shell; renders a custom sidebar with user profile and points (fetched from `/User/MyProfile`). Safe screens (Login, SignUp, Splash) disable the drawer gesture.
- **StackNavigator** (`src/navigation/StackNavigator.tsx`) — decides initial route by checking AsyncStorage for saved user and intro-page flag (Splash → Login → HomeTabNavigator).
- **HomeTabNavigator** (`src/navigation/HomeTabNavigator.tsx`) — bottom tabs for authenticated users. Tabs: `HomeTab`, `ProductList`, `Cart`, `AccountTab` (imported from `src/view/screens/Account`).

For navigation from outside React components use `src/navigation/RootNavigation.ts` (`navigate(name, params)` / `reset(name)`).

### State management

Redux Toolkit store (`src/shared/redux/store/index.tsx`) with four slices: `auth`, `app`, `messages`, `otherData`. Redux Logger is added in dev. Immutability checks are disabled.

On store creation, `initalStateAsync()` is dispatched to rehydrate the `auth` slice from AsyncStorage. There is no separate persistence library — `src/shared/utils/storage.ts` wraps AsyncStorage with a `@`-prefixed key convention and JSON serialisation.

Auth actions (`src/shared/redux/actions/auth.action.ts`) call auth service methods, persist the user object to AsyncStorage, then dispatch Redux actions.

### API layer

All HTTP calls go through `src/shared/services/main-service.ts`. Key points:

- `getData / postData / putData / patchData / deleteData` — authenticated (Bearer token from AsyncStorage via `authHeaderNew()`).
- `getPublicData / publicPostData` — use an `API_KEY` header instead.
- `postFormData / putFormData` — multipart uploads via `fetch` (not axios) to get upload progress via `XMLHttpRequest`.
- `submitTaskEntry` has retry logic (up to 3 attempts with backoff).
- An axios response interceptor catches 401 responses, clears auth state, and navigates to Login via `RootNavigation`.

`src/shared/services/auth.service.ts` is a singleton covering login, signup, OTP send/verify, forgot password, and logout. OTP endpoints: `POST /api/auth/send-otp` and `POST /api/auth/verify-otp` (both accept `{ email }` / `{ email, otp }` and use the `API_KEY` header, not Bearer).

Profile endpoints (in `main-service.ts`):
- `fetchMyProfile()` — `GET /profile/all`; returns a list, matched to the stored user ID from AsyncStorage (`@user` key).
- `updateMyProfile(formData)` — `PUT /profile/{id}`; resolves `{id}` from the stored user object (`id` / `Id` / `userId` field).

### Screens and UI

Screens live in `src/view/screens/`. Each feature folder typically contains the screen component and a styles file (e.g. `HomeStyle.tsx`).

The profile feature was moved from `src/view/screens/Profile/` to `src/view/screens/Account/`. That folder contains `Profile.tsx` (the account overview, registered as the `AccountTab` bottom tab and the `Profile` stack screen) and `EditProfile.tsx` (registered as the `EditProfile` stack screen).

Global theme tokens (colors, font sizes, border radii, font weights) are in `src/view/assets/styles/theme.tsx`. Primary brand color is `#e91e63`. Fonts are `DMSans-Bold/Medium/Regular`.

SVGs in `src/view/assets/images/` are imported as React components — Metro is configured with `react-native-svg-transformer`.

`TabBarContext` (`src/shared/context/`) carries tab bar visibility state across screens.

### Code style

Prettier config: single quotes, no semicolons (`arrowParens: "avoid"`), trailing commas. ESLint extends `@react-native`. TypeScript with `moduleResolution: "node"`. Reanimated babel plugin is required (`react-native-reanimated/plugin` in babel.config.js — must remain last if other plugins are added).
