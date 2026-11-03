import React, { useState } from 'react';

import DatePicker from '@/components/ui/DatePicker';
import { locale } from '@/i18n';

import PickerRow from './PickerRow';

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

export default function DateInput({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  minimumDate = TODAY,
  disabled = false,
  grouped = false,
  onGlass = false,
}: {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minimumDate?: Date;
  disabled?: boolean;
  grouped?: boolean;
  onGlass?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const dateLabel = value
    ? value.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : placeholder;

  return (
    <>
      <PickerRow
        label={label}
        value={dateLabel}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        grouped={grouped}
        onGlass={onGlass}
        accessibilityHint="Appuyer pour choisir la date"
      />
      <DatePicker
        open={open}
        mode="date"
        value={value}
        onChange={onChange}
        onClose={() => setOpen(false)}
        minimumDate={minimumDate}
      />
    </>
  );
}
