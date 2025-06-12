import { StyleSheet, ScrollView, useColorScheme, View as RNView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { fetchData } from '@/services/fetchData';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { Sensor } from '@/models/sensor';
import { useDataSource } from '@/contexts/DataSourceContext';
import { useRouter } from 'expo-router';

export default function TabOneScreen() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const { fonte, apiUrl } = useDataSource();
  const router = useRouter();

  useEffect(() => {
    async function carregarDados() {
      try {
        const urlPersonalizada = fonte === 'api' && apiUrl.trim().length > 0 ? apiUrl.trim() : undefined;
        const dados = await fetchData(fonte, urlPersonalizada);
        setSensores(dados ?? []);
      } catch (error) {
        console.error(error);
        setSensores([]);
      }
    }

    carregarDados();
  }, [fonte, apiUrl]);

  const getIconName = (tipo: string) => {
    switch (tipo) {
      case 'sensor_pressao':
        return 'tachometer';
      case 'sensor_temperatura':
        return 'thermometer-half';
      case 'sensor_fluxo':
        return 'exchange';
      default:
        return 'question';
    }
  };

  const getDisplayName = (tipo: string) => {
    switch (tipo) {
      case 'sensor_pressao':
        return 'Sensor de Pressão';
      case 'sensor_temperatura':
        return 'Sensor de Temperatura';
      case 'sensor_fluxo':
        return 'Sensor de Fluxo';
      default:
        return 'Tipo Desconhecido';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Sensores</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sensores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Nenhum dado encontrado.
            </Text>
            <Text style={[styles.emptySubText, { color: theme.text }]}>
              Verifique sua conexão ou vá até a tela de configurações para ajustar a fonte de dados.
            </Text>
          </View>
        ) : (
          sensores.map((item) => {
            const ultimaMedicao = item.medicoes.reduce((max, atual) => {
              return new Date(atual.timestamp) > new Date(max.timestamp) ? atual : max;
            }, item.medicoes[0]);

            return (
              <TouchableOpacity
                key={item.sensor_id}
                style={[
                  styles.sensorItem,
                  {
                    backgroundColor: colorScheme === 'light' ? '#fff' : '#1c1c1e',
                    shadowColor: theme.text,
                  },
                ]}
                onPress={() => router.push(`/sensor/${item.sensor_id}`)}
              >
                <RNView style={styles.headerRow}>
                  <FontAwesome
                    name={getIconName(item.tipo)}
                    size={22}
                    color={theme.tint}
                    style={styles.icon}
                  />
                  <Text style={[styles.sensorTitle, { color: theme.text }]}>
                    {getDisplayName(item.tipo)}
                  </Text>
                </RNView>

                <View style={styles.details}>
                  <Text style={[styles.label, { color: theme.tint }]}>ID:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>{item.sensor_id}</Text>
                </View>

                <View style={styles.details}>
                  <Text style={[styles.label, { color: theme.tint }]}>Localização:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>{item.localizacao}</Text>
                </View>

                <View style={styles.details}>
                  <Text style={[styles.label, { color: theme.tint }]}>Última Medição:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {ultimaMedicao.valor} {ultimaMedicao.unidade}
                  </Text>
                </View>

                <View style={styles.details}>
                  <Text style={[styles.label, { color: theme.tint }]}>Timestamp:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {new Date(ultimaMedicao.timestamp).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
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
  sensorItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    marginBottom: 6,
    padding: 2,
    borderRadius: 6,
  },
  label: {
    fontWeight: '600',
    marginRight: 6,
  },
  value: {
    flexShrink: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
  },
});
