type Fonte = 'mock' | 'api' | 'localhost';

export function fetchMockedData() {
  return require('@/mock/sensors.json');
}

export async function fetchData(fonte: Fonte = 'mock', urlPersonalizada?: string) {
  if (fonte === 'mock') {
    return fetchMockedData();
  }

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
