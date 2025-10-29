import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View as RNView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useDataSource } from '@/contexts/DataSourceContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { login, register, isLoading } = useAuth();
  const { fonte, apiUrl } = useDataSource();
  const theme = Colors.light;

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Por favor, informe o usuário');
      return false;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, informe a senha');
      return false;
    }

    if (password.length < 3) {
      setErrorMessage('A senha deve ter pelo menos 3 caracteres');
      return false;
    }

    if (isRegisterMode) {
      if (!email.trim()) {
        setErrorMessage('Por favor, informe o email');
        return false;
      }

      if (!email.includes('@')) {
        setErrorMessage('Por favor, informe um email válido');
        return false;
      }

      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const baseUrl = fonte === 'api' 
        ? (apiUrl || 'http://localhost:8080')
        : 'http://localhost:8080';

      if (isRegisterMode) {
        await register({ username, email, password }, baseUrl);
      } else {
        await login({ username, password }, baseUrl);
      }

      // Navegar para a tela principal após autenticação bem-sucedida
      router.replace('/(tabs)/inicio');
    } catch (error: any) {
      setErrorMessage(error.message || `Erro ao ${isRegisterMode ? 'registrar' : 'fazer login'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setErrorMessage(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            {isRegisterMode ? 'Criar Conta' : 'Bem-vindo'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.placeholder }]}>
            {isRegisterMode
              ? 'Preencha os dados para criar sua conta'
              : 'Faça login para continuar'}
          </Text>

          <RNView style={styles.form}>
            <RNView style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Usuário</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Digite seu usuário"
                placeholderTextColor={theme.placeholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            </RNView>

            {isRegisterMode && (
              <RNView style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Digite seu email"
                  placeholderTextColor={theme.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isSubmitting}
                />
              </RNView>
            )}

            <RNView style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Senha</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Digite sua senha"
                placeholderTextColor={theme.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            </RNView>

            {isRegisterMode && (
              <RNView style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Confirmar Senha
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Confirme sua senha"
                  placeholderTextColor={theme.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </RNView>
            )}

            {errorMessage && (
              <RNView style={[styles.errorContainer, { backgroundColor: theme.error + '15' }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {errorMessage}
                </Text>
              </RNView>
            )}

            <Pressable
              style={[
                styles.submitButton,
                {
                  backgroundColor: theme.accent,
                  opacity: isSubmitting ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isRegisterMode ? 'Criar Conta' : 'Entrar'}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.toggleButton}
              onPress={toggleMode}
              disabled={isSubmitting}
            >
              <Text style={[styles.toggleButtonText, { color: theme.accent }]}>
                {isRegisterMode
                  ? 'Já tem uma conta? Faça login'
                  : 'Não tem uma conta? Registre-se'}
              </Text>
            </Pressable>
          </RNView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

