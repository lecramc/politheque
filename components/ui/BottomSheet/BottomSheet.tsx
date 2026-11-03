import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { duration, spring, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';

import type { BottomSheetProps } from '.';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CLOSE_THRESHOLD = 80;
const CLOSE_VELOCITY = 500;

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  // La sheet suit le thème SYSTÈME (comme la sheet native iOS) → le contenu peut
  // utiliser systemColors de façon cohérente sur les deux plateformes.
  const { effects, systemColors } = useTheme();
  const { timing } = useMotion();
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  // Hauteur réelle de la feuille : le fond s'assombrit en proportion de sa montée.
  const sheetHeight = useSharedValue(SCREEN_HEIGHT);
  const isClosingRef = React.useRef(false);
  // La montée part du bord de la feuille (mesurée), pas du bas de l'écran : pas de temps mort.
  const openingRef = React.useRef(false);

  const hide = (after?: () => void) => {
    translateY.value = withTiming(sheetHeight.value, timing(duration.close, 'in'), (done) => {
      if (!done) return;
      runOnJS(setModalVisible)(false);
      if (after) runOnJS(after)();
    });
  };

  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      openingRef.current = true;
      translateY.value = SCREEN_HEIGHT;
      setModalVisible(true);
    } else if (modalVisible) {
      hide();
    }
  }, [isOpen]);

  const triggerClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    hide(onClose);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationY > CLOSE_THRESHOLD || e.velocityY > CLOSE_VELOCITY) {
        runOnJS(triggerClose)();
      } else {
        translateY.value = withSpring(0, spring.settle);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeight.value], [1, 0], 'clamp'),
  }));

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={triggerClose}
    >
      <TouchableWithoutFeedback onPress={triggerClose} accessibilityLabel="Fermer">
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          onLayout={(e) => {
            sheetHeight.value = e.nativeEvent.layout.height;
            if (!openingRef.current) return;
            openingRef.current = false;
            translateY.value = e.nativeEvent.layout.height;
            translateY.value = withTiming(0, timing(duration.sheet, 'out'));
          }}
          style={[
            styles.sheet,
            {
              backgroundColor: systemColors.surface.primary,
              borderTopLeftRadius: effects.borderRadius.large,
              borderTopRightRadius: effects.borderRadius.large,
            },
            animatedStyle,
          ]}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: systemColors.surface.border.secondary as string },
            ]}
          />
          {children}
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 4,
  },
});
