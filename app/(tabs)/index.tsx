import { AppColors, SharedStyles } from '@/constants/styles';
import { useAuth } from '@/contexts/auth-context';
import { Agriculteur, getParcelles, getProfile, Parcelle } from '@/lib/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Agriculteur | null>(null);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [p, pList] = await Promise.all([getProfile(user.uid), getParcelles(user.uid)]);
      setProfile(p);
      setParcelles(pList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <View style={SharedStyles.centerLoading}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  const totalSurface = parcelles.reduce((acc, p) => acc + (p.surface || 0), 0);
  const allCultures = [...new Set(parcelles.flatMap((p) => p.cultures || []))];

  return (
    <ScrollView
      style={SharedStyles.container}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      <View style={[SharedStyles.card, { backgroundColor: AppColors.primary, borderWidth: 0 }]}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: AppColors.white }}>
          Bonjour, {profile?.prenom || ''} {profile?.nom || ''}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
          Bienvenue sur RecolteCheck
        </Text>
      </View>

      <View style={SharedStyles.sectionHeader}>
        <View />
        <Text style={SharedStyles.title}>Apercu</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          style={[SharedStyles.card, { flex: 1, alignItems: 'center', paddingVertical: 24 }]}
          onPress={() => router.push('/(tabs)/parcelles')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 32, fontWeight: '800', color: AppColors.primary }}>{parcelles.length}</Text>
          <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginTop: 4, fontWeight: '500' }}>Parcelles</Text>
        </TouchableOpacity>

        <View style={[SharedStyles.card, { flex: 1, alignItems: 'center', paddingVertical: 24 }]}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: AppColors.accent }}>{totalSurface}</Text>
          <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginTop: 4, fontWeight: '500' }}>Hectares</Text>
        </View>
      </View>

      {allCultures.length > 0 && (
        <View style={SharedStyles.card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: AppColors.text, marginBottom: 10 }}>
            Cultures
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {allCultures.map((c, i) => (
              <View key={i} style={SharedStyles.chip}>
                <Text style={SharedStyles.chipText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {parcelles.length > 0 && (
        <>
          <View style={SharedStyles.sectionHeader}>
            <View />
            <Text style={[SharedStyles.title, { fontSize: 17 }]}>Dernieres parcelles</Text>
          </View>
          {parcelles.slice(0, 3).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={SharedStyles.card}
              onPress={() => router.push(`/parcelle/${p.id}`)}
              activeOpacity={0.7}
            >
              <View style={SharedStyles.row}>
                <Text style={{ fontSize: 13, color: AppColors.textSecondary, fontWeight: '600' }}>{p.surface} ha</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: AppColors.text }}>{p.nom}</Text>
              </View>
              {p.cultures?.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                  {p.cultures.map((c, i) => (
                    <View key={i} style={[SharedStyles.chip, { backgroundColor: AppColors.accent }]}>
                      <Text style={SharedStyles.chipText}>{c}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </>
      )}

      {parcelles.length === 0 && (
        <View style={[SharedStyles.card, { alignItems: 'center', paddingVertical: 40, marginTop: 8 }]}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🌱</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: AppColors.text }}>
            Aucune parcelle
          </Text>
          <Text style={{ fontSize: 14, color: AppColors.textSecondary, marginTop: 4, textAlign: 'center' }}>
            Commencez par ajouter votre premiere parcelle
          </Text>
          <TouchableOpacity
            style={[SharedStyles.button, { marginTop: 20, paddingHorizontal: 32 }]}
            onPress={() => router.push('/parcelle/form')}
            activeOpacity={0.8}
          >
            <Text style={SharedStyles.buttonText}>Ajouter une parcelle</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
