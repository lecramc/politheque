import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { View } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { translate } from '@/i18n';

export default function DatePickerIOS({
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
  mode: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
}) {
  const { colors } = useTheme();
  const [tempDate, setTempDate] = useState(value ?? new Date());

  useEffect(() => {
    if (open && value) {
      setTempDate(value);
    }
  }, [open, value]);

  if (!open) return null;

  return (
    <Modal
      animationType="slide"
      visible={open}
      onRequestClose={onClose}
      presentationStyle="formSheet"
    >
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: colors.surface.primary,
          },
        ]}
      >
        <DateTimePicker
          value={tempDate}
          mode={mode}
          display="spinner"
          textColor={colors.text.primary}
          minimumDate={minimumDate}
          onChange={(_, selected) => {
            if (selected) setTempDate(selected);
          }}
        />
        <View style={styles.footer}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Button variant="secondary" onPress={() => onClose()}>
              {translate('common.modal.cancel')}
            </Button>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Button
              variant="primary"
              onPress={() => {
                onChange(tempDate);
                onClose();
              }}
            >
              {translate('common.modal.confirm')}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
});
