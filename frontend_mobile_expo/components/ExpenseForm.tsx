import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

interface ExpenseFormProps {
  onSubmit: (expense: { description: string; amount: number }) => void;
}

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Montant"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button 
        title="Ajouter Dépense" 
        onPress={() => {
          if (description && amount) {
            onSubmit({ description, amount: Number(amount) });
            setDescription('');
            setAmount('');
          }
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 8,
    padding: 8,
  },
});
