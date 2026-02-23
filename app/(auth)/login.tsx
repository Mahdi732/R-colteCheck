import { auth } from '@/config/firebase';
import { AppColors, SharedStyles } from '@/constants/styles';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      let msg = 'Connexion echouee.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = 'Email ou mot de passe incorrect.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Adresse email invalide.';
      }
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={SharedStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}>
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: AppColors.primaryLight + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 36 }}>🌾</Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: '800', color: AppColors.text, letterSpacing: -0.5 }}>
            RecolteCheck
          </Text>
          <Text style={{ fontSize: 15, color: AppColors.textSecondary, marginTop: 6 }}>
            Connectez-vous a votre compte
          </Text>
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
            placeholder="Votre mot de passe"
            placeholderTextColor={AppColors.textMuted}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[SharedStyles.button, { marginTop: 12 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <Text style={SharedStyles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={{ color: AppColors.primary, fontWeight: '700', fontSize: 15 }}>
                Creer un compte
              </Text>
            </TouchableOpacity>
          </Link>
          <Text style={{ color: AppColors.textSecondary, fontSize: 15 }}>Pas encore de compte ?  </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
