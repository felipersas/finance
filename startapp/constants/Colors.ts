/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tint = '#b4da4aff'; // modern lime accent
const onyx = '#181A1B'; // onyx dark
const onyxLight = '#23272a';
const error = '#B3261E';

export const Colors = {
  error,
  success: tint,
  tint,
  light: {
    card: '#fff',
    tint,
    error,
    text: onyx,
    background: '#f7f8fa',
    icon: tint,
    tabIconDefault: '#d1d5db',
    tabIconSelected: tint,
    muted: '#e5e7eb',
  },
  dark: {
    card: onyxLight,
    tint,
    error,
    text: '#fff',
    background: onyx,
    icon: tint,
    tabIconDefault: '#23272a',
    tabIconSelected: tint,
    muted: '#23272a',
  },
};
