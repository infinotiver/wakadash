import React, { useState } from "react";
import { Modal, Platform, Pressable } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
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
    const handle = (event: DateTimePickerEvent, picked?: Date) => {
      if (Platform.OS === "ios") setIosOpts(null);
      if (event.type === "set" && picked) opts.onPick(toDateKey(picked));
    };

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        // design: "material",
        title: opts.title,
        value: toDate(opts.value),
        mode: "date",
        maximumDate: new Date(), // can't pick the future
        onChange: handle,
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
              onChange={(e, d) => {
                setIosOpts(null);
                if (e.type === "set" && d) iosOpts.onPick(toDateKey(d));
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    ) : null;

  return { open, modal };
}
