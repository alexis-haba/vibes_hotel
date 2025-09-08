import React from 'react';
import { TouchableOpacity, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HapticTabProps {
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  [key: string]: any;
}

const HapticTab = ({ onPress, children, ...props }: HapticTabProps) => {
  const handlePress = (e: GestureResponderEvent) => {
    Haptics.selectionAsync(); // Trigger haptic feedback
    if (onPress) {
      onPress(e); // Pass the event to the original onPress
    }
  };

  return <TouchableOpacity onPress={handlePress} {...props}>{children}</TouchableOpacity>;
};

export default HapticTab;