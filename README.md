# 📊 Readings API

Uma API REST desenvolvida com Spring Boot para armazenar e consultar leituras de sensores.

## ✅ Pré-requisitos

- Java 17+
- Maven 3.8+
- (Opcional) Postman ou curl para testar os endpoints

---

## ▶️ Como executar

Execute o projeto com o Maven:

```bash
mvn spring-boot:run
```

Por padrão, a aplicação roda na porta `8080`.

---

## 🗃️ Banco de dados H2

O banco de dados é armazenado localmente no seguinte caminho:

```
./data/readings.mv.db
```

Para acessar o console do H2:

- Acesse: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- JDBC URL: `jdbc:h2:file:./data/readings`
- Usuário: `sa`
- Senha: *(deixe em branco)*

---

## 🌐 Endpoints disponíveis

Base URL: `http://localhost:8080/api/readings`

| Método | Endpoint                   | Descrição                               |
|--------|----------------------------|-----------------------------------------|
| GET    | `/api/readings`           | Lista todas as leituras                 |
| GET    | `/api/readings/{sensorId}`| Filtra leituras por ID do sensor        |
| POST   | `/api/readings`           | Salva uma nova leitura                  |

---

## 📦 Exemplo de requisição com `curl`

### ▶️ POST /api/readings

```bash
curl -X POST http://localhost:8080/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "P001",
    "readingValue": 78.5,
    "timestamp": "2025-06-12T14:30:00"
}'
```

### ▶️ GET /api/readings

```bash
curl http://localhost:8080/api/readings
```

---

## 👨‍💻 Integrantes

| Nome completo             | RM       |
|--------------------------|----------|
| Pedro Henrique Pinheiro Carvalho          | RM551918 |
| Fernando Magalhães Perezine de Souza | RM98010 |
| Kauan Dintof Lopes    | RM551733  |
| Alexandre Wagner Nishimura    | RM98190   |

---
