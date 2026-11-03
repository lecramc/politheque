import React, { useState } from 'react';

import DatePicker from '@/components/ui/DatePicker';

import PickerRow from './PickerRow';

const pad2 = (n: number) => String(n).padStart(2, '0');

export default function TimeInput({
  value,
  onChange,
  label,
  disabled = false,
  grouped = false,
  minimumDate,
  onGlass = false,
}: {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  disabled?: boolean;
  grouped?: boolean;
  minimumDate?: Date;
  onGlass?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const timeLabel = `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

  return (
    <>
      <PickerRow
        label={label}
        value={timeLabel}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        grouped={grouped}
        onGlass={onGlass}
        accessibilityHint="Appuyer pour choisir l'heure"
      />
      <DatePicker
        open={open}
        mode="time"
        value={value}
        onChange={onChange}
        onClose={() => setOpen(false)}
        minimumDate={minimumDate}
      />
    </>
  );
}
