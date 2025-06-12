import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Colors from '@/constants/Colors';
import { Sensor, Medicao } from '@/models/sensor';
import { fetchData } from '@/services/fetchData';
import { useDataSource } from '@/contexts/DataSourceContext';

export default function SensorHistoricoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sensor, setSensor] = useState<Sensor | null>(null);
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

        const sensores = await fetchData(fonte, urlPersonalizada);
        const encontrado = sensores?.find((s: Sensor) => s.sensor_id === id);
        if (encontrado) {
          encontrado.medicoes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        setSensor(encontrado ?? null);
      } catch (error) {
        console.error(error);
        setSensor(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) carregarHistorico();
  }, [id, fonte, apiUrl]);

  useLayoutEffect(() => {
  if (sensor?.tipo) {
    const formatarTitulo = (texto: string) =>
      texto
        .split('_')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
        .join(' ');

    navigation.setOptions({ title: formatarTitulo(sensor.tipo) });
  }
}, [navigation, sensor]);

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.tint} />
      <Text style={[{ color: theme.text, marginTop: 12 }]}>Carregando histórico...</Text>
    </View>
  );

  if (!sensor || !sensor.medicoes.length) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <Text style={[{ color: theme.text, fontSize: 16 }]}>Nenhum dado histórico disponível.</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Histórico do Sensor {sensor.sensor_id}</Text>

      {sensor.medicoes.map((item, index) => (
        <View key={index} style={[styles.item, { backgroundColor: theme.background }]}>
          <Text style={[styles.timestamp, { color: theme.text }]}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          <Text style={[styles.valor, { color: theme.text }]}>
            {item.valor} {item.unidade}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, paddingHorizontal: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
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
