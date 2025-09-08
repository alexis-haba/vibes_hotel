import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleProp } from 'react-native';

type IconSymbolProps = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<any>; // <-- On évite le conflit TextStyle
};

const IconSymbol: React.FC<IconSymbolProps> = ({
  name,
  size = 24,
  color = 'black',
  style,
}) => {
  const safeStyle: StyleProp<any> =
    style && typeof style !== 'string' ? style : {};

  return <Icon name={name} size={size} color={color} style={safeStyle} />;
};

export default IconSymbol;
