import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RoomSelector from './components/RoomSelector';
import StayForm from './components/StayForm';
import StayList from './components/StayList';
import ExpenseForm from './components/ExpenseForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          await AsyncStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'Home' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
        >
          {() => (
            <Stack.Navigator>
              <Stack.Screen
                name="HomeDashboard"
                component={HomeScreen}
                options={{ headerTitle: 'The Vibes Mobile' }}
              />
              <Stack.Screen
                name="StayForm"
                component={StayForm}
                options={{ title: 'Saisir un Séjour' }}
              />
              <Stack.Screen
                name="ExpenseForm"
                component={ExpenseForm}
                options={{ title: 'Saisir une Dépense' }}
              />
              <Stack.Screen
                name="StayList"
                component={StayList}
                options={{ title: 'Liste des Séjours' }}
              />
            </Stack.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;