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

## 🔐 Autenticação JWT

A API utiliza autenticação baseada em JWT (JSON Web Tokens) para proteger os endpoints.

### Endpoints de Autenticação

| Método | Endpoint              | Descrição                                    |
|--------|-----------------------|----------------------------------------------|
| POST   | `/api/auth/register`  | Registra um novo usuário                     |
| POST   | `/api/auth/login`     | Faz login e retorna um token JWT            |
| GET    | `/api/auth/validate`  | Valida se um token é válido                 |

### 📝 Como Usar

#### 1. Registrar um novo usuário

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "senhaSegura123",
    "email": "usuario@exemplo.com"
  }'
```

**Resposta:**
```json
{
  "message": "Usuário criado com sucesso",
  "username": "usuario123"
}
```

#### 2. Fazer Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "senhaSegura123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "usuario123",
  "message": "Login realizado com sucesso"
}
```

#### 3. Usar o Token em Requisições Protegidas

Todos os endpoints de leituras (`/api/readings/**`) exigem autenticação.

```bash
# Obtenha o token do login e use no header Authorization
curl -X GET http://localhost:8080/api/readings \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🌐 Endpoints Protegidos

Base URL: `http://localhost:8080/api/readings`

**⚠️ Todos os endpoints abaixo exigem autenticação JWT**

| Método | Endpoint                   | Descrição                               | Autenticação |
|--------|----------------------------|-----------------------------------------|--------------|
| GET    | `/api/readings`           | Lista todas as leituras                 | ✅ Obrigatória |
| GET    | `/api/readings/{sensorId}`| Filtra leituras por ID do sensor        | ✅ Obrigatória |
| POST   | `/api/readings`           | Salva uma nova leitura                  | ✅ Obrigatória |

---

## 📦 Exemplos de Requisições com `curl`

### 🔓 Autenticação (Público)

#### Registrar Usuário
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "senhaSegura123",
    "email": "usuario@exemplo.com"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario123",
    "password": "senhaSegura123"
  }'
```

### 🔒 Requisições Protegidas (Requerem Token)

#### POST /api/readings

```bash
# Primeiro, faça login e copie o token
TOKEN="seu_token_aqui"

curl -X POST http://localhost:8080/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sensorId": "P001",
    "readingValue": 78.5,
    "timestamp": "2025-06-12T14:30:00"
  }'
```

#### GET /api/readings

```bash
TOKEN="seu_token_aqui"

curl -X GET http://localhost:8080/api/readings \
  -H "Authorization: Bearer $TOKEN"
```

#### GET /api/readings/{sensorId}

```bash
TOKEN="seu_token_aqui"

curl -X GET http://localhost:8080/api/readings/P001 \
  -H "Authorization: Bearer $TOKEN"
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
