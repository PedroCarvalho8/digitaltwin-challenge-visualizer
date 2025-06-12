import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  useColorScheme,
  View as RNView,
  Pressable,
  TextInput,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useDataSource, Fonte } from '@/contexts/DataSourceContext';

export default function ConfiguracoesScreen() {
  const { fonte, apiUrl, setFonte, setApiUrl } = useDataSource();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fontes: Fonte[] = ['mock', 'api', 'localhost'];

  const getDisplayName = (fonte: Fonte) => {
    switch (fonte) {
      case 'mock':
        return 'Mock (dados locais)';
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
      let testUrl = '';
      if (novaFonte === 'api') {
        if (!url) throw new Error('URL da API remota não informada');
        testUrl = url;
      } else if (novaFonte === 'localhost') {
        testUrl = 'http://localhost:3000';
      } else {
        return;
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Fonte de Dados</Text>

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
                  ? styles.selectedItemBackground
                  : {
                      backgroundColor:
                        colorScheme === 'light' ? '#fff' : '#1c1c1e',
                      shadowColor: theme.text,
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
                  backgroundColor:
                    colorScheme === 'light' ? '#fff' : '#2c2c2e',
                  color: theme.text,
                  borderColor: theme.tint,
                },
              ]}
              placeholder="https://exemplo.com/api"
              placeholderTextColor={colorScheme === 'light' ? '#999' : '#777'}
              value={apiUrl}
              onChangeText={handleSetApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </RNView>
        )}

        {errorMessage && (
          <Text style={[styles.errorText, { color: 'red', marginTop: 10 }]}>
            {errorMessage}
          </Text>
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
  scrollContent: {
    paddingBottom: 30,
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
  selectedItemBackground: {
    backgroundColor: '#155abc',
  },
  selectedItemText: {
    color: '#fff',
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
