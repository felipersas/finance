import { DatePicker } from "@/components/ui/DatePicker";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

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
  onSave,
  onCancel,
  theme,
  initialValues,
  isSaving = false,
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

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-full px-6 py-7 rounded-2xl min-h-[550px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            <Text className="font-semibold text-xl text-text text-left">
              Criar lembrete
            </Text>
          </DialogTitle>
          <DialogDescription>
            <Text className="text-textSecondary">
              Preencha os campos para criar um novo lembrete.
            </Text>
          </DialogDescription>
        </DialogHeader>
        <View className="flex flex-col gap-4">
          <FormProvider {...methods}>
            <Controller
              control={control}
              name="title"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <>
                  <Input
                    placeholder="Título"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    aria-invalid={!!error}
                    className="w-full"
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
              name="description"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <>
                  <Input
                    placeholder="Descrição"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    aria-invalid={!!error}
                    className="w-full"
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
                <>
                  <Input
                    placeholder="HH:mm"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    aria-invalid={!!error}
                    keyboardType="numbers-and-punctuation"
                    className="w-full"
                  />
                  {error?.message && (
                    <Text className="text-xs text-red-500 mt-1">
                      {error.message}
                    </Text>
                  )}
                </>
              )}
            />
            <DialogFooter className="flex-col gap-3 mt-4">
              <DialogClose asChild>
                <Button onPressIn={onCancel} className="bg-muted">
                  <Text>{strings.common.cancel}</Text>
                </Button>
              </DialogClose>
              <View className="relative flex-1">
                <Button
                  onPress={handleSubmit(onSave)}
                  disabled={isSaving}
                  className="rounded-xl bg-success mb-1 flex-row justify-center items-center bg-primary"
                >
                  {isSaving ? (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        alignSelf: "center",
                      }}
                    />
                  ) : (
                    <Text>{strings.common.confirm}</Text>
                  )}
                </Button>
              </View>
            </DialogFooter>
          </FormProvider>
        </View>
      </DialogContent>
    </Dialog>
  );
};
