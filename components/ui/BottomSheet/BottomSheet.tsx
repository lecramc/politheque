import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/components/ThemeContext';

import type { BottomSheetProps } from '.';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CLOSE_THRESHOLD = 80;
const CLOSE_VELOCITY = 500;
const SPRING_CONFIG = { damping: 20, stiffness: 300, overshootClamping: true };

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  // La sheet suit le thème SYSTÈME (comme la sheet native iOS) → le contenu peut
  // utiliser systemColors de façon cohérente sur les deux plateformes.
  const { effects, systemColors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const isClosingRef = React.useRef(false);

  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      translateY.value = SCREEN_HEIGHT;
      setModalVisible(true);
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG, () => {
        runOnJS(setModalVisible)(false);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (modalVisible && isOpen) {
      translateY.value = withSpring(0, SPRING_CONFIG);
    }
  }, [modalVisible]);

  const triggerClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG, () => {
      runOnJS(setModalVisible)(false);
      runOnJS(onClose)();
    });
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
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={triggerClose}
    >
      <TouchableWithoutFeedback onPress={triggerClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <GestureDetector gesture={panGesture}>
        <Animated.View
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
