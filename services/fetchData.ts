import { Reading, NewReading } from '@/models/sensor';

type Fonte = 'api' | 'localhost';

export async function fetchData(fonte: Fonte = 'localhost', urlPersonalizada?: string) {
  const url =
    urlPersonalizada ||
    (fonte === 'api'
      ? 'https://suaapi.com/sensores'
      : 'http://localhost:8080/api/readings');

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.map((item: any) => ({
      id: item.id,
      sensorId: item.sensorId,
      readingValue: item.readingValue,
      timestamp: item.timestamp
    }));
  } catch (error) {
    return [];
  }
}

export async function createReading(
  reading: NewReading,
  fonte: Fonte = 'localhost',
  urlPersonalizada?: string
): Promise<Reading> {
  const url =
    urlPersonalizada ||
    (fonte === 'api'
      ? 'https://suaapi.com/sensores'
      : 'http://localhost:8080/api/readings');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(reading),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao criar leitura: ${response.status} - ${errorText}`);
    }

    const createdReading = await response.json();
    
    return {
      id: createdReading.id,
      sensorId: createdReading.sensorId,
      readingValue: createdReading.readingValue,
      timestamp: createdReading.timestamp,
    };
  } catch (error) {
    console.error('Erro ao criar leitura:', error);
    throw error;
  }
}

export async function createMultipleReadings(
  readings: NewReading[],
  fonte: Fonte = 'localhost',
  urlPersonalizada?: string
): Promise<Reading[]> {
  const promises = readings.map(reading => 
    createReading(reading, fonte, urlPersonalizada)
  );
  
  try {
    return await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao criar múltiplas leituras:', error);
    throw error;
  }
}
