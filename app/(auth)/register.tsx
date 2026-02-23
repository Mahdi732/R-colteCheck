import { auth } from '@/config/firebase';
import { AppColors, SharedStyles } from '@/constants/styles';
import { saveProfile } from '@/lib/firestore';
import { Link } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nom.trim() || !prenom.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await saveProfile(cred.user.uid, {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: '',
        ville: '',
      });
    } catch (error: any) {
      let msg = 'Impossible de creer le compte.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Cet email est deja utilise.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Adresse email invalide.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Mot de passe trop faible.';
      }
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={SharedStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}>
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: AppColors.primaryLight + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 36 }}>🌾</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: AppColors.text, letterSpacing: -0.5 }}>
            Creer un compte
          </Text>
          <Text style={{ fontSize: 14, color: AppColors.textSecondary, marginTop: 6 }}>
            Agriculteur
          </Text>
        </View>

        <View style={SharedStyles.inputGroup}>
          <Text style={SharedStyles.label}>Nom</Text>
          <TextInput
            style={SharedStyles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Ex: Benali"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <View style={SharedStyles.inputGroup}>
          <Text style={SharedStyles.label}>Prenom</Text>
          <TextInput
            style={SharedStyles.input}
            value={prenom}
            onChangeText={setPrenom}
            placeholder="Ex: Ahmed"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <View style={SharedStyles.inputGroup}>
          <Text style={SharedStyles.label}>Email</Text>
          <TextInput
            style={SharedStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            placeholderTextColor={AppColors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={SharedStyles.inputGroup}>
          <Text style={SharedStyles.label}>Mot de passe</Text>
          <TextInput
            style={SharedStyles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="6 caracteres minimum"
            placeholderTextColor={AppColors.textMuted}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[SharedStyles.button, { marginTop: 12 }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <Text style={SharedStyles.buttonText}>Creer mon compte</Text>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={{ color: AppColors.primary, fontWeight: '700', fontSize: 15 }}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </Link>
          <Text style={{ color: AppColors.textSecondary, fontSize: 15 }}>Deja un compte ?  </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
