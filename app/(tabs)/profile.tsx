import { AppColors, SharedStyles } from '@/constants/styles';
import { useAuth } from '@/contexts/auth-context';
import { getProfile, saveProfile } from '@/lib/firestore';
import { useFocusEffect } from '@react-navigation/native';
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

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!user) return;
        try {
          const p = await getProfile(user.uid);
          if (active && p) {
            setNom(p.nom || '');
            setPrenom(p.prenom || '');
            setTelephone(p.telephone || '');
            setVille(p.ville || '');
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [user])
  );

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert('Champs requis', 'Le nom et le prenom sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      await saveProfile(user!.uid, {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        ville: ville.trim(),
      });
      Alert.alert('Succes', 'Profil enregistre');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Deconnexion', 'Voulez-vous vous deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Deconnexion', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <View style={SharedStyles.centerLoading}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={SharedStyles.container} contentContainerStyle={SharedStyles.scrollContent}>
      <View style={[SharedStyles.card, { alignItems: 'center', paddingVertical: 28 }]}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: AppColors.primaryLight, alignItems: 'center',
          justifyContent: 'center', marginBottom: 10,
        }}>
          <Text style={{ fontSize: 32 }}>👤</Text>
        </View>
        <Text style={{ fontSize: 13, color: AppColors.textSecondary, fontWeight: '500' }}>
          Agriculteur
        </Text>
        <Text style={{ fontSize: 12, color: AppColors.textMuted, marginTop: 2 }}>
          {user?.email}
        </Text>
      </View>

      <View style={SharedStyles.card}>
        <View style={SharedStyles.inputGroup}>
          <Text style={SharedStyles.label}>Nom *</Text>
          <TextInput
            style={SharedStyles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Votre nom"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <View style={SharedStyles.inputGroup}>
          <Text style={SharedStyles.label}>Prenom *</Text>
          <TextInput
            style={SharedStyles.input}
            value={prenom}
            onChangeText={setPrenom}
            placeholder="Votre prenom"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <View style={SharedStyles.inputGroup}>
          <Text style={SharedStyles.label}>Telephone</Text>
          <TextInput
            style={SharedStyles.input}
            value={telephone}
            onChangeText={setTelephone}
            placeholder="0600000000"
            placeholderTextColor={AppColors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        <View style={SharedStyles.inputGroup}>
          <Text style={SharedStyles.label}>Ville</Text>
          <TextInput
            style={SharedStyles.input}
            value={ville}
            onChangeText={setVille}
            placeholder="Votre ville"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <TouchableOpacity style={SharedStyles.button} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <Text style={SharedStyles.buttonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[SharedStyles.dangerButton, { marginTop: 8 }]}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text style={SharedStyles.buttonText}>Deconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
