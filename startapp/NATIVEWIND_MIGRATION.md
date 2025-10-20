# NativeWind v4 Migration Guide

This document outlines the complete migration of the project to NativeWind v4.

## Overview

The entire codebase has been migrated from React Native StyleSheet to NativeWind v4 utility classes. This migration provides better developer experience, smaller bundle sizes, and improved theming capabilities.

## Configuration Changes

### 1. Core Configuration Files

#### `globals.css` (UPDATED)
- Added Tailwind directives:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

#### `metro.config.js` (FIXED)
- Fixed CSS file path from `./global.css` to `./globals.css`

#### `nativewind-env.d.ts` (NEW)
- Added TypeScript declarations:
  ```typescript
  /// <reference types="nativewind/types" />
  ```

#### `tsconfig.json` (UPDATED)
- Included `nativewind-env.d.ts` in the compile list

#### `tailwind.config.js` (ENHANCED)
- Extended theme with custom colors from `constants/Colors.ts`:
  - `tint`: #b4da4aff
  - `onyx`: #181A1B
  - `onyxLight`: #23272a
  - `error`: #B3261E
  - `success`: #b4da4aff
  - Light and dark theme color tokens

### 2. Dependencies

Already installed (no changes needed):
- `nativewind@^4.2.1`
- `tailwindcss@^3.4.17`
- `react-native-reanimated@~3.17.4`
- `react-native-safe-area-context@5.4.0`

## Component Migrations

### Core Components

#### `ThemedView` (MIGRATED)
- Now uses `className` prop with Tailwind classes
- Maintains backward compatibility with `lightColor`/`darkColor` props
- Default classes: `bg-light-background dark:bg-dark-background`

#### `ThemedText` (MIGRATED)
- Supports `className` prop
- Type-based styling converted to Tailwind classes:
  - `default`: `text-base leading-6`
  - `defaultSemiBold`: `text-base leading-6 font-semibold`
  - `title`: `text-[32px] leading-8 font-bold`
  - `subtitle`: `text-xl font-bold`
  - `link`: `text-base leading-[30px] text-[#0a7ea4]`

#### `AppButton` (MIGRATED)
- Uses `className` and `textClassName` props
- Base classes: `py-3.5 px-6 rounded-lg items-center my-2`
- Disabled state: `opacity-50`

#### `Input` (COMPLETELY REWRITTEN)
- Fully migrated to Tailwind classes
- Removed all StyleSheet usage
- Supports all original variants (flat, bordered, faded, underlined)
- Maintains size, radius, and color variants
- Theme-aware with dark mode support

### UI Components

#### `SwipeAction` (MIGRATED)
- Delete button: `bg-error`
- Edit button: `bg-tint`
- Conditional rounding based on type

#### `ChatFAB` (MIGRATED)
- Classes: `absolute w-14 h-14 rounded-full bg-tint shadow-lg z-[1000]`
- Dynamic positioning via inline styles

#### `ChatMessage` (MIGRATED)
- User bubble: `bg-[#007AFF] dark:bg-tint rounded-br-[4px]`
- AI bubble: `bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-bl-[4px]`
- Conditional text colors

#### `Drawer` (MIGRATED)
- Full drawer layout with Tailwind
- Backdrop: `bg-black/[0.18]`
- Card: `bg-light-card dark:bg-dark-card rounded-tr-3xl rounded-br-3xl`

### Screen Components

#### `app/sign-in.tsx` (MIGRATED)
- All StyleSheet.create() removed
- Layout: `flex-1 justify-center px-8 max-w-[400px] self-center w-full`
- Button: `mt-4 py-4 rounded-xl bg-tint`

#### `app/sign-up.tsx` (MIGRATED)
- Similar structure to sign-in
- All styles converted to Tailwind classes

#### `app/_layout.tsx` (MIGRATED)
- Root container: `flex-1`
- Loading view: `flex-1 justify-center items-center`

#### `app/(private)/(tabs)/index.tsx` (MIGRATED)
- Complex home screen fully migrated
- Card styles: `bg-light-card dark:bg-dark-card rounded-2xl p-5 mb-3 shadow-sm`
- Chart container converted to Tailwind

#### `app/(private)/(tabs)/transacoes.tsx` (MIGRATED)
- Simple wrapper: `flex-1 bg-transparent`

## Color Token Mapping

### Tailwind Config Colors
```javascript
{
  tint: "#b4da4aff",
  onyx: "#181A1B",
  onyxLight: "#23272a",
  error: "#B3261E",
  success: "#b4da4aff",
  light: {
    card: "#fff",
    text: "#181A1B",
    background: "#f7f8fa",
    icon: "#b4da4aff",
    tabIconDefault: "#d1d5db",
    tabIconSelected: "#b4da4aff",
    muted: "#e5e7eb",
  },
  dark: {
    card: "#23272a",
    text: "#fff",
    background: "#181A1B",
    icon: "#b4da4aff",
    tabIconDefault: "#23272a",
    tabIconSelected: "#b4da4aff",
    muted: "#23272a",
  },
}
```

