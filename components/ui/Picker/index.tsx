export { default } from './Picker';

export type PickerOption = {
  label: string;
  value: string;
};

export type PickerVariant = 'segmented';

export type PickerProps = {
  /**
   * Current selected value (string).
   */
  value: string;

  /**
   * List of options displayed in the picker.
   */
  options: PickerOption[];

  /**
   * Called when the user selects a new value.
   */
  onChange: (value: string) => void;

  disabled?: boolean;

  /**
   * Picker variant (UI style).
   * Default: 'segmented'
   *
   * Supported by Expo UI:
   * - iOS: segmented | wheel | menu | inline | palette
   * - Android: segmented | menu | palette | radio
   */
  variant?: PickerVariant;

  /**
   * Optional style applied to the Host wrapper.
   */
  style?: any;

  /**
   * Optional tint / highlight color for the active option.
   * iOS note: only applies to "menu", "segmented" variants.
   */
  color?: string;
};
