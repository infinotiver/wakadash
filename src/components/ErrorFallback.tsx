import { Feather } from "@expo/vector-icons";
import { reloadAppAsync } from "expo";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/src/hooks/useColors";
import { commonStyles, typographies } from "@/src/constants/styles.common";
export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch (restartError) {
      console.error("Failed to restart app:", restartError);
      resetError();
    }
  };

  const formatErrorDetails = (): string => {
    let details = `Error: ${error.message}\n\n`;
    if (error.stack) {
      details += `Stack Trace:\n${error.stack}`;
    }
    return details;
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  });

  return (
    <View
      style={[commonStyles.container, { backgroundColor: colors.background }]}
    >
      {__DEV__ ? (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityLabel="View error details"
          accessibilityRole="button"
          style={({ pressed }) => [
            commonStyles.topButton,
            {
              top: insets.top + 16,
              backgroundColor: colors.card,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="alert-circle" size={20} color={colors.foreground} />
        </Pressable>
      ) : null}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Something went wrong
        </Text>

        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          Please reload the app to continue.
        </Text>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            commonStyles.button,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text
            style={[
              commonStyles.buttonText,
              { color: colors.primaryForeground },
            ]}
          >
            Try Again
          </Text>
        </Pressable>
      </View>

      {__DEV__ ? (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={commonStyles.modalOverlay}>
            <View
              style={[
                commonStyles.modalContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <View
                style={[
                  commonStyles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    commonStyles.modalTitle,
                    { color: colors.foreground },
                  ]}
                >
                  Error Details
                </Text>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  accessibilityLabel="Close error details"
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    commonStyles.closeButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="x" size={24} color={colors.foreground} />
                </Pressable>
              </View>

              <ScrollView
                style={commonStyles.modalScrollView}
                contentContainerStyle={[
                  commonStyles.modalScrollContent,
                  { paddingBottom: insets.bottom + 16 },
                ]}
                showsVerticalScrollIndicator
              >
                <View
                  style={[
                    commonStyles.errorContainer,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Text
                    style={[
                      commonStyles.errorText,
                      {
                        color: colors.foreground,
                        fontFamily: monoFont,
                      },
                    ]}
                    selectable
                  >
                    {formatErrorDetails()}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
