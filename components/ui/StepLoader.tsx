import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text, View } from '@/components/Themed';
import TimedProgressBar from '@/components/ui/progress/TimedProgressBar';

interface StepLoaderProps {
  title: string;
  steps: readonly string[];
  stepDuration: number;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function StepLoader({
  title,
  steps,
  stepDuration,
  message,
  icon = 'lock-closed',
}: StepLoaderProps) {
  const { colors, effects } = useTheme();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const runStep = (index: number) => {
      if (!isMounted || index >= steps.length) return;
      setTimeout(() => {
        if (!isMounted) return;
        setStepIndex(index + 1 < steps.length ? index + 1 : index);
        runStep(index + 1);
      }, stepDuration);
    };
    runStep(0);
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={[styles.container, { paddingHorizontal: effects.spacing.xl }]}>
      <Ionicons
        name={icon}
        size={40}
        color={colors.tint}
        style={[styles.icon, { marginBottom: effects.spacing.md }]}
      />

      <Text
        style={[
          styles.title,
          {
            color: colors.text.primary,
            fontSize: effects.sizes.text.subtitle,
            marginBottom: effects.spacing.lg,
          },
        ]}
      >
        {title}
      </Text>

      <TimedProgressBar duration={stepDuration * steps.length} />

      <Text
        style={[styles.step, { color: colors.text.secondary, fontSize: effects.sizes.text.label }]}
      >
        {steps[stepIndex]}
      </Text>

      <Text
        style={[
          styles.message,
          { color: colors.text.secondary, fontSize: effects.sizes.text.caption },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    opacity: 0.9,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
  step: {
    marginTop: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  message: {
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.7,
  },
});
