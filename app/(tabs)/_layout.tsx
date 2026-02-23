import { AppColors } from '@/constants/styles';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
        headerStyle: { backgroundColor: AppColors.surface, elevation: 0, shadowOpacity: 0 },
        headerTintColor: AppColors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerTitle: 'RecolteCheck',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="parcelles"
        options={{
          title: 'Parcelles',
          headerTitle: 'Mes Parcelles',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🌿</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerTitle: 'Mon Profil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