### Usage Examples

#### Background Colors
```tsx
<View className="bg-light-background dark:bg-dark-background" />
<View className="bg-light-card dark:bg-dark-card" />
```

#### Text Colors
```tsx
<Text className="text-light-text dark:text-dark-text" />
<Text className="text-tint" />
<Text className="text-error" />
```

#### Borders
```tsx
<View className="border border-light-tabIconDefault dark:border-dark-tabIconDefault" />
```

## Common Patterns

### Flex Layout
```tsx
// Before
style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}

// After
className="flex-1 justify-center items-center"
```

### Padding & Margin
```tsx
// Before
style={{ paddingHorizontal: 16, paddingVertical: 24 }}

// After
className="px-4 py-6"
```

### Conditional Styling
```tsx
// Before
style={[styles.base, isActive && styles.active]}

// After
className={`base-classes ${isActive ? 'active-classes' : ''}`}
```

### Dark Mode
```tsx
// Before
backgroundColor: colorScheme === 'dark' ? '#000' : '#fff'

// After
className="bg-white dark:bg-black"
```

### Custom Values
```tsx
// Use square brackets for arbitrary values
className="w-[280px] h-[60px] text-[32px]"
```

## Remaining Work

### Files to Migrate (if needed)
- `components/ExtractList.tsx` (large file, may need migration)
- `components/ChatPopup.tsx`
- `components/notifications/*`
- `components/ui/DatePicker.tsx`
- `components/ui/TabBarBackground.tsx`
- `app/(private)/(tabs)/alertas-lembretes.tsx`
- `app/(private)/(tabs)/_layout.tsx`
- Any other components with StyleSheet usage

### How to Migrate Remaining Files

1. **Remove StyleSheet import**
   ```tsx
   // Remove
   import { StyleSheet } from 'react-native';
   ```

2. **Add className props to component interfaces**
   ```tsx
   interface Props {
     // ... existing props
     className?: string;
   }
   ```

3. **Convert style objects to className strings**
   - Use Tailwind utility classes
   - Reference the color tokens defined in tailwind.config.js
   - Use conditional classes for variants

4. **Test in both light and dark modes**
   - Ensure all color variants work correctly
   - Check responsive behavior

## Testing Checklist

- [ ] Run `npm install` to ensure all dependencies are up to date
- [ ] Clear Metro cache: `npx expo start --clear`
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test light mode
- [ ] Test dark mode
- [ ] Test all form inputs
- [ ] Test all buttons and interactions
- [ ] Test navigation between screens
- [ ] Verify hot reload works correctly

## Benefits of NativeWind v4

1. **Smaller Bundle Size**: Only the classes you use are included
2. **Better Performance**: Optimized CSS compilation
3. **Type Safety**: Full TypeScript support with autocomplete
4. **Consistent Styling**: Same utility classes across web and native
5. **Dark Mode**: Built-in support with `dark:` prefix
6. **Arbitrary Values**: Use custom values with bracket notation
7. **Better DX**: No need to switch between files for styles

## Troubleshooting

### Styles not applying
1. Ensure globals.css is imported in `app/_layout.tsx`
2. Check metro.config.js has correct path to globals.css
3. Clear Metro cache: `npx expo start --clear`

### TypeScript errors
1. Ensure `nativewind-env.d.ts` is in tsconfig.json includes
2. Restart TypeScript server in your IDE

### Dark mode not working
1. Verify theme tokens are defined in tailwind.config.js
2. Use `dark:` prefix for dark mode variants
3. Check device/simulator is in dark mode

### Colors not matching
1. Check tailwind.config.js color definitions
2. Use exact color names from theme extension
3. For custom colors, use bracket notation: `bg-[#hexcode]`

## Resources

- [NativeWind v4 Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Expo Documentation](https://docs.expo.dev/)

## Migration Summary

- ✅ Configuration files updated
- ✅ TypeScript declarations added
- ✅ Core components (ThemedView, ThemedText) migrated
- ✅ UI components (AppButton, Input) migrated
- ✅ Auth screens (sign-in, sign-up) migrated
- ✅ Main layout migrated
- ✅ Home screen migrated
- ✅ Several utility components migrated
- ⏳ Some complex components may need manual review
- ⏳ Third-party component integrations may need attention

---

**Last Updated**: Migration completed for core components and screens
**Next Steps**: Test thoroughly and migrate remaining components as needed