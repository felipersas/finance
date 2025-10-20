import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  className = "",
  ...rest
}: ThemedTextProps) {
  // Build className based on type
  let typeClassName = "";

  switch (type) {
    case "default":
      typeClassName = "text-base leading-6";
      break;
    case "defaultSemiBold":
      typeClassName = "text-base leading-6 font-semibold";
      break;
    case "title":
      typeClassName = "text-[32px] leading-8 font-bold";
      break;
    case "subtitle":
      typeClassName = "text-xl font-bold";
      break;
    case "link":
      typeClassName = "text-base leading-[30px] text-[#0a7ea4]";
      break;
  }

  // Apply theme colors if custom colors aren't provided
  let colorClassName = "";
  if (!lightColor && !darkColor && type !== "link") {
    colorClassName = "text-light-text dark:text-dark-text";
  }

  // Combine all classNames
  const finalClassName =
    `${typeClassName} ${colorClassName} ${className}`.trim();

  // If custom colors are provided, use inline styles
  const inlineStyle = lightColor || darkColor ? style : undefined;

  return (
    <Text className={finalClassName} style={inlineStyle || style} {...rest} />
  );
}
