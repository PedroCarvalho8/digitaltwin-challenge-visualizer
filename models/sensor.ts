export type Medicao = {
  valor: number;
  unidade: string;
  timestamp: string;
};

export type Sensor = {
  sensor_id: string;
  tipo: string;
  localizacao: string;
  medicoes: Medicao[];
};
