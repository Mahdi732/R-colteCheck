import { AppColors, SharedStyles } from '@/constants/styles';
import { useAuth } from '@/contexts/auth-context';
import { deleteParcelle, getParcelles, Parcelle } from '@/lib/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ParcellesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getParcelles(user.uid);
      setParcelles(list);
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

  const handleDelete = (p: Parcelle) => {
    Alert.alert('Supprimer', `Voulez-vous supprimer "${p.nom}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteParcelle(user!.uid, p.id!);
            setParcelles((prev) => prev.filter((x) => x.id !== p.id));
          } catch (e) {
            Alert.alert('Erreur', 'Echec de la suppression');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={SharedStyles.centerLoading}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Parcelle }) => (
    <TouchableOpacity
      style={SharedStyles.card}
      onPress={() => router.push(`/parcelle/${item.id}`)}
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.7}
    >
      <View style={SharedStyles.row}>
        <Text style={{ fontSize: 13, color: AppColors.textSecondary, fontWeight: '600' }}>{item.surface} ha</Text>
        <Text style={{ fontSize: 17, fontWeight: '700', color: AppColors.text }}>{item.nom}</Text>
      </View>
      {item.periodeRecolte ? (
        <Text style={{ fontSize: 13, color: AppColors.textSecondary, marginTop: 4 }}>
          Periode : {item.periodeRecolte}
        </Text>
      ) : null}
      {item.cultures?.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {item.cultures.map((c, i) => (
            <View key={i} style={SharedStyles.chip}>
              <Text style={SharedStyles.chipText}>{c}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={SharedStyles.container}>
      <FlatList
        data={parcelles}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🌾</Text>
            <Text style={SharedStyles.emptyText}>Aucune parcelle{`\n`}Appuyez sur + pour en ajouter</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={SharedStyles.fab}
        onPress={() => router.push('/parcelle/form')}
        activeOpacity={0.8}
      >
        <Text style={SharedStyles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
