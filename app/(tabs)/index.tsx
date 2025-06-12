import { StyleSheet, ScrollView, useColorScheme, View as RNView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { fetchData } from '@/services/fetchData';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { Reading } from '@/models/sensor';
import { useDataSource } from '@/contexts/DataSourceContext';
import { useRouter } from 'expo-router';

export default function TabOneScreen() {
  const [leituras, setLeituras] = useState<Reading[]>([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const { fonte, apiUrl } = useDataSource();
  const router = useRouter();

  useEffect(() => {
    async function carregarDados() {
      try {
        const urlPersonalizada = fonte === 'api' && apiUrl.trim().length > 0 ? apiUrl.trim() : undefined;
        const dados = await fetchData(fonte, urlPersonalizada) ?? [];

        const ultimasLeiturasMap = new Map<string, Reading>();

        dados.forEach((item: Reading) => {
          const atual = ultimasLeiturasMap.get(item.sensorId);
          if (!atual) {
            ultimasLeiturasMap.set(item.sensorId, item);
          } else {
            if (new Date(item.timestamp).getTime() > new Date(atual.timestamp).getTime()) {
              ultimasLeiturasMap.set(item.sensorId, item);
            }
          }
        });

        const ultimasLeituras = Array.from(ultimasLeiturasMap.values());

        ultimasLeituras.sort((a, b) => a.sensorId.localeCompare(b.sensorId));

        setLeituras(ultimasLeituras);
      } catch (error) {
        console.error(error);
        setLeituras([]);
      }
    }

    carregarDados();
  }, [fonte, apiUrl]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Leituras</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {leituras.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Nenhuma leitura encontrada.
            </Text>
            <Text style={[styles.emptySubText, { color: theme.text }]}>
              Verifique sua conexão ou ajuste a fonte de dados nas configurações.
            </Text>
          </View>
        ) : (
          leituras.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.readingItem,
                {
                  backgroundColor: colorScheme === 'light' ? '#fff' : '#1c1c1e',
                  shadowColor: theme.text,
                },
              ]}
              onPress={() => router.push(`/sensor/${item.sensorId}`)}
            >
              <RNView style={styles.headerRow}>
                <FontAwesome
                  name="database"
                  size={22}
                  color={theme.tint}
                  style={styles.icon}
                />
                <Text style={[styles.sensorTitle, { color: theme.text }]}>
                  Sensor: {item.sensorId}
                </Text>
              </RNView>

              <View style={styles.details}>
                <Text style={[styles.label, { color: theme.tint }]}>Valor:</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {item.readingValue}
                </Text>
              </View>

              <View style={styles.details}>
                <Text style={[styles.label, { color: theme.tint }]}>Timestamp:</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
  readingItem: {
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
