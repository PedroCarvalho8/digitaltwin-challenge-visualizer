import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Colors from '@/constants/Colors';
import { useDataSource } from '@/contexts/DataSourceContext';
import { fetchData } from '@/services/fetchData';
import { LineChart } from 'react-native-chart-kit';

interface Reading {
  id: number;
  sensorId: string;
  readingValue: number;
  timestamp: string;
}

const sensorNamesMap: Record<string, string> = {
  P: 'Pressão',
  F: 'Fluxo',
  T: 'Temperatura',
};

function getSensorName(sensorId: string): string {
  if (!sensorId || sensorId.length === 0) return 'Sensor';
  const letra = sensorId.charAt(0).toUpperCase();
  const nome = sensorNamesMap[letra] ?? 'Sensor';
  return nome;
}

export default function SensorHistoricoScreen() {
  const { sensorId } = useLocalSearchParams<{ sensorId: string }>();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = Colors.light;
  const { fonte, apiUrl, refreshTrigger } = useDataSource();
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

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

  // Preparar dados para o gráfico (ordem cronológica crescente)
  const chartData = useMemo(() => {
    if (!readings.length) return { labels: [], datasets: [{ data: [] }] };
    
    // Clonar e inverter para ordem cronológica crescente
    const sortedReadings = [...readings].reverse();
    
    // Limitar a 10 pontos mais recentes para melhor visualização
    const limitedReadings = sortedReadings.slice(-10);
    
    const labels = limitedReadings.map((reading) => {
      const date = new Date(reading.timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const data = limitedReadings.map((reading) => reading.readingValue);
    
    return {
      labels,
      datasets: [{ data }],
    };
  }, [readings]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!readings.length) return { min: 0, max: 0, avg: 0 };
    
    const values = readings.map(r => r.readingValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return { min, max, avg };
  }, [readings]);

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
      {/* Seção do Gráfico */}
      <View style={[styles.chartSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          Evolução - {getSensorName(sensorId || '')}
        </Text>
        
        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.text, opacity: 0.7 }]}>Mínimo</Text>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {stats.min.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.text, opacity: 0.7 }]}>Média</Text>
            <Text style={[styles.statValue, { color: theme.tint }]}>
              {stats.avg.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.text, opacity: 0.7 }]}>Máximo</Text>
            <Text style={[styles.statValue, { color: theme.error }]}>
              {stats.max.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Gráfico */}
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - 88}
            height={220}
            chartConfig={{
              backgroundColor: theme.card,
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(28, 28, 30, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: theme.tint,
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: theme.border,
                strokeWidth: 1,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
              marginLeft: -8,
            }}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            fromZero={false}
          />
        </View>

        <Text style={[styles.chartFooter, { color: theme.text, opacity: 0.6 }]}>
          {readings.length > 10 
            ? `Exibindo últimas 10 de ${readings.length} leituras` 
            : `Total de ${readings.length} leituras`}
        </Text>
      </View>

      {/* Seção da Lista */}
      <Text style={[styles.listTitle, { color: theme.text }]}>
        Histórico Detalhado
      </Text>

      {readings.map((reading) => (
        <View key={`${reading.id}`} style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.timestamp, { color: theme.tint }]}>
            {new Date(reading.timestamp).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text style={[styles.valor, { color: theme.text }]}>
            {reading.readingValue.toFixed(2)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 16, 
    paddingHorizontal: 12 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  chartSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  chartContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  chartFooter: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: { 
    fontSize: 13, 
    fontWeight: '600',
  },
  valor: { 
    fontSize: 22, 
    fontWeight: '700',
  },
});
