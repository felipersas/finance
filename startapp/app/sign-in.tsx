import { KeyboardAvoidingView, Platform } from "react-native";

import { AppButton, ThemedText, ThemedView } from "@/components/common";
import { SignInData, SignInSchema } from "@/validators/auth/sign-in";
import { Input } from "@/components/ui";
import { strings } from "@/constants/Strings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useSession } from "@/providers/SessionProvider";
import { useRouter } from "expo-router";
import { AuthGuard } from "@/components/auth";

export default function SignInScreen() {
  const { signIn } = useSession();
  const router = useRouter();

  const methods = useForm<SignInData>({
    reValidateMode: "onChange",
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(SignInSchema),
  });

  const { control, handleSubmit } = methods;

  const onSubmit = (data: SignInData) => {
    signIn(data);
    router.replace("/(private)/(tabs)");
  };

  return (
    <AuthGuard requireAuth={false}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ThemedView className="flex-1">
          <ThemedView className="flex-1 justify-center px-8 max-w-[400px] self-center w-full">
            <ThemedView className="items-center mb-8">
              <ThemedText type="title" className="text-[28px] font-bold mb-2">
                {strings.auth.welcomeBack}
              </ThemedText>
              <ThemedText className="text-base">
                {strings.auth.signInToContinue}
              </ThemedText>
            </ThemedView>

            <ThemedView className="gap-3">
              <FormProvider {...methods}>
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
                <AppButton
                  title={strings.auth.signIn}
                  onPress={handleSubmit(onSubmit)}
                  className="mt-4 py-4 rounded-xl bg-tint"
                  textClassName="text-onyx"
                />
                <ThemedText className="text-center mt-4">
                  Não tem uma conta?{" "}
                  <ThemedText
                    onPress={() => router.push("/sign-up")}
                    className="font-semibold text-tint"
                  >
                    Criar Conta
                  </ThemedText>
                </ThemedText>
              </FormProvider>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </AuthGuard>
  );
}
