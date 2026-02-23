import { AppColors, SharedStyles } from '@/constants/styles';
import { useAuth } from '@/contexts/auth-context';
import { addParcelle, getParcelle, updateParcelle } from '@/lib/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ParcelleFormScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ parcelleId?: string }>();
  const isEdit = !!params.parcelleId;

  const [nom, setNom] = useState('');
  const [surface, setSurface] = useState('');
  const [culturesText, setCulturesText] = useState('');
  const [periodeRecolte, setPeriodeRecolte] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isEdit || !user) return;
      let active = true;
      (async () => {
        try {
          const p = await getParcelle(user.uid, params.parcelleId!);
          if (active && p) {
            setNom(p.nom || '');
            setSurface(p.surface?.toString() || '');
            setCulturesText((p.cultures || []).join(', '));
            setPeriodeRecolte(p.periodeRecolte || '');
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [isEdit, user, params.parcelleId])
  );

  const handleSave = async () => {
    if (!nom.trim()) {
      Alert.alert('Champ requis', 'Le nom de la parcelle est obligatoire');
      return;
    }
    const surfaceNum = parseFloat(surface);
    if (isNaN(surfaceNum) || surfaceNum <= 0) {
      Alert.alert('Erreur', 'La surface doit etre un nombre positif');
      return;
    }

    const cultures = culturesText
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    setSaving(true);
    try {
      const data = {
        nom: nom.trim(),
        surface: surfaceNum,
        cultures,
        periodeRecolte: periodeRecolte.trim(),
      };
      if (isEdit) {
        await updateParcelle(user!.uid, params.parcelleId!, data);
      } else {
        await addParcelle(user!.uid, data);
      }
      router.back();
    } catch (e) {
      Alert.alert('Erreur', 'Echec de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: isEdit ? 'Modifier parcelle' : 'Nouvelle parcelle' }} />
        <View style={SharedStyles.centerLoading}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Modifier parcelle' : 'Nouvelle parcelle' }} />
      <ScrollView style={SharedStyles.container} contentContainerStyle={SharedStyles.scrollContent}>
        <View style={SharedStyles.card}>
          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Nom de la parcelle *</Text>
            <TextInput
              style={SharedStyles.input}
              value={nom}
              onChangeText={setNom}
              placeholder="Ex: Parcelle Oliviers"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>

          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Surface (hectares) *</Text>
            <TextInput
              style={SharedStyles.input}
              value={surface}
              onChangeText={setSurface}
              placeholder="Ex: 5.5"
              placeholderTextColor={AppColors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Cultures (separees par des virgules)</Text>
            <TextInput
              style={SharedStyles.input}
              value={culturesText}
              onChangeText={setCulturesText}
              placeholder="Ex: Olivier, Ble, Orge"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>

          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Periode de recolte</Text>
            <TextInput
              style={SharedStyles.input}
              value={periodeRecolte}
              onChangeText={setPeriodeRecolte}
              placeholder="Ex: Septembre - Novembre"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>

          <TouchableOpacity style={SharedStyles.button} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
            {saving ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={SharedStyles.buttonText}>{isEdit ? 'Modifier' : 'Ajouter'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
