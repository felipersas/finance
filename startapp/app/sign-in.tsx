import { KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';

import { AppButton } from '@/components/AppButton';
import { SignInData, SignInSchema } from '@/validators/auth/sign-in';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Input from '@/components/ui/Input';
import { strings } from '@/constants/Strings';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useSession } from '@/providers/SessionProvider';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import toastConfig from '@/config/ToastConfig';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { AuthGuard } from '@/components/AuthGuard';

export default function SignInScreen() {
  const { signIn } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);


  const methods = useForm<SignInData>({
    reValidateMode: 'onChange',
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(SignInSchema),
  });

  const { control, handleSubmit } = methods;

  const onSubmit = (data: SignInData) => {
    signIn(data);
    router.replace('/(private)/(tabs)');
  }

  return (
    <AuthGuard requireAuth={false}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >

    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>{strings.auth.welcomeBack}</ThemedText>
          <ThemedText style={styles.subtitle}>{strings.auth.signInToContinue}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <FormProvider {...methods}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label={strings.auth.email}
                  placeholder={strings.auth.enterYourEmail}
                  value={value}
                  onValueChange={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  isRequired={true}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label={strings.auth.password}
                  placeholder={strings.auth.enterYourPassword}
                  secureTextEntry
                  value={value}
                  onValueChange={onChange}
                  onBlur={onBlur}
                  isRequired={true}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                />
              )}
            />
            <AppButton
              title={strings.auth.signIn}
              onPress={handleSubmit(onSubmit)}
              style={styles.signInButton}
            />
            <ThemedText style={styles.signUpText}>
              Não tem uma conta? <ThemedText onPress={() => router.push('/sign-up')} style={styles.signUpLink}>Criar Conta</ThemedText>
            </ThemedText>
          </FormProvider>
        </ThemedView>
          <Toast config={toastConfig} />
      </ThemedView>
    </ThemedView>
    </KeyboardAvoidingView>
    </AuthGuard>
  )
}

const createStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[theme].background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors[theme].text,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors[theme].text,
  },
  form: {
    gap: 12,
  },
  signInButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors[theme].tint,
    color: Colors[theme].background,
  },
  signUpText: {
    textAlign: 'center',
    marginTop: 16,
    color: Colors[theme].text,
  },
  signUpLink: {
    fontWeight: '600',
    color: Colors[theme].tint,
  },
});