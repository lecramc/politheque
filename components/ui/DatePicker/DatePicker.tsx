import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';

export default function DatePicker({
  open,
  onClose,
  value,
  onChange,
  mode,
  minimumDate,
}: {
  open: boolean;
  onClose: () => void;
  value?: Date;
  onChange: (date: Date) => void;
  mode: 'date' | 'time';
  minimumDate?: Date;
}) {
  if (!open) return null;

  return (
    <DateTimePicker
      value={value ?? new Date()}
      mode={mode}
      display="default"
      minimumDate={minimumDate}
      onChange={(event, date) => {
        if (event?.type === 'dismissed') {
          onClose();
          return;
        }
        if (date) onChange(date);
        onClose();
      }}
    />
  );
}
