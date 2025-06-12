import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Colors from '@/constants/Colors';
import { useDataSource } from '@/contexts/DataSourceContext';
import { fetchData } from '@/services/fetchData';

interface Reading {
  id: number;
  sensorId: string;
  readingValue: number;
  timestamp: string;
}

export default function SensorHistoricoScreen() {
  const { sensorId } = useLocalSearchParams<{ sensorId: string }>();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { fonte, apiUrl } = useDataSource();
  const navigation = useNavigation();

 useEffect(() => {
    async function carregarHistorico() {
      setLoading(true);
      try {
        const urlPersonalizada =
          fonte === 'api' && apiUrl.trim().length > 0 ? apiUrl.trim() : undefined;

        const dados: Reading[] = await fetchData(fonte, urlPersonalizada);

        const leiturasSensor = dados.filter((r) => r.sensorId === sensorId);

        leiturasSensor.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setReadings(leiturasSensor);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        setReadings([]);
      } finally {
        setLoading(false);
      }
    }

    if (sensorId) {
      carregarHistorico();
      navigation.setOptions({ title: `Histórico Sensor ${sensorId}` });
    } else {
      console.warn('sensorId indefinido nos params');
      setLoading(false);
    }
  }, [sensorId, fonte, apiUrl, navigation]);

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={[{ color: theme.text, marginTop: 12 }]}>Carregando histórico...</Text>
      </View>
    );

  if (!readings.length)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[{ color: theme.text, fontSize: 16 }]}>
          Nenhum dado histórico disponível para o sensor {sensorId}.
        </Text>
      </View>
    );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {readings.map((reading) => (
        <View key={`${reading.id}`} style={[styles.item, { backgroundColor: theme.background }]}>
          <Text style={[styles.timestamp, { color: theme.text }]}>
            {new Date(reading.timestamp).toLocaleString()}
          </Text>
          <Text style={[styles.valor, { color: theme.text }]}>
            {reading.readingValue}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, paddingHorizontal: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  timestamp: { fontSize: 14, fontWeight: '600' },
  valor: { fontSize: 16, marginTop: 4 },
});
