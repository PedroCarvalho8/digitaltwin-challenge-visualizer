# 📊 Readings API

Uma API REST desenvolvida com Spring Boot para armazenar e consultar leituras de sensores.

## ✅ Pré-requisitos

- Java 17+
- Maven 3.8+
- MySQL 8.0+
- (Opcional) Postman ou curl para testar os endpoints

---

## ▶️ Como executar

Execute o projeto com o Maven:

```bash
mvn spring-boot:run
```

Por padrão, a aplicação roda na porta `8080`.

---

## 🗃️ Configuração do Banco de Dados MySQL

### 1. Instalação do MySQL

Certifique-se de ter o MySQL instalado e rodando em sua máquina local.

### 2. Criação do Banco de Dados

Execute o seguinte comando no terminal do MySQL ou use o MySQL Workbench:

```bash
# Via linha de comando
mysql -u root -p < src/main/resources/schema.sql

# Ou execute no terminal do MySQL
```

Ou execute diretamente no MySQL:

```sql
CREATE DATABASE IF NOT EXISTS readings_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configuração de Credenciais

No arquivo `src/main/resources/application.properties`, ajuste as credenciais do MySQL se necessário:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/readings_db
spring.datasource.username=root
spring.datasource.password=root  # Altere para sua senha do MySQL
```

### 4. Execução

Ao executar a aplicação com `mvn spring-boot:run`, o Spring Boot automaticamente criará as tabelas necessárias (devido à configuração `spring.jpa.hibernate.ddl-auto=update`).

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
