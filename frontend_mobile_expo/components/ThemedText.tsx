import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

type TextType = 'title' | 'default' | 'defaultSemiBold' | 'subtitle' | 'link'; // Types valides pour 'type'

export default function ThemedText({ type = 'default', style, ...rest }: { type?: TextType; style?: any; [key: string]: any }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Détermine la couleur en fonction du type
  const getColor = () => {
    switch (type) {
      case 'link':
        return theme.tint;
      case 'defaultSemiBold':
        return theme.tint; // Ou une autre couleur si désiré
      case 'title':
      case 'subtitle':
      case 'default':
      default:
        return theme.text; // Utilise 'text' comme fallback
    }
  };

  return (
    <Text
      style={[
        styles[type as keyof typeof styles] || styles.default,
        { color: getColor() },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});