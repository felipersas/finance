/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tint = '#2e5675ff';
const error = '#B3261E' // vermelho sóbrio, combina com a paleta

export const Colors = {
  tint,
  light: {
    tint,
    error,
    text: '#06141B', // escuro, para contraste em fundo claro
    background: '#ECEDEE', // claro, inspirado no texto do tema escuro
    icon: '#2b4355', // tom escuro da paleta
    tabIconDefault: '#687076', // mantém para consistência
    tabIconSelected: tint,
    muted: '#9BA1A6' // tom claro da paleta escura
  },
  dark: {
    tint,
    error,
    text: '#ECEDEE',
    background: '#06141B',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tint,
    muted: '#11212D'
  },
};
