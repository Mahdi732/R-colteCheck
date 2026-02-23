import { AppColors, SharedStyles } from '@/constants/styles';
import { useAuth } from '@/contexts/auth-context';
import {
    deleteParcelle,
    deleteZone,
    getParcelle,
    getZones,
    Parcelle,
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
    View
} from 'react-native';

export default function ParcelleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [parcelle, setParcelle] = useState<Parcelle | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user || !id) return;
    try {
      const [p, z] = await Promise.all([getParcelle(user.uid, id), getZones(user.uid, id)]);
      setParcelle(p);
      setZones(z);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const handleDeleteParcelle = () => {
    Alert.alert('Supprimer', 'Supprimer cette parcelle et toutes ses zones ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteParcelle(user!.uid, id);
            router.back();
          } catch (e) {
            Alert.alert('Erreur', 'Echec de la suppression');
          }
        },
      },
    ]);
  };

  const handleDeleteZone = (zone: Zone) => {
    Alert.alert('Supprimer', `Supprimer la zone "${zone.nom}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteZone(user!.uid, id, zone.id!);
            setZones((prev) => prev.filter((z) => z.id !== zone.id));
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
        <Stack.Screen options={{ title: 'Parcelle' }} />
        <View style={SharedStyles.centerLoading}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      </>
    );
  }

  if (!parcelle) {
    return (
      <>
        <Stack.Screen options={{ title: 'Erreur' }} />
        <View style={SharedStyles.centerLoading}>
          <Text style={SharedStyles.emptyText}>Parcelle introuvable</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: parcelle.nom }} />
      <View style={SharedStyles.container}>
        <ScrollView
          contentContainerStyle={SharedStyles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        >
          <View style={SharedStyles.card}>
            <View style={SharedStyles.row}>
              <TouchableOpacity onPress={() => router.push(`/parcelle/form?parcelleId=${id}`)} activeOpacity={0.7}>
                <Text style={{ color: AppColors.primary, fontWeight: '600', fontSize: 14 }}>Modifier</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: '700', color: AppColors.text }}>{parcelle.nom}</Text>
            </View>

            <View style={{ marginTop: 14 }}>
              <View style={[SharedStyles.row, { marginBottom: 8 }]}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: AppColors.text }}>{parcelle.surface} ha</Text>
                <Text style={{ fontSize: 14, color: AppColors.textSecondary }}>Surface</Text>
              </View>
              {parcelle.periodeRecolte ? (
                <View style={[SharedStyles.row, { marginBottom: 8 }]}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: AppColors.text }}>{parcelle.periodeRecolte}</Text>
                  <Text style={{ fontSize: 14, color: AppColors.textSecondary }}>Periode</Text>
                </View>
              ) : null}
            </View>

            {parcelle.cultures?.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: AppColors.textSecondary, marginBottom: 8 }}>Cultures</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {parcelle.cultures.map((c, i) => (
                    <View key={i} style={SharedStyles.chip}>
                      <Text style={SharedStyles.chipText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={[SharedStyles.row, { marginTop: 8, marginBottom: 8 }]}>
            <TouchableOpacity onPress={() => router.push(`/zone/form?parcelleId=${id}`)} activeOpacity={0.7}>
              <Text style={{ color: AppColors.primary, fontWeight: '700', fontSize: 15 }}>+ Ajouter</Text>
            </TouchableOpacity>
            <Text style={SharedStyles.title}>Zones ({zones.length})</Text>
          </View>

          {zones.length === 0 ? (
            <View style={[SharedStyles.card, { alignItems: 'center', paddingVertical: 32 }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📍</Text>
              <Text style={{ fontSize: 14, color: AppColors.textSecondary }}>Aucune zone</Text>
            </View>
          ) : (
            zones.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={SharedStyles.card}
                onPress={() => router.push(`/zone/${zone.id}?parcelleId=${id}`)}
                onLongPress={() => handleDeleteZone(zone)}
                activeOpacity={0.7}
              >
                <View style={SharedStyles.row}>
                  <Text style={{ color: AppColors.textMuted, fontSize: 18 }}>›</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: AppColors.text }}>{zone.nom}</Text>
                </View>
                {zone.description ? (
                  <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginTop: 4 }}>
                    {zone.description}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={[SharedStyles.dangerButton, { marginTop: 16 }]}
            onPress={handleDeleteParcelle}
            activeOpacity={0.8}
          >
            <Text style={SharedStyles.buttonText}>Supprimer cette parcelle</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}
