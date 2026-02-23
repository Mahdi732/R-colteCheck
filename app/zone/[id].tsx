import { AppColors, SharedStyles } from '@/constants/styles';
import { useAuth } from '@/contexts/auth-context';
import {
    deleteRecolte,
    deleteZone,
    getRecoltes,
    getZone,
    Recolte,
    Zone,
} from '@/lib/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

function formatDate(ts: any): string {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ZoneDetailScreen() {
  const { id, parcelleId } = useLocalSearchParams<{ id: string; parcelleId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [zone, setZone] = useState<Zone | null>(null);
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user || !id || !parcelleId) return;
    try {
      const [z, r] = await Promise.all([
        getZone(user.uid, parcelleId, id),
        getRecoltes(user.uid, parcelleId, id),
      ]);
      setZone(z);
      setRecoltes(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, id, parcelleId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const handleDeleteZone = () => {
    Alert.alert('Supprimer', 'Supprimer cette zone et toutes ses recoltes ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteZone(user!.uid, parcelleId, id);
            router.back();
          } catch (e) {
            Alert.alert('Erreur', 'Echec de la suppression');
          }
        },
      },
    ]);
  };

  const handleDeleteRecolte = (r: Recolte) => {
    Alert.alert('Supprimer', 'Supprimer cette recolte ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecolte(user!.uid, parcelleId, id, r.id!);
            setRecoltes((prev) => prev.filter((x) => x.id !== r.id));
          } catch (e) {
            Alert.alert('Erreur', 'Echec de la suppression');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Zone' }} />
        <View style={SharedStyles.centerLoading}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      </>
    );
  }

  if (!zone) {
    return (
      <>
        <Stack.Screen options={{ title: 'Erreur' }} />
        <View style={SharedStyles.centerLoading}>
          <Text style={SharedStyles.emptyText}>Zone introuvable</Text>
        </View>
      </>
    );
  }

  const totalKg = recoltes.reduce((acc, r) => acc + (r.poidsKg || 0), 0);

  return (
    <>
      <Stack.Screen options={{ title: zone.nom }} />
      <View style={SharedStyles.container}>
        <ScrollView
          contentContainerStyle={SharedStyles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        >
          <View style={SharedStyles.card}>
            <View style={SharedStyles.row}>
              <TouchableOpacity
                onPress={() => router.push(`/zone/form?parcelleId=${parcelleId}&zoneId=${id}`)}
                activeOpacity={0.7}
              >
                <Text style={{ color: AppColors.primary, fontWeight: '600', fontSize: 14 }}>Modifier</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: '700', color: AppColors.text }}>{zone.nom}</Text>
            </View>
            {zone.description ? (
              <Text style={{ fontSize: 14, color: AppColors.textSecondary, marginTop: 8 }}>
                {zone.description}
              </Text>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <View style={[SharedStyles.card, { flex: 1, alignItems: 'center', paddingVertical: 20 }]}>
              <Text style={{ fontSize: 26, fontWeight: '800', color: AppColors.primary }}>{recoltes.length}</Text>
              <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginTop: 2, fontWeight: '500' }}>Recoltes</Text>
            </View>
            <View style={[SharedStyles.card, { flex: 1, alignItems: 'center', paddingVertical: 20 }]}>
              <Text style={{ fontSize: 26, fontWeight: '800', color: AppColors.accent }}>{totalKg}</Text>
              <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginTop: 2, fontWeight: '500' }}>kg total</Text>
            </View>
          </View>

          <View style={[SharedStyles.row, { marginTop: 8, marginBottom: 8 }]}>
            <TouchableOpacity
              onPress={() => router.push(`/recolte/form?parcelleId=${parcelleId}&zoneId=${id}`)}
              activeOpacity={0.7}
            >
              <Text style={{ color: AppColors.primary, fontWeight: '700', fontSize: 15 }}>+ Ajouter</Text>
            </TouchableOpacity>
            <Text style={SharedStyles.title}>Historique ({recoltes.length})</Text>
          </View>

          {recoltes.length === 0 ? (
            <View style={[SharedStyles.card, { alignItems: 'center', paddingVertical: 32 }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🌾</Text>
              <Text style={{ fontSize: 14, color: AppColors.textSecondary }}>Aucune recolte enregistree</Text>
            </View>
          ) : (
            recoltes.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={SharedStyles.card}
                onPress={() =>
                  router.push(`/recolte/form?parcelleId=${parcelleId}&zoneId=${id}&recolteId=${r.id}`)
                }
                onLongPress={() => handleDeleteRecolte(r)}
                activeOpacity={0.7}
              >
                <View style={SharedStyles.row}>
                  <View style={[SharedStyles.chip, { backgroundColor: AppColors.accent }]}>
                    <Text style={SharedStyles.chipText}>{r.poidsKg} kg</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: AppColors.text }}>{r.culture}</Text>
                </View>
                <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginTop: 6 }}>
                  {formatDate(r.dateRecolte)}
                </Text>
                {r.notes ? (
                  <Text style={{ fontSize: 13, color: AppColors.textMuted, marginTop: 2 }}>
                    {r.notes}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={[SharedStyles.dangerButton, { marginTop: 16 }]}
            onPress={handleDeleteZone}
            activeOpacity={0.8}
          >
            <Text style={SharedStyles.buttonText}>Supprimer cette zone</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}
