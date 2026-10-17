import React, { useState } from "react";
import { Modal, Platform, Pressable } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";
import { toDateKey } from "@/src/utils/dashboard";

interface OpenOptions {
  value: string; // YYYY-MM-DD
  title?: string;
  onPick: (key: string) => void;
}

const toDate = (key: string) => new Date(`${key}T12:00:00`);

export function useDatePicker() {
  const colors = useColors();
  const [iosOpts, setIosOpts] = useState<OpenOptions | null>(null);

  const open = (opts: OpenOptions) => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        title: opts.title,
        value: toDate(opts.value),
        mode: "date",
        maximumDate: new Date(), // can't pick the future
        onValueChange: (_e, d) => opts.onPick(toDateKey(d)),
      });
    } else {
      setIosOpts(opts);
    }
  };

  const modal =
    Platform.OS === "ios" && iosOpts ? (
      <Modal
        transparent
        animationType="fade"
        onRequestClose={() => setIosOpts(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "#00000066",
            justifyContent: "center",
            padding: ct.space.lg,
          }}
          onPress={() => setIosOpts(null)}
        >
          <Pressable
            onPress={() => {}} // swallow taps so the card doesn't dismiss
            style={{
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: ct.radius["2xl"],
              padding: ct.space.md,
            }}
          >
            <DateTimePicker
              value={toDate(iosOpts.value)}
              mode="date"
              display="inline"
              maximumDate={new Date()}
              accentColor={colors.primary}
              onValueChange={(_e, d) => {
                setIosOpts(null);
                iosOpts.onPick(toDateKey(d));
              }}
              onDismiss={() => setIosOpts(null)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    ) : null;

  return { open, modal };
}
