import { SplashScreen } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
import { useEffect, useState } from 'react';

export function SplashScreenController() {
  const { isLoading } = useSession();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Aguarda o carregamento da sessão terminar
        if (!isLoading) {
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn(e);
        setAppIsReady(true);
      }
    }

    prepare();
  }, [isLoading]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  return null;
}
