import { NotificationList } from "@/components/notifications/NotificationList";
import { ReminderModal } from "@/components/notifications/ReminderModal";
import { Colors } from "@/constants/Colors";
import {
  useCreateNotification,
  useDeleteNotification,
  useMarkNotificationAsRead,
  useNotifications,
  useUpdateNotification,
} from "@/hooks/useNotifications";
import { useTheme } from "@/hooks/useTheme";
import { NotificationType } from "@/types/notification";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { ReminderFormData } from "@/validators/notifications/remider-schema";
import { Input } from "@/components/ui/input";

const tipos = [
  { label: "Todos", value: "all" },
  { label: "Financeiro", value: "financeiro" },
  { label: "Estoque", value: "estoque" },
  { label: "Fiscal", value: "fiscal" },
  { label: "Contrato", value: "contrato" },
  { label: "Lembrete", value: "lembrete" },
];

export default function AlertasLembretesScreen() {
  const theme = useTheme();
  const [tipo, setTipo] = useState("all");
  const { data, refetch } = useNotifications();
  const notifications = data?.data || [];
  const createMutation = useCreateNotification();
  const updateMutation = useUpdateNotification();
  const deleteMutation = useDeleteNotification();
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editReminder, setEditReminder] = useState<any>(null);
  const markAsReadMutation = useMarkNotificationAsRead();

  // Modal open handler
  const handleOpenForm = (reminder?: any) => {
    if (reminder && typeof reminder === "object" && reminder.id) {
      setEditReminder(reminder);
    } else {
      setEditReminder(null);
    }
    setModalVisible(true);
  };

  // Save handler for ReminderModal
  const handleSaveReminder = async (data: ReminderFormData) => {
    const newReminder = {
      title: data.title,
      description: data.description ?? "",
      type: "lembrete" as NotificationType,
      date: data.date,
      time: data.time ?? "",
      isReminder: true,
    };
    if (editReminder) {
      await updateMutation.mutateAsync({
        id: editReminder.id,
        input: newReminder,
      });
    } else {
      await createMutation.mutateAsync(newReminder);
    }
    setModalVisible(false);
    refetch();
  };
  const handleDeleteReminder = async () => {
    if (editReminder) {
      await deleteMutation.mutateAsync(editReminder.id);
      setModalVisible(false);
      refetch();
    }
  };

  return (
    <View className="flex-1 px-4 bg-background">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between pt-5 pb-3">
        <Input
          className="flex-1 rounded-xl mr-3"
          placeholder="Pesquisar..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-primary items-center justify-center shadow-lg"
          onPress={handleOpenForm}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={Colors[theme].background} />
        </TouchableOpacity>
      </View>
      {/* Tipo Tabs */}
      <View className="flex-row flex-wrap items-center mb-4 mt-2">
        {tipos.map((t) => (
          <TouchableOpacity
            key={t.value}
            className={[
              "py-2 px-3 rounded-full border mr-2 mb-2",
              tipo === t.value
                ? "bg-tint/20 border-primary"
                : "bg-card border-text/20 ",
            ].join(" ")}
            onPress={() => setTipo(t.value)}
            activeOpacity={0.85}
          >
            <Text
              className={[
                "text-base",
                tipo === t.value
                  ? "text-primary font-bold"
                  : "text-textSecondary",
              ].join(" ")}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Notification List */}
      <NotificationList
        data={notifications}
        onPressItem={(item) => {
          if (!item.read) {
            markAsReadMutation.mutate(item.id);
          }
        }}
        onLongPressItem={(item) =>
          item.isReminder ? handleOpenForm(item) : undefined
        }
      />
      {/* Reminder Modal */}
      <ReminderModal
        visible={modalVisible}
        editReminder={
          editReminder && typeof editReminder === "object" && editReminder.id
            ? editReminder
            : null
        }
        initialValues={
          editReminder && typeof editReminder === "object" && editReminder.id
            ? {
                title: editReminder.title || "",
                description: editReminder.description || "",
                date: editReminder.date ? editReminder.date.slice(0, 10) : "",
                time: editReminder.time || "",
              }
            : undefined
        }
        onSave={handleSaveReminder}
        onDelete={handleDeleteReminder}
        onCancel={() => setModalVisible(false)}
        theme={theme}
        isSaving={createMutation.isPending || updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </View>
  );
}

// NativeWind migration: StyleSheet and createStyles removed
