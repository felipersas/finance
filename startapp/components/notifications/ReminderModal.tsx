import { AppButton } from "@/components/common/AppButton";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { DatePicker } from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { strings } from "@/constants/Strings";
import {
  ReminderFormData,
  ReminderSchema,
} from "@/validators/notifications/remider-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { z } from "zod";

interface ReminderModalProps {
  visible: boolean;
  editReminder: any;
  onSave: (data: ReminderFormData) => void;
  onDelete: () => void;
  onCancel: () => void;
  theme: "light" | "dark";
  initialValues?: ReminderFormData;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  editReminder,
  onSave,
  onDelete,
  onCancel,
  theme,
  initialValues,
  isSaving = false,
  isDeleting = false,
}) => {
  const defaultValues = React.useMemo(
    () =>
      initialValues || {
        title: "",
        description: "",
        date: "",
        time: "",
      },
    [initialValues],
  );
  const methods = useForm<z.infer<typeof ReminderSchema>>({
    defaultValues,
    resolver: zodResolver(ReminderSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const { control, handleSubmit, reset } = methods;

  React.useEffect(() => {
    reset(defaultValues);
  }, [visible, initialValues, defaultValues, reset]);

  if (!visible) return null;
  const isEdit = !!editReminder;
  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center z-10  bg-black/70">
      <View className="bg-card rounded-2xl px-6 py-7 max-w-[380px] w-[95%] items-stretch shadow-lg">
        <ThemedText
          type="subtitle"
          className="font-semibold text-xl mb-5 text-text text-left"
        >
          {isEdit ? strings.common.edit + " lembrete" : "Criar lembrete"}
        </ThemedText>
        <FormProvider {...methods}>
          <View className="w-full mb-6">
            <Controller
              control={control}
              name="title"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <Input
                  label="Título"
                  placeholder="Título"
                  size="lg"
                  value={value}
                  onValueChange={onChange}
                  onBlur={onBlur}
                  isRequired={true}
                  isInvalid={!!error}
                  className="mb-3"
                  errorMessage={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <Input
                  label="Descrição"
                  size="lg"
                  placeholder="Descrição"
                  value={value}
                  onValueChange={onChange}
                  onBlur={onBlur}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="date"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <DatePicker
                  theme={theme}
                  label="Data"
                  value={value}
                  onChange={onChange}
                  isRequired={true}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="time"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <Input
                  label="Horário"
                  size="lg"
                  placeholder="HH:mm"
                  value={value}
                  onValueChange={onChange}
                  onBlur={onBlur}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  keyboardType="numbers-and-punctuation"
                />
              )}
            />
          </View>
          <View
            className={
              isEdit
                ? "flex-row space-x-3 justify-end items-center w-full mt-1"
                : "flex-col space-y-3 w-full mt-1 items-stretch"
            }
          >
            <View className="relative">
              <AppButton
                title={isSaving ? "" : isEdit ? strings.common.save : "Criar"}
                onPress={handleSubmit(onSave)}
                disabled={isSaving}
                className={
                  isEdit
                    ? "rounded-xl py-3 px-6 bg-success min-w-[100px] flex-row justify-center items-center"
                    : "rounded-xl py-4 bg-success mb-1 flex-row justify-center items-center"
                }
                textClassName={
                  isEdit
                    ? "text-white font-semibold text-base"
                    : "text-white font-bold text-lg"
                }
              />
              {isSaving && (
                <View className="absolute left-0 right-0 top-0 bottom-0 flex-row justify-center items-center">
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </View>
            {isEdit && (
              <View className="relative">
                <AppButton
                  title={isDeleting ? "" : strings.common.delete}
                  onPress={onDelete}
                  disabled={isDeleting}
                  className="rounded-xl py-3 px-6 bg-error min-w-[100px] flex-row justify-center items-center"
                  textClassName="text-white font-semibold text-base"
                />
                {isDeleting && (
                  <View className="absolute left-0 right-0 top-0 bottom-0 flex-row justify-center items-center">
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </View>
            )}
            <AppButton
              title={strings.common.cancel}
              onPress={onCancel}
              className={
                isEdit
                  ? "rounded-xl py-3 px-6 bg-card border border-muted min-w-[100px]"
                  : "rounded-xl py-4 bg-muted"
              }
              textClassName={
                isEdit ? "text-base text-text" : "text-lg text-text"
              }
            />
          </View>
        </FormProvider>
      </View>
    </View>
  );
};

/* NativeWind migration: StyleSheet removed */
