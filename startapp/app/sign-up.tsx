import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Input from '@/components/ui/Input';
import { strings } from '@/constants/Strings';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useSession } from '@/providers/SessionProvider';
import { useRouter } from 'expo-router';
import { SignUpData, SignUpSchema } from '@/validators/auth/sign-up';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/Colors';

export default function SignUpScreen() {
  const { signUp } = useSession();
  const router = useRouter();
  const theme = useTheme()
  const styles = createStyles(theme);

  const methods = useForm<SignUpData>({
    reValidateMode: 'onChange',
    mode: 'onBlur',
    defaultValues: { email: '', password: '', name: '' , confirmPassword: '' },
    resolver: zodResolver(SignUpSchema),
  });

  const { control, handleSubmit } = methods;

  const onSubmit = async (data: SignUpData) => {
    await signUp(data);
    router.replace('/(private)/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>Criar Conta</ThemedText>
            <ThemedText style={styles.subtitle}>Crie sua conta para continuar</ThemedText>
          </ThemedView>
          <ThemedView style={styles.form}>
            <FormProvider {...methods}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label={"Nome"}
                    placeholder={"Digite seu nome"}
                    value={value}
                    onValueChange={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    isRequired={true}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  />
                )}
              />
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
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <Input
                    label={"Confirmar Senha"}
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
                title={"Criar Conta"}
                onPress={handleSubmit(onSubmit)}
                style={[styles.signUpButton]}
              />
            </FormProvider>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
  container: {
    flex: 1,
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
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  form: {
    gap: 12,
  },
  signUpButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors[theme].tint,
  },
});
