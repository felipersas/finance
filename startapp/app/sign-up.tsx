import { KeyboardAvoidingView, Platform } from "react-native";

import { AppButton, ThemedText, ThemedView } from "@/components/common";
import { Input } from "@/components/ui";
import { strings } from "@/constants/Strings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useSession } from "@/providers/SessionProvider";
import { useRouter } from "expo-router";
import { SignUpData, SignUpSchema } from "@/validators/auth/sign-up";

export default function SignUpScreen() {
  const { signUp } = useSession();
  const router = useRouter();

  const methods = useForm<SignUpData>({
    reValidateMode: "onChange",
    mode: "onBlur",
    defaultValues: { email: "", password: "", name: "", confirmPassword: "" },
    resolver: zodResolver(SignUpSchema),
  });

  const { control, handleSubmit } = methods;

  const onSubmit = async (data: SignUpData) => {
    await signUp(data);
    router.replace("/(private)/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ThemedView className="flex-1">
        <ThemedView className="flex-1 justify-center px-8 max-w-[400px] self-center w-full">
          <ThemedView className="items-center mb-8">
            <ThemedText type="title" className="text-[28px] font-bold mb-2">
              Criar Conta
            </ThemedText>
            <ThemedText className="text-base">
              Crie sua conta para continuar
            </ThemedText>
          </ThemedView>
          <ThemedView className="gap-3">
            <FormProvider {...methods}>
              <Controller
                control={control}
                name="name"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
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
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
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
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
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
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
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
                className="mt-4 py-4 rounded-xl bg-tint"
                textClassName="text-onyx"
              />
            </FormProvider>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
