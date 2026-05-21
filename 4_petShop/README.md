# 🐾 Pet Shop API

API REST completa para gerenciamento de um pet shop, desenvolvida com **Node.js + Express** e documentada com **Swagger (OpenAPI 3.0)**.

---

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor
npm start

# 3. Acessar o Swagger UI
http://localhost:3000/api-docs
```

---

## 📚 Endpoints disponíveis

| Recurso        | Base URL          | Descrição                                  |
|----------------|-------------------|--------------------------------------------|
| Tutores        | `/tutores`        | CRUD de clientes/tutores                   |
| Pets           | `/pets`           | CRUD de animais                            |
| Produtos       | `/produtos`       | Catálogo + controle de estoque             |
| Serviços       | `/servicos`       | Banho, tosa, consultas etc.                |
| Agendamentos   | `/agendamentos`   | Agendamento de serviços com validação      |
| Vendas         | `/vendas`         | Registro de vendas + relatório             |

---

## 🗂️ Estrutura do Projeto

```
petshop-api/
├── src/
│   ├── app.js                  # Entrada principal (Express + Swagger)
│   ├── swagger.js              # Configuração do Swagger/OpenAPI
│   ├── models/
│   │   └── database.js         # Banco de dados em memória (seed incluso)
│   └── routes/
│       ├── tutores.js
│       ├── pets.js
│       ├── produtos.js
│       ├── servicos.js
│       ├── agendamentos.js
│       └── vendas.js
├── package.json
└── README.md
```

---

## 📋 Exemplos de uso

### Criar tutor
```http
POST /tutores
Content-Type: application/json

{
  "nome": "Maria Oliveira",
  "email": "maria@email.com",
  "telefone": "11988880099",
  "endereco": "Rua dos Pets, 42"
}
```

### Cadastrar pet
```http
POST /pets
Content-Type: application/json

{
  "nome": "Mel",
  "especie": "cachorro",
  "raca": "Golden Retriever",
  "idade": 2,
  "peso": 28.0,
  "tutor_id": "<uuid do tutor>"
}
```

### Agendar serviço
```http
POST /agendamentos
Content-Type: application/json

{
  "pet_id": "<uuid do pet>",
  "servico_id": "<uuid do serviço>",
  "tutor_id": "<uuid do tutor>",
  "data_hora": "2025-07-10T10:00:00Z",
  "observacoes": "Tosa curta no corpo"
}
```

### Registrar venda
```http
POST /vendas
Content-Type: application/json

{
  "tutor_id": "<uuid do tutor>",
  "itens": [
    { "produto_id": "<uuid>", "quantidade": 2 },
    { "produto_id": "<uuid>", "quantidade": 1 }
  ]
}
```

### Atualizar status do agendamento
```http
PATCH /agendamentos/{id}/status
Content-Type: application/json

{ "status": "concluido" }
```

---

## ✨ Funcionalidades

- ✅ CRUD completo para todos os recursos
- ✅ Filtros por query params (espécie, categoria, status, data, preço)
- ✅ Relacionamentos (pet → tutor, agendamento → pet + serviço)
- ✅ Validação de estoque na venda (com desconto automático)
- ✅ Detecção de conflito de horário nos agendamentos
- ✅ Relatório financeiro de vendas
- ✅ Swagger UI interativo em `/api-docs`
- ✅ OpenAPI JSON exportável em `/api-docs.json`

---

## 🛠️ Tecnologias

- **Node.js** + **Express**
- **swagger-jsdoc** – gera a spec OpenAPI a partir dos comentários JSDoc
- **swagger-ui-express** – serve o Swagger UI
- **uuid** – geração de IDs únicos
- **cors** – habilita CORS para acesso externo

---
