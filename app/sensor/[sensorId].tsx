import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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
  const theme = Colors.light;
  const { fonte, apiUrl, refreshTrigger } = useDataSource();
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
      navigation.setOptions({ 
        title: `Histórico Sensor ${sensorId}`,
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
      });
    } else {
      console.warn('sensorId indefinido nos params');
      setLoading(false);
    }
  }, [sensorId, fonte, apiUrl, navigation, theme, refreshTrigger]);

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
        <View key={`${reading.id}`} style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.timestamp, { color: theme.tint }]}>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timestamp: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  valor: { fontSize: 18, fontWeight: '700' },
});
