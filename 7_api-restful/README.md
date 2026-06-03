# 🚀 API RESTful Avançada — MVC + JWT + MongoDB

Back-end completo com arquitetura **MVC**, autenticação via **JWT** e banco de dados **MongoDB (Mongoose)**.

---

## 📁 Estrutura do Projeto

```
api-restful/
├── server.js                        # Ponto de entrada
├── .env.example                     # Variáveis de ambiente (modelo)
├── package.json
└── src/
    ├── app.js                       # Configuração do Express
    ├── config/
    │   └── database.js              # Conexão com o MongoDB
    ├── models/         ← Model (M)
    │   ├── User.js                  # Esquema de Usuário
    │   └── Task.js                  # Esquema de Tarefa
    ├── controllers/    ← Controller (C)
    │   ├── authController.js        # Registro e Login
    │   ├── userController.js        # CRUD de Usuários
    │   └── taskController.js        # CRUD de Tarefas
    ├── routes/         ← View/Router (V)
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   └── taskRoutes.js
    └── middlewares/
        └── authMiddleware.js        # Verificação do JWT
```

---

## ⚙️ Instalação e Configuração

### 1. Pré-requisitos
- Node.js v18+
- MongoDB rodando localmente ou URI do MongoDB Atlas

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Edite o `.env` com suas configurações:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/api_restful
JWT_SECRET=sua_chave_secreta_forte_aqui
JWT_EXPIRES_IN=7d
```

### 4. Iniciar o servidor
```bash
# Produção
npm start

# Desenvolvimento (com auto-reload)
npm run dev
```

---

## 📋 Endpoints da API

### 🔐 Autenticação (`/api/auth`)

| Método | Rota            | Auth? | Descrição                     |
|--------|-----------------|-------|-------------------------------|
| POST   | `/api/auth/register` | ❌ | Cadastrar novo usuário       |
| POST   | `/api/auth/login`    | ❌ | Login — retorna token JWT    |
| GET    | `/api/auth/me`       | ✅ | Dados do usuário autenticado |

### 👤 Usuários (`/api/users`)

| Método | Rota              | Auth? | Descrição              |
|--------|-------------------|-------|------------------------|
| GET    | `/api/users`      | ✅    | Listar todos usuários  |
| GET    | `/api/users/:id`  | ✅    | Buscar usuário por ID  |
| PUT    | `/api/users/:id`  | ✅    | Atualizar perfil       |
| DELETE | `/api/users/:id`  | ✅    | Excluir conta          |

### ✅ Tarefas (`/api/tasks`)

| Método | Rota                     | Auth? | Descrição                   |
|--------|--------------------------|-------|-----------------------------|
| GET    | `/api/tasks`             | ✅    | Listar tarefas do usuário   |
| GET    | `/api/tasks/:id`         | ✅    | Buscar tarefa por ID        |
| POST   | `/api/tasks`             | ✅    | Criar nova tarefa           |
| PUT    | `/api/tasks/:id`         | ✅    | Atualizar tarefa completa   |
| PATCH  | `/api/tasks/:id/status`  | ✅    | Atualizar apenas o status   |
| DELETE | `/api/tasks/:id`         | ✅    | Excluir tarefa              |

---

## 📤 Exemplos de Requisições

### Registrar Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "senha": "senha123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "maria@exemplo.com",
  "senha": "senha123"
}
```
**Resposta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { "id": "...", "nome": "Maria Silva", "email": "maria@exemplo.com" }
}
```

### Criar Tarefa (com token no header)
```http
POST /api/tasks
Authorization: Bearer <seu_token_aqui>
Content-Type: application/json

{
  "titulo": "Estudar Node.js",
  "descricao": "Revisar middlewares e autenticação JWT",
  "prioridade": "alta",
  "dataVencimento": "2025-12-31"
}
```

### Listar Tarefas com Filtros
```http
GET /api/tasks?status=pendente&prioridade=alta&pagina=1&limite=5
Authorization: Bearer <seu_token_aqui>
```

### Atualizar Status da Tarefa
```http
PATCH /api/tasks/:id/status
Authorization: Bearer <seu_token_aqui>
Content-Type: application/json

{
  "status": "concluida"
}
```

---

## 🗄️ Modelos de Dados

### User
| Campo      | Tipo   | Restrições                        |
|------------|--------|-----------------------------------|
| nome       | String | Obrigatório, mín. 2 chars         |
| email      | String | Obrigatório, único, formato email |
| senha      | String | Obrigatório, mín. 6 chars (hash)  |
| createdAt  | Date   | Automático                        |
| updatedAt  | Date   | Automático                        |

### Task
| Campo          | Tipo     | Restrições / Valores                        |
|----------------|----------|---------------------------------------------|
| titulo         | String   | Obrigatório, máx. 120 chars                 |
| descricao      | String   | Opcional, máx. 500 chars                    |
| status         | String   | `pendente`, `em_progresso`, `concluida`     |
| prioridade     | String   | `baixa`, `media`, `alta`                    |
| dataVencimento | Date     | Opcional                                    |
| usuario        | ObjectId | Ref: User — obrigatório                     |

---

## 🔒 Fluxo de Autenticação JWT

```
Cliente             Servidor
  │                    │
  │── POST /register ──▶│  Cria usuário, criptografa senha (bcrypt)
  │◀─── token JWT ─────│
  │                    │
  │── POST /login ─────▶│  Verifica senha com bcrypt.compare()
  │◀─── token JWT ─────│
  │                    │
  │── GET /tasks ──────▶│  authMiddleware: verifica token JWT
  │  Authorization:    │  Injeta req.usuario e passa ao controller
  │  Bearer <token>    │
  │◀── dados JSON ─────│
```

---

## 📦 Dependências

| Pacote       | Versão  | Finalidade                        |
|--------------|---------|-----------------------------------|
| express      | ^4.18   | Framework HTTP                    |
| mongoose     | ^8.0    | ODM para MongoDB                  |
| bcryptjs     | ^2.4    | Criptografia de senhas            |
| jsonwebtoken | ^9.0    | Geração e verificação de tokens   |
| dotenv       | ^16.3   | Variáveis de ambiente             |
| nodemon      | ^3.0    | Hot-reload em desenvolvimento     |
