import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View as RNView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { fetchData } from '@/services/fetchData';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Reading } from '@/models/sensor';
import { useDataSource } from '@/contexts/DataSourceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';

const sensorNamesMap: Record<string, string> = {
  P: 'Pressão',
  F: 'Fluxo',
  T: 'Temperatura',
};

const sensorIcons: Record<string, string> = {
  P: 'tachometer',
  F: 'tint',
  T: 'thermometer-half',
};

const sensorColors: Record<string, string> = {
  P: '#FF6B6B',
  F: '#4ECDC4',
  T: '#FFE66D',
};

function getSensorName(sensorId: string): string {
  if (!sensorId || sensorId.length === 0) return 'Sensor Desconhecido';
  const letra = sensorId.charAt(0).toUpperCase();
  const nome = sensorNamesMap[letra] ?? 'Sensor Desconhecido';
  return nome;
}

function getSensorIcon(sensorId: string): string {
  if (!sensorId || sensorId.length === 0) return 'database';
  const letra = sensorId.charAt(0).toUpperCase();
  return sensorIcons[letra] ?? 'database';
}

function getSensorColor(sensorId: string): string {
  if (!sensorId || sensorId.length === 0) return Colors.light.accent;
  const letra = sensorId.charAt(0).toUpperCase();
  return sensorColors[letra] ?? Colors.light.accent;
}

interface SensorData {
  sensorId: string;
  latestReading: Reading | null;
  allReadings: Reading[];
  stats: {
    min: number;
    max: number;
    avg: number;
    count: number;
  };
}

