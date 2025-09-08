import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RoomCardProps {
  number: string;
  status: 'Libre' | 'Occupée' | 'Nettoyage';
  onPress?: () => void;
}

export default function RoomCard({ number, status, onPress }: RoomCardProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.card}
    >
      <Text style={styles.title}>Chambre {number}</Text>
      <Text
        style={[
          styles.status,
          status === 'Libre'
            ? { color: 'green' }
            : status === 'Occupée'
            ? { color: 'red' }
            : { color: 'orange' }
        ]}
      >
        {status}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    marginTop: 8,
  },
});
