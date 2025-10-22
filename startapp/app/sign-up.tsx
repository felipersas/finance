import { KeyboardAvoidingView, Platform, View, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { strings } from "@/constants/Strings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useSession } from "@/providers/SessionProvider";
import { useRouter } from "expo-router";
import { SignUpData, SignUpSchema } from "@/validators/auth/sign-up";
import { Button } from "@/components/ui/button";

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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1">
          <View className="flex-1 justify-center px-8 max-w-[400px] self-center w-full">
            <View className="items-center mb-8">
              <Text className="text-[28px] font-bold mb-2 text-text">
                Criar Conta
              </Text>
              <Text className="text-textSecondary">
                Crie sua conta para continuar
              </Text>
            </View>
            <View className="gap-3">
              <FormProvider {...methods}>
                <Controller
                  control={control}
                  name="name"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <Text className="mb-1 text-base text-text font-medium">
                        Nome
                      </Text>
                      <Input
                        placeholder={"Digite seu nome"}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
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
                        <Text className="text-xs text-red-500 mt-1">
                          {error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <>
                      <Text className="mb-1 text-base text-text font-medium">
                        Confirmar Senha
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
                        <Text className="text-xs text-red-500 mt-1">
                          {error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
                <Button
                  onPress={handleSubmit(onSubmit)}
                  className="rounded-xl bg-primary"
                >
                  <Text>Criar Conta</Text>
                </Button>
                <Text className="text-center text-text mt-4">
                  Já tem uma conta?{" "}
                  <Text
                    onPress={() => router.push("/sign-in")}
                    className="font-semibold text-primary"
                  >
                    Entrar
                  </Text>
                </Text>
              </FormProvider>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
