# TwinVision - Digital Twin Challenge Visualizer

Aplicativo mobile para visualização e gerenciamento de leituras de sensores IoT em tempo real, desenvolvido com React Native e Expo.

## 📋 Requisitos

### Frontend
- Node.js 18+ ([Download](https://nodejs.org/))
- npm ou yarn
- Expo Go instalado no dispositivo móvel ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Backend
- Java 17+ ([Download](https://www.oracle.com/java/technologies/downloads/))
- Maven 3.8+ ([Download](https://maven.apache.org/download.cgi))
- Spring Boot API REST rodando na porta 8080

### Rede
- Frontend e Backend na **mesma rede Wi-Fi** (para testes em dispositivo físico)

---

## 🚀 Instalação e Configuração

### 1️⃣ Configurar o Backend (Spring Boot)

```bash
# Clone o repositório do backend (se ainda não fez)
git clone <url-do-repositorio-backend>
cd <nome-do-projeto-backend>

# Checkout para a branch entrega-2
git checkout entrega-2

# Compile o projeto com Maven
mvn clean install

# Execute a aplicação Spring Boot
mvn spring-boot:run

# Ou, se preferir usar o JAR compilado:
java -jar target/nome-do-projeto.jar
```

> **⚠️ Importante:** O backend com os endpoints necessários está na branch `entrega-2`. Certifique-se de fazer o checkout dessa branch antes de executar.

**Verificação:** Acesse `http://localhost:8080/api/readings` no navegador. Você deve ver uma resposta JSON.

### 2️⃣ Configurar o Frontend (React Native + Expo)

```bash
# Clone o repositório do frontend
git clone https://github.com/seu-usuario/digitaltwin-challenge-visualizer.git
cd digitaltwin-challenge-visualizer

# Instale as dependências
npm install
```

---

## ▶️ Executando a Aplicação

### Passo 1: Inicie o Backend

```bash
# No diretório do backend Spring Boot
mvn spring-boot:run
```

✅ **Backend rodando em:** `http://localhost:8080`

### Passo 2: Inicie o Frontend

```bash
# No diretório do frontend
npm start
```

### Passo 3: Abra no Dispositivo

1. **Instale o Expo Go** no seu celular
2. **Escaneie o QR Code** exibido no terminal
3. O app abrirá automaticamente

---

## 🔧 Configuração da API

### Opção 1: Localhost (Emulador)

Se estiver usando **emulador Android/iOS**, o app já está configurado para `localhost:8080`.

### Opção 2: Dispositivo Físico

Para usar em **celular real**, você precisa configurar o IP da sua máquina:

1. **Descubra seu IP local:**
   
   **Windows:**
   ```bash
   ipconfig
   # Procure por "Endereço IPv4" (ex: 192.168.1.100)
   ```
   
   **Mac/Linux:**
   ```bash
   ifconfig
   # Procure por "inet" (ex: 192.168.1.100)
   ```

2. **Configure no App:**
   - Abra o app no celular
   - Vá em **"Configurações"**
   - Selecione **"API Local (localhost)"** ou **"API Remota"**
   - Se escolheu API Remota, insira: `http://SEU_IP:8080/api/readings`
   - Exemplo: `http://192.168.1.100:8080/api/readings`

---

## 📱 Funcionalidades do App

### 🏠 Início
- Visualiza últimas leituras de todos os sensores
- Toque em um sensor para ver histórico completo
- Atualização automática quando novas leituras são adicionadas

### ➕ Adicionar
- Formulário para registrar novas medições
- Validação em tempo real
- Feedback de sucesso/erro

### ⚙️ Configurações
- Selecionar fonte de dados (API Local ou Remota)
- Configurar URL personalizada
- Teste de conexão automático

### 📊 Histórico do Sensor
- Gráfico de evolução das medições
- Estatísticas (Mínimo, Média, Máximo)
- Lista completa de leituras

---

## 🛠️ Troubleshooting

### ❌ "Network request failed"

**Causa:** Frontend não consegue acessar o backend

**Soluções:**
1. Verifique se o backend está rodando: `http://localhost:8080/api/readings`
2. Se estiver usando celular real, use o IP da máquina, não `localhost`
3. Desabilite firewall temporariamente para testar
4. Certifique-se de estar na mesma rede Wi-Fi

### ❌ "Connection refused"

**Causa:** Backend não está rodando ou porta incorreta

**Solução:**
```bash
# Verifique se a porta 8080 está em uso
# Windows:
netstat -ano | findstr :8080

# Mac/Linux:
lsof -i :8080
```

### ❌ Backend retorna 404

**Causa:** Endpoint incorreto

**Solução:** Verifique se o backend expõe os endpoints:
- `GET /api/readings` - Listar leituras
- `POST /api/readings` - Criar nova leitura

### ❌ App não carrega no Expo Go

**Solução:**
```bash
# Limpe o cache e reinstale
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

---

## 🌐 Endpoints da API

### GET /api/readings
Lista todas as leituras de sensores

**Resposta:**
```json
[
  {
    "id": 1,
    "sensorId": "P001",
    "readingValue": 6.8,
    "timestamp": "2025-09-30T10:00:00Z"
  }
]
```

### POST /api/readings
Cria uma nova leitura

**Requisição:**
```json
{
  "sensorId": "P001",
  "readingValue": 7.5,
  "timestamp": "2025-09-30T10:05:00Z"
}
```

**Resposta:**
```json
{
  "id": 10,
  "sensorId": "P001",
  "readingValue": 7.5,
  "timestamp": "2025-09-30T10:05:00Z"
}
```

---

## 📂 Estrutura do Projeto

```
digitaltwin-challenge-visualizer/
├── app/                      # Telas do aplicativo
│   ├── (tabs)/              # Navegação por abas
│   │   ├── inicio.tsx       # Lista de leituras
│   │   ├── adicionar.tsx    # Adicionar nova leitura
│   │   └── configuracoes.tsx # Configurações da API
│   └── sensor/              
│       └── [sensorId].tsx   # Histórico e gráfico do sensor
├── components/              # Componentes reutilizáveis
│   ├── AddReadingForm.tsx  # Formulário de adição
│   └── Themed.tsx          # Componentes com tema
├── services/               # Serviços de API
│   └── fetchData.ts        # GET e POST de leituras
├── contexts/               # Contextos React
│   └── DataSourceContext.tsx # Gerencia fonte de dados
├── constants/              # Constantes
│   └── Colors.ts           # Paleta de cores
├── models/                 # Tipos TypeScript
│   └── sensor.ts           # Tipos Reading, NewReading
└── package.json            # Dependências do projeto
```

---

## 🧪 Testando a Integração

### 1. Adicionar Leitura pelo App
1. Abra o app e vá em **"Adicionar"**
2. Preencha:
   - **ID do Sensor:** P001
   - **Valor:** 7.5
3. Clique em **"Adicionar Leitura"**
4. Vá em **"Início"** e veja a nova leitura

### 2. Verificar no Backend
```bash
# Faça uma requisição GET
curl http://localhost:8080/api/readings

# Você deve ver a nova leitura no JSON de resposta
```

---

## 📸 Screenshots da Aplicação

### Tela de Configurações
Configure a fonte de dados e URL da API.

![Tela de Configurações](exemplos_chamadas/Tela%20de%20configurações.png)

---

### Tela de Leituras com GET
Visualize todas as leituras obtidas via requisição GET para a API.

![Tela de Leituras](exemplos_chamadas/Tela%20Leituras%20com%20chamada%20GET%20para%20a%20API.png)

---

### Tela de Cadastro de Leituras com POST
Adicione novas leituras que são enviadas via POST para a API.

![Tela de Cadastro](exemplos_chamadas/Tela%20de%20Cadastro%20de%20leituras%20com%20chamada%20POST%20para%20a%20API.png)

---

### Tela de Histórico de Leituras
Visualize o histórico completo de um sensor com gráfico de evolução.

![Tela de Histórico](exemplos_chamadas/Tela%20de%20histórico%20de%20leituras.png)

---

### Exemplo de Chamada POST
Requisição POST sendo enviada para o backend.

![Chamada POST](exemplos_chamadas/Chamada%20POST.png)

---

## 📦 Tecnologias Utilizadas

### Frontend
- React Native
- Expo Router (Navegação)
- TypeScript
- react-native-chart-kit (Gráficos)
- react-native-svg (Renderização de gráficos)

### Backend (Esperado)
- Spring Boot
- Java 17+
- Maven
- REST API

---

## 🔗 Links Úteis

- [Documentação do Expo](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [TypeScript](https://www.typescriptlang.org/)

---

## 👨‍💻 Integrantes

| Nome completo                             | RM       |
|------------------------------------------|----------|
| Pedro Henrique Pinheiro Carvalho         | RM551918 |
| Fernando Magalhães Perezine de Souza     | RM98010  |
| Kauan Dintof Lopes                       | RM551733 |
| Alexandre Wagner Nishimura               | RM98190  |

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---

**🚀 Desenvolvido para o Digital Twin Challenge**
