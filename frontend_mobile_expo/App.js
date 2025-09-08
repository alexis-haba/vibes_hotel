import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

export default function App() {
  const router = useRouter();
  const [initialRoute, setInitialRoute] = useState('/login'); // Par défaut sur login

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token found:', token); // Débogage
        if (token) {
          const decoded = jwtDecode(token);
          console.log('Token expiration:', new Date(decoded.exp * 1000).toISOString()); // Débogage
          if (decoded.exp * 1000 > Date.now()) {
            console.log('Token valid, redirecting to /(tabs)');
            setInitialRoute('/(tabs)');
          } else {
            console.log('Token expired, removing');
            await AsyncStorage.removeItem('token');
            setInitialRoute('/login');
          }
        } else {
          console.log('No token, redirecting to /login');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setInitialRoute('/login');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (initialRoute) {
      console.log('Navigating to:', initialRoute); // Débogage
      router.replace(initialRoute);
    }
  }, [initialRoute]);

  // Placeholder pendant le chargement
  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return null; // Navigation gérée par Expo Router
}