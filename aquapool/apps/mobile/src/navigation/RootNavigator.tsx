import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { View, ActivityIndicator } from 'react-native';

export function RootNavigator() {
  const { isAuthenticated, restoreSession } = useAuthStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    restoreSession().finally(() => setLoading(false));
  }, [restoreSession]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0F1E', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#0066FF" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
