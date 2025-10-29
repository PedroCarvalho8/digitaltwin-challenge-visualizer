import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View as RNView,
  Pressable,
  TextInput,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useDataSource, Fonte } from '@/contexts/DataSourceContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function ConfiguracoesScreen() {
  const { fonte, apiUrl, setFonte, setApiUrl } = useDataSource();
  const { username, logout, isAuthenticated } = useAuth();
  const theme = Colors.light;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fontes: Fonte[] = ['localhost', 'api'];

  const getDisplayName = (fonte: Fonte) => {
    switch (fonte) {
      case 'api':
        return 'API Remota';
      case 'localhost':
        return 'API Local (localhost)';
      default:
        return 'Fonte desconhecida';
    }
  };

  const testarFonte = async (novaFonte: Fonte, url?: string) => {
    setErrorMessage(null);
    try {
      const testUrl = novaFonte === 'api' 
        ? (url || '') 
        : 'http://localhost:8080/api/readings';

      if (novaFonte === 'api' && !url) {
        throw new Error('URL da API remota não informada');
      }

      const response = await fetch(testUrl);
      if (!response.ok) throw new Error(`Erro na resposta: ${response.status}`);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro desconhecido ao testar a fonte');
      setTimeout(() => {
        setErrorMessage(null)
      }, 4000)
    }
  };

  const handleSetFonte = async (novaFonte: Fonte) => {
    setFonte(novaFonte);
    await testarFonte(novaFonte, apiUrl);
  };

  const handleSetApiUrl = async (url: string) => {
    setApiUrl(url);
    if (fonte === 'api') {
      await testarFonte(fonte, url);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao fazer logout');
      setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>

      {isAuthenticated && username && (
        <RNView style={[styles.userInfo, { backgroundColor: theme.card }]}>
          <Text style={[styles.userLabel, { color: theme.text }]}>
            Usuário logado:
          </Text>
          <Text style={[styles.username, { color: theme.accent }]}>
            {username}
          </Text>
        </RNView>
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Fonte de Dados</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {fontes.map((f) => {
          const selecionado = f === fonte;
          return (
            <Pressable
              key={f}
              onPress={() => handleSetFonte(f)}
              style={[
                styles.item,
                selecionado
                  ? { backgroundColor: theme.accent, shadowColor: theme.cardShadow }
                  : {
                      backgroundColor: theme.card,
                      shadowColor: theme.cardShadow,
                    },
              ]}
            >
              <RNView style={styles.itemRow}>
                <Text
                  style={[
                    styles.itemText,
                    selecionado
                      ? styles.selectedItemText
                      : { color: theme.text },
                  ]}
                >
                  {getDisplayName(f)}
                </Text>
              </RNView>
            </Pressable>
          );
        })}

        {fonte === 'api' && (
          <RNView style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              URL da API Remota:
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
              placeholder="https://exemplo.com/api"
              placeholderTextColor={theme.placeholder}
              value={apiUrl}
              onChangeText={handleSetApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </RNView>
        )}

        {errorMessage && (
          <Text style={[styles.errorText, { color: theme.error, marginTop: 10 }]}>
            {errorMessage}
          </Text>
        )}

        {isAuthenticated && (
          <Pressable
            onPress={handleLogout}
            style={[
              styles.logoutButton,
              {
                backgroundColor: theme.error,
                marginTop: 30,
              },
            ]}
          >
            <Text style={styles.logoutButtonText}>Sair</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
  },
  userInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  userLabel: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  item: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectedItemText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
