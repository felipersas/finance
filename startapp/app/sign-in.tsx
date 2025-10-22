import { KeyboardAvoidingView, Platform, View, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";

import { ThemedText } from "@/components/common";
import { SignInData, SignInSchema } from "@/validators/auth/sign-in";
import { Input } from "@/components/ui/input";
import { strings } from "@/constants/Strings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useSession } from "@/providers/SessionProvider";
import { useRouter } from "expo-router";
import { AuthGuard } from "@/components/auth";
import { Button } from "@/components/ui/button";

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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1">
            <View className="flex-1 justify-center px-8 max-w-[400px] self-center w-full">
              <View className="items-center mb-8">
                <Text className="text-[28px] font-bold mb-2 text-text">
                  {strings.auth.welcomeBack}
                </Text>
                <Text className="text-textSecondary">
                  {strings.auth.signInToContinue}
                </Text>
              </View>

              <View className="gap-3">
                <FormProvider {...methods}>
                  <Controller
                    control={control}
                    name="email"
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <>
                        <Text className="mb-1 text-base text-text font-medium">
                          {strings.auth.email}
                        </Text>
                        <Input
                          placeholder={strings.auth.enterYourEmail}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          aria-invalid={!!error}
                        />
                        {error?.message && (
                          <Text className="text-xs text-red-500 mt-1">
                            {error.message}
                          </Text>
                        )}
                      </>
                    )}
                  />
                  <Controller
                    control={control}
                    name="password"
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <>
                        <Text className="mb-1 text-base text-text font-medium">
                          {strings.auth.password}
                        </Text>
                        <Input
                          placeholder={strings.auth.enterYourPassword}
                          secureTextEntry
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          aria-invalid={!!error}
                        />
                        {error?.message && (
                          <ThemedText className="text-xs text-red-500 mt-1">
                            {error.message}
                          </ThemedText>
                        )}
                      </>
                    )}
                  />
                  <Button
                    onPress={handleSubmit(onSubmit)}
                    className=" rounded-xl bg-primary"
                  >
                    <Text>Entrar</Text>
                  </Button>
                  <Text className="text-center text-text mt-4">
                    Não tem uma conta?{" "}
                    <Text
                      onPress={() => router.push("/sign-up")}
                      className="font-semibold text-primary"
                    >
                      Criar Conta
                    </Text>
                  </Text>
                </FormProvider>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGuard>
  );
}
