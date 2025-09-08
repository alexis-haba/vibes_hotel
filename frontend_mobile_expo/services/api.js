import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.100.2:5000/api',
});

// Ajouter le token à chaque requête
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gérer les réponses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 401 → supprimer le token et renvoyer une réponse "propre"
      await AsyncStorage.removeItem('token');
      return { data: { msg: 'Unauthorized' }, status: 401 }; // ne rejette plus → plus de redbox
    }
    return Promise.reject(error); // autres erreurs restent rejetées
  }
);

export default api;
