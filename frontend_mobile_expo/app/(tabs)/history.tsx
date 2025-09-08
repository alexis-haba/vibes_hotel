
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

interface Stay {
  _id: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  amount?: number;
  paymentMethod?: string;
  expenses?: number;
  stayType?: string;
  createdAt?: string;
}

export default function History() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);  

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching history with token:', token);
      const res = await api.get('/stays/history', { headers: { Authorization: `Bearer ${token}` } });
      console.log('History response:', res.data);
      setStays(res.data);
    } catch (err) {
      console.error('Fetch history error:', err);
      setError("Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.container}>
          <Text style={styles.error}>Non authentifié</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="history" size={28} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={styles.title}>Historique</Text>
          </View>
          <View style={styles.card}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="history" size={28} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={styles.title}>Historique</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.error}>{error}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={fetchData}>
            <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="history" size={28} color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={styles.title}>Historique</Text>
        </View>

        <FlatList
          data={stays}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.innerCard}>
              <Text>Date: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
              <Text>Chambre: {item.roomId || 'Inconnue'}</Text>
              <Text>Entrée: {item.checkIn ? new Date(item.checkIn).toLocaleString() : 'Non défini'}</Text>
              <Text>Sortie: {item.checkOut ? new Date(item.checkOut).toLocaleString() : 'Non défini'}</Text>
              <Text>Type: {item.stayType || 'N/A'}</Text>
              <Text>
                Montant: {(item.amount ?? 0).toLocaleString()} FG - Paiement: {item.paymentMethod || 'N/A'}
              </Text>
              {item.expenses !== undefined && item.expenses > 0 && (
                <Text>Dépenses: {item.expenses.toLocaleString()} FG</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.card}>
              <Text>Aucun historique disponible</Text>
            </View>
          }
          ListFooterComponent={
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
              <Text style={styles.buttonText}>Retour</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  innerCard: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  error: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});