import { ThemedText } from "@/components/common";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";

export function Drawer({
  open,
  drawerAnim,
  colorScheme,
  session,
  signOut,
  onClose,
}: {
  open: boolean;
  drawerAnim: Animated.Value;
  colorScheme: string | undefined;
  session: any;
  signOut: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 flex-row justify-start items-stretch z-[100]">
      <Animated.View
        className="h-full w-[280px] pt-8 px-6 rounded-tr-3xl rounded-br-3xl bg-light-card dark:bg-dark-card shadow-lg"
        style={{
          transform: [{ translateX: drawerAnim }],
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 101,
        }}
      >
        <View className="flex-1 flex-row justify-between items-start mt-8">
          <ThemedText type="subtitle" className="text-xl font-semibold mb-4.5">
            {session?.name}
          </ThemedText>
          <TouchableOpacity
            className="left-4.5 p-1.5 rounded-2xl z-[2]"
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={28}
              className="text-light-text dark:text-dark-text"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-2 mb-6 absolute left-6 bottom-8"
          onPress={signOut}
        >
          <MaterialIcons name="logout" size={28} color="#B3261E" />
          <ThemedText className="text-base text-error ml-2 font-medium">
            Sair
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
      <TouchableOpacity
        className="flex-1 bg-black/[0.18]"
        activeOpacity={1}
        onPress={onClose}
      />
    </View>
  );
}
