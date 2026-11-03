import { TouchableOpacity } from 'react-native';

import { Icon } from '@/components/Themed';

export default function HeaderButtonRight({
  iconName,
  onPress,
}: {
  iconName: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" hitSlop={8}>
      <Icon name={iconName} size="large" />
    </TouchableOpacity>
  );
}
