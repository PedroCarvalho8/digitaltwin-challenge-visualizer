import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { View, Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import AddReadingForm from '@/components/AddReadingForm';

export default function AdicionarScreen() {
  const theme = Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Nova Medição</Text>
      <Text style={[styles.subtitle, { color: theme.text, opacity: 0.7 }]}>
        Registre uma nova leitura de sensor
      </Text>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AddReadingForm />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
