type Fonte = 'mock' | 'api' | 'localhost';

export function fetchMockedData() {
  return require('@/mock/sensors.json');
}

export async function fetchData(
  fonte: Fonte = 'mock',
  urlPersonalizada?: string
) {
  if (fonte === 'mock') {
    return fetchMockedData();
  }

  const url =
    urlPersonalizada ||
    (fonte === 'api'
      ? 'https://suaapi.com/sensores'
      : 'http://localhost:3000/sensores');

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    return [];
  }
}
