export type Reading = {
  id: number;
  sensorId: string;
  readingValue: number;
  timestamp: string;
};

export type NewReading = {
  sensorId: string;
  readingValue: number;
  timestamp: string;
};

export type CreateReadingRequest = Omit<Reading, 'id'>;