// components/ui/TabBarBackground.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const TabBarBackground = () => (
  <View style={styles.background} />
);

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default TabBarBackground;