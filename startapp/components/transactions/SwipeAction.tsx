import React from "react";
import { TouchableOpacity, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";

interface SwipeActionProps {
  type: "delete" | "edit";
  onPress: () => void;
}

export const SwipeAction: React.FC<SwipeActionProps> = ({ type, onPress }) => {
  const isDelete = type === "delete";
  const isEdit = type === "edit";

  const baseClasses =
    "flex-1 justify-center items-center w-20 h-full flex-col mx-0.5 mb-3.5";
  const bgClasses = isDelete ? "bg-error" : "bg-tint";
  const roundingClasses = isEdit
    ? "rounded-tl-2xl rounded-bl-2xl"
    : "rounded-tr-2xl rounded-br-2xl";

  const buttonClasses = `${baseClasses} ${bgClasses} ${roundingClasses}`;

  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      accessibilityLabel={isDelete ? "Excluir" : "Editar"}
    >
      <Feather
        name={isDelete ? "trash-2" : "edit-2"}
        size={22}
        color={"#fff"}
      />
      <Text className="text-white font-semibold text-[13px] mt-1">
        {isDelete ? "Excluir" : "Editar"}
      </Text>
    </TouchableOpacity>
  );
};
