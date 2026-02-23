import { AppColors, SharedStyles } from '@/constants/styles';
import { useAuth } from '@/contexts/auth-context';
import { addZone, getZone, updateZone } from '@/lib/firestore';
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

export default function ZoneFormScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ parcelleId: string; zoneId?: string }>();
  const isEdit = !!params.zoneId;

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isEdit || !user || !params.parcelleId) return;
      let active = true;
      (async () => {
        try {
          const z = await getZone(user.uid, params.parcelleId!, params.zoneId!);
          if (active && z) {
            setNom(z.nom || '');
            setDescription(z.description || '');
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [isEdit, user, params.parcelleId, params.zoneId])
  );

  const handleSave = async () => {
    if (!nom.trim()) {
      Alert.alert('Champ requis', 'Le nom de la zone est obligatoire');
      return;
    }
    setSaving(true);
    try {
      const data = { nom: nom.trim(), description: description.trim() };
      if (isEdit) {
        await updateZone(user!.uid, params.parcelleId!, params.zoneId!, data);
      } else {
        await addZone(user!.uid, params.parcelleId!, data);
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
        <Stack.Screen options={{ title: isEdit ? 'Modifier zone' : 'Nouvelle zone' }} />
        <View style={SharedStyles.centerLoading}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Modifier zone' : 'Nouvelle zone' }} />
      <ScrollView style={SharedStyles.container} contentContainerStyle={SharedStyles.scrollContent}>
        <View style={SharedStyles.card}>
          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Nom de la zone *</Text>
            <TextInput
              style={SharedStyles.input}
              value={nom}
              onChangeText={setNom}
              placeholder="Ex: Zone A"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>

          <View style={SharedStyles.inputGroup}>
            <Text style={SharedStyles.label}>Description</Text>
            <TextInput
              style={[SharedStyles.input, { height: 80, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description optionnelle"
              placeholderTextColor={AppColors.textMuted}
              multiline
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
