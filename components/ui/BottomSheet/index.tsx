import React from 'react';

export type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactElement;
};

export { default } from './BottomSheet';
