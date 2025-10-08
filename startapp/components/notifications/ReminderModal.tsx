
import { AppButton } from '@/components/AppButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { strings } from '@/constants/Strings';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

interface ReminderModalProps {
  visible: boolean;
  editReminder: any;
  onSave: (data: ReminderFormData) => void;
  onDelete: () => void;
  onCancel: () => void;
  theme: 'light' | 'dark';
  initialValues?: ReminderFormData;
}



const ReminderSchema = z.object({
  title: z.string().min(1, { message: strings.validation.fieldRequired }),
  description: z.string().optional(),
  date: z.string()
    .min(1, { message: strings.validation.fieldRequired })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Formato: YYYY-MM-DD' }),
  time: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Formato: HH:mm' })
    .optional()
    .or(z.literal('')),
});

export type ReminderFormData = z.infer<typeof ReminderSchema>;

export const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  editReminder,
  onSave,
  onDelete,
  onCancel,
  theme,
  initialValues,
}) => {
  const styles = createStyles(theme);
  const defaultValues = React.useMemo(() => initialValues || {
    title: '',
    description: '',
    date: '',
    time: '',
  }, [initialValues]);
  const methods = useForm<z.infer<typeof ReminderSchema>>({
    defaultValues,
    resolver: zodResolver(ReminderSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const { control, handleSubmit, reset } = methods;

  React.useEffect(() => {
    reset(defaultValues);
  }, [visible, initialValues, defaultValues, reset]);

  if (!visible) return null;
  return (
    <ThemedView style={styles.modalOverlay}>
      <ThemedView style={styles.modalCardMinimal}>
        <ThemedText type="subtitle" style={styles.modalTitleMinimal}>{editReminder ? strings.common.edit + ' lembrete' : strings.common.save + ' lembrete'}</ThemedText>
        <FormProvider {...methods}>
          <View style={styles.modalFormMinimal}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Título"
                  placeholder="Título"
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
              name="description"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Descrição"
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
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Data"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onValueChange={onChange}
                  onBlur={onBlur}
                  isRequired={true}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  keyboardType="numeric"
                />
              )}
            />
            <Controller
              control={control}
              name="time"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Horário"
                  placeholder="HH:mm"
                  value={value}
                  onValueChange={onChange}
                  onBlur={onBlur}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  keyboardType="numeric"
                />
              )}
            />
          </View>
          <View style={styles.modalActionsMinimal}>
            <AppButton
              title={strings.common.save}
              onPress={handleSubmit(onSave)}
              style={styles.saveButtonMinimal}
              textStyle={styles.saveButtonTextMinimal}
            />
            {editReminder && (
              <AppButton
                title={strings.common.delete}
                onPress={onDelete}
                style={styles.deleteButtonMinimal}
                textStyle={styles.deleteButtonTextMinimal}
              />
            )}
            <AppButton
              title={strings.common.cancel}
              onPress={onCancel}
              style={styles.cancelButtonMinimal}
              textStyle={styles.cancelButtonTextMinimal}
            />
          </View>
        </FormProvider>
      </ThemedView>
    </ThemedView>
  );
};

const createStyles = (theme: 'light' | 'dark') => {
  const palette = Colors[theme];
  return StyleSheet.create({
    modalOverlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
    },
    modalCardMinimal: {
      backgroundColor: palette.card,
      borderRadius: 20,
      padding: 20,
      maxWidth: 360,
      width: '92%',
      alignItems: 'stretch',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    modalTitleMinimal: {
      fontWeight: '600',
      fontSize: 18,
      marginBottom: 16,
      color: palette.text,
      textAlign: 'left',
    },
    modalFormMinimal: {
      width: '100%',
      gap: 10,
      marginBottom: 18,
    },
    inputMinimal: {
      width: '100%',
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      borderWidth: 0,
      backgroundColor: palette.background,
      color: palette.text,
      marginBottom: 2,
      shadowColor: palette.muted,
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    inputPlaceholder: { color: palette.muted },
    modalActionsMinimal: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%',
      marginTop: 2,
    },
    saveButtonMinimal: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 18,
      backgroundColor: Colors.success,
      minWidth: 90,
    },
    saveButtonTextMinimal: { color: '#fff', fontWeight: '600', fontSize: 15 },
    deleteButtonMinimal: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 18,
      backgroundColor: Colors.error,
      minWidth: 90,
    },
    deleteButtonTextMinimal: { color: '#fff', fontWeight: '600', fontSize: 15 },
    cancelButtonMinimal: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 18,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      minWidth: 90,
    },
    cancelButtonTextMinimal: { fontSize: 15, color: palette.text },
  });
};