export default function DashboardScreen() {
  const [sensorsData, setSensorsData] = useState<Map<string, SensorData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = Colors.light;
  const screenWidth = Dimensions.get('window').width;
  const paddingHorizontal = 16;
  const gap = 12;
  const cardWidth = (screenWidth - (paddingHorizontal * 2) - gap) / 2;
  const chartWidth = cardWidth - 24; // width do card menos padding interno

  const { fonte, apiUrl, refreshTrigger } = useDataSource();
  const { token } = useAuth();
  const router = useRouter();

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      const urlPersonalizada = fonte === 'api' && apiUrl.trim().length > 0 ? apiUrl.trim() : undefined;
      const dados = await fetchData(fonte, urlPersonalizada, token) ?? [];

      // Agrupar dados por sensor
      const sensorsMap = new Map<string, SensorData>();

      dados.forEach((item: Reading) => {
        const sensorId = item.sensorId;
        
        if (!sensorsMap.has(sensorId)) {
          sensorsMap.set(sensorId, {
            sensorId,
            latestReading: item,
            allReadings: [item],
            stats: {
              min: item.readingValue,
              max: item.readingValue,
              avg: item.readingValue,
              count: 1,
            },
          });
        } else {
          const sensorData = sensorsMap.get(sensorId)!;
          sensorData.allReadings.push(item);
          
          // Atualizar última leitura (mais recente)
          if (new Date(item.timestamp).getTime() > new Date(sensorData.latestReading!.timestamp).getTime()) {
            sensorData.latestReading = item;
          }

          // Recalcular estatísticas
          const values = sensorData.allReadings.map(r => r.readingValue);
          sensorData.stats = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            count: values.length,
          };
        }
      });

      setSensorsData(sensorsMap);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setSensorsData(new Map());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fonte, apiUrl, refreshTrigger, token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const sensorsArray = Array.from(sensorsData.values());

  // Preparar dados para gráficos (últimas 6 leituras por sensor)
  const prepareChartData = (readings: Reading[]) => {
    if (!readings.length) return null;
    
    const sorted = [...readings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const limited = sorted.slice(-6);
    
    const labels = limited.map((r) => {
      const date = new Date(r.timestamp);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });
    
    const data = limited.map((r) => r.readingValue);
    
    return { labels, data };
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Carregando dashboard...
        </Text>
      </View>
    );
  }

  if (sensorsArray.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <FontAwesome name="database" size={48} color={theme.tabIconDefault} />
        <Text style={[styles.emptyText, { color: theme.text }]}>
          Nenhum sensor encontrado
        </Text>
        <Text style={[styles.emptySubText, { color: theme.placeholder }]}>
          Verifique sua conexão ou configure a fonte de dados
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
        }
      >
        {/* Cards de sensores */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Visão Geral</Text>
        <RNView style={styles.cardsContainer}>
          {sensorsArray.map((sensor) => {
            const color = getSensorColor(sensor.sensorId);
            const icon = getSensorIcon(sensor.sensorId);
            const latest = sensor.latestReading;

            return (
              <TouchableOpacity
                key={sensor.sensorId}
                style={[styles.sensorCard, { backgroundColor: theme.card }]}
                onPress={() => router.push(`/sensor/${sensor.sensorId}`)}
                activeOpacity={0.7}
              >
                <RNView style={styles.cardContent}>
                  <RNView style={styles.cardHeader}>
                    <FontAwesome name={icon as any} size={24} color={color} />
                    <Text style={[styles.sensorId, { color: theme.text }]}>
                      {sensor.sensorId}
                    </Text>
                  </RNView>
                  <Text style={[styles.sensorName, { color: theme.placeholder }]}>
                    {getSensorName(sensor.sensorId)}
                  </Text>
                  
                  {latest && (
                    <RNView style={styles.cardValueContainer}>
                      <Text style={[styles.sensorValue, { color }]}>
                        {latest.readingValue.toFixed(2)}
                      </Text>
                      <Text style={[styles.sensorTimestamp, { color: theme.placeholder }]}>
                        {new Date(latest.timestamp).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </RNView>
                  )}
                </RNView>

                <RNView style={styles.cardStats}>
                  <RNView style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.placeholder }]}>Mín</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {sensor.stats.min.toFixed(1)}
                    </Text>
                  </RNView>
                  <RNView style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.placeholder }]}>Méd</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {sensor.stats.avg.toFixed(1)}
                    </Text>
                  </RNView>
                  <RNView style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.placeholder }]}>Máx</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {sensor.stats.max.toFixed(1)}
                    </Text>
                  </RNView>
                </RNView>
              </TouchableOpacity>
            );
          })}
        </RNView>

        {/* Gráficos lado a lado */}
        {sensorsArray.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Gráficos em Tempo Real
            </Text>
            <RNView style={styles.chartsContainer}>
              {sensorsArray.map((sensor) => {
                const color = getSensorColor(sensor.sensorId);
                const chartData = prepareChartData(sensor.allReadings);

                if (!chartData || chartData.data.length === 0) return null;

                return (
                  <RNView
                    key={sensor.sensorId}
                    style={[styles.chartWrapper, { backgroundColor: theme.card }]}
                  >
                    <Text style={[styles.chartTitle, { color: theme.text }]}>
                      {sensor.sensorId} - {getSensorName(sensor.sensorId)}
                    </Text>
                    <RNView style={{ alignItems: 'center', width: '100%' }}>
                      <LineChart
                        data={{
                          labels: chartData.labels,
                          datasets: [
                            {
                              data: chartData.data,
                              color: (opacity = 1) => color,
                              strokeWidth: 2,
                            },
                          ],
                        }}
                        width={chartWidth}
                        height={160}
                        chartConfig={{
                          backgroundColor: theme.card,
                          backgroundGradientFrom: theme.card,
                          backgroundGradientTo: theme.card,
                          decimalPlaces: 1,
                          color: (opacity = 1) => color,
                          labelColor: (opacity = 1) => theme.text,
                          style: {
                            borderRadius: 12,
                          },
                          propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                            stroke: color,
                          },
                        }}
                        bezier
                        style={{
                          borderRadius: 12,
                        }}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                      />
                    </RNView>
                  </RNView>
                );
              })}
            </RNView>
          </>
        )}

        {/* Estatísticas consolidadas */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Estatísticas Consolidadas
        </Text>
        <RNView style={[styles.statsContainer, { backgroundColor: theme.card }]}>
          <RNView style={styles.statRow}>
            <Text style={[styles.statConsolidatedLabel, { color: theme.placeholder }]}>
              Total de Sensores:
            </Text>
            <Text style={[styles.statConsolidatedValue, { color: theme.accent }]}>
              {sensorsArray.length}
            </Text>
          </RNView>
          <RNView style={styles.statRow}>
            <Text style={[styles.statConsolidatedLabel, { color: theme.placeholder }]}>
              Total de Leituras:
            </Text>
            <Text style={[styles.statConsolidatedValue, { color: theme.accent }]}>
              {sensorsArray.reduce((sum, s) => sum + s.stats.count, 0)}
            </Text>
          </RNView>
        </RNView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 0,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sensorCard: {
    width: '48%',
    minHeight: 200,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorId: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  sensorName: {
    fontSize: 11,
    marginBottom: 12,
    opacity: 0.7,
  },
  cardValueContainer: {
    marginTop: 8,
  },
  sensorValue: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sensorTimestamp: {
    fontSize: 10,
    opacity: 0.6,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    marginBottom: 4,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartWrapper: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statConsolidatedLabel: {
    fontSize: 16,
  },
  statConsolidatedValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

