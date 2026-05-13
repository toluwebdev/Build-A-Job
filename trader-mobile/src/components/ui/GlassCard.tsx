import React from "react";
import { View, ViewProps, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

import { Colors, BorderRadius } from "../../constants";

const PADDING_KEYS = [
  "padding",
  "paddingHorizontal",
  "paddingVertical",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
] as const;

function splitPaddingFromStyle(style: ViewProps["style"]): {
  paddingStyle: ViewStyle;
  restStyle: ViewProps["style"];
} {
  const flat = StyleSheet.flatten(style) as Record<string, unknown> | undefined;
  if (!flat) return { paddingStyle: {}, restStyle: style };
  const paddingStyle: ViewStyle = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    if ((PADDING_KEYS as readonly string[]).includes(key)) {
      (paddingStyle as Record<string, unknown>)[key] = value;
    } else {
      rest[key] = value;
    }
  }
  return { paddingStyle, restStyle: rest as ViewStyle };
}

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: "light" | "dark" | "default";
  animated?: boolean;
  pressed?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = 20,
  tint = "dark",
  animated: _animated,
  pressed: _pressed,
  ...props
}: GlassCardProps) {
  const { paddingStyle, restStyle } = splitPaddingFromStyle(style);

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.container, restStyle]}
      {...props}
    >
      <View style={[styles.border, paddingStyle]}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: "rgba(28, 28, 40, 0.6)",
  },
  border: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
});
