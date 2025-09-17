/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tint = '#10b981';
const error = '#E53935'

export const Colors = {
  tint,
  light: {
    tint,
    error,
    text: '#11181C',
    background: '#fff',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tint,
    muted: '#414141ff'
  },
  dark: {
    tint,
    error,
    text: '#ECEDEE',
    background: '#151718',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tint,
    muted: '#888888ff'
  },
};
