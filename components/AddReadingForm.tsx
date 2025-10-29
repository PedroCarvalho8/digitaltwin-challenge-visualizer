import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { createReading } from '@/services/fetchData';
import { NewReading } from '@/models/sensor';
import { useDataSource } from '@/contexts/DataSourceContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AddReadingForm() {
  const theme = Colors.light;
  const { fonte, apiUrl, notifyDataChanged } = useDataSource();
  const { token } = useAuth();
  
  const [sensorId, setSensorId] = useState('');
  const [readingValue, setReadingValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!sensorId.trim()) {
      Alert.alert('Erro', 'Por favor, informe o ID do sensor');
      return;
    }

    if (!readingValue.trim()) {
      Alert.alert('Erro', 'Por favor, informe o valor da leitura');
      return;
    }

    const valueNum = parseFloat(readingValue);
    if (isNaN(valueNum)) {
      Alert.alert('Erro', 'O valor da leitura deve ser um número válido');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const newReading: NewReading = {
        sensorId: sensorId.trim(),
        readingValue: valueNum,
        timestamp: new Date().toISOString(),
      };

      const urlPersonalizada = fonte === 'api' && apiUrl.trim().length > 0 ? apiUrl.trim() : undefined;
      
      const createdReading = await createReading(newReading, fonte, urlPersonalizada, token);
      
      setSuccessMessage(`Leitura criada com sucesso! ID: ${createdReading.id}`);
      
      // Notifica que os dados mudaram para atualizar as leituras
      notifyDataChanged();
      
      setSensorId('');
      setReadingValue('');
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Erro ao criar leitura:', error);
      setErrorMessage(error.message || 'Erro ao criar leitura');
      
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        Adicionar Nova Leitura
      </Text>
      
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: theme.text }]}>ID do Sensor:</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Ex: P001, T001, F001"
          placeholderTextColor={theme.placeholder}
          value={sensorId}
          onChangeText={setSensorId}
          autoCapitalize="characters"
          editable={!loading}
        />

        <Text style={[styles.label, { color: theme.text }]}>Valor da Leitura:</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Ex: 25.5"
          placeholderTextColor={theme.placeholder}
          value={readingValue}
          onChangeText={setReadingValue}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: loading ? theme.tabIconDefault : theme.accent,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Adicionar Leitura</Text>
          )}
        </Pressable>

        {successMessage && (
          <View style={[styles.messageBox, { backgroundColor: theme.success + '20', borderColor: theme.success }]}>
            <Text style={[styles.messageText, { color: theme.success }]}>
              ✓ {successMessage}
            </Text>
          </View>
        )}

        {errorMessage && (
          <View style={[styles.messageBox, { backgroundColor: theme.error + '20', borderColor: theme.error }]}>
            <Text style={[styles.messageText, { color: theme.error }]}>
              ✕ {errorMessage}
            </Text>
          </View>
        )}

        <View style={[styles.infoBox, { backgroundColor: theme.border + '40' }]}>
          <Text style={[styles.infoText, { color: theme.text }]}>
            ℹ️ A leitura será enviada para: {fonte === 'api' ? 'API Remota' : 'localhost:8080'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
});
