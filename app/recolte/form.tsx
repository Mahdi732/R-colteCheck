import { AppColors, SharedStyles } from '@/constants/styles';
import { useAuth } from '@/contexts/auth-context';
import { addRecolte, getRecoltes, updateRecolte } from '@/lib/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RecolteFormScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    parcelleId: string;
    zoneId: string;
    recolteId?: string;
  }>();
  const isEdit = !!params.recolteId;

  const [culture, setCulture] = useState('');
  const [poidsKg, setPoidsKg] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isEdit || !user) return;
      let active = true;
      (async () => {
        try {
          const list = await getRecoltes(user.uid, params.parcelleId!, params.zoneId!);
          const r = list.find((x) => x.id === params.recolteId);
          if (active && r) {
            setCulture(r.culture || '');
            setPoidsKg(r.poidsKg?.toString() || '');
            if (r.dateRecolte) {
              const d = r.dateRecolte.toDate ? r.dateRecolte.toDate() : new Date(r.dateRecolte as any);
              setDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
            }
            setNotes(r.notes || '');
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [isEdit, user, params.parcelleId, params.zoneId, params.recolteId])
  );

  const handleSave = async () => {
    if (!culture.trim()) {
      Alert.alert('Champ requis', 'Le nom de la culture est obligatoire');
      return;
    }
    const poids = parseFloat(poidsKg);
    if (isNaN(poids) || poids <= 0) {
      Alert.alert('Erreur', 'Le poids doit etre un nombre positif');
      return;
    }

    let dateRecolte: Timestamp;
    if (dateStr.trim()) {
      const parsed = new Date(dateStr.trim());
      if (isNaN(parsed.getTime())) {
        Alert.alert('Erreur', 'Format de date invalide (ex: 2026-03-15)');
        return;
      }
      dateRecolte = Timestamp.fromDate(parsed);
    } else {
      dateRecolte = Timestamp.now();
    }

    setSaving(true);
    try {
      const data = {
        culture: culture.trim(),
        poidsKg: poids,
        dateRecolte,
        notes: notes.trim(),
      };
      if (isEdit) {
        await updateRecolte(user!.uid, params.parcelleId!, params.zoneId!, params.recolteId!, data);
      } else {
        await addRecolte(user!.uid, params.parcelleId!, params.zoneId!, data);
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
        <Stack.Screen options={{ title: isEdit ? 'Modifier recolte' : 'Nouvelle recolte' }} />
        <View style={SharedStyles.centerLoading}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Modifier recolte' : 'Nouvelle recolte' }} />
      <ScrollView style={SharedStyles.container} contentContainerStyle={SharedStyles.scrollContent}>
        <View style={SharedStyles.card}>
          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Culture *</Text>
            <TextInput
              style={SharedStyles.input}
              value={culture}
              onChangeText={setCulture}
              placeholder="Ex: Olivier"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>

          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Poids (kg) *</Text>
            <TextInput
              style={SharedStyles.input}
              value={poidsKg}
              onChangeText={setPoidsKg}
              placeholder="Ex: 500"
              placeholderTextColor={AppColors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Date de recolte (AAAA-MM-JJ)</Text>
            <TextInput
              style={SharedStyles.input}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="Ex: 2026-03-15"
              placeholderTextColor={AppColors.textMuted}
            />
            <Text style={{ fontSize: 12, color: AppColors.textMuted, marginTop: 4 }}>
              Laissez vide pour utiliser la date du jour
            </Text>
          </View>

          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Notes</Text>
            <TextInput
              style={[SharedStyles.input, { height: 80, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes optionnelles"
              placeholderTextColor={AppColors.textMuted}
              multiline
            />
          </View>

          <TouchableOpacity style={SharedStyles.button} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
            {saving ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={SharedStyles.buttonText}>{isEdit ? 'Modifier' : 'Enregistrer'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
