# 📦 API Básica de Produtos

Este projeto é uma **API simples de gerenciamento de produtos**, permitindo a aplicação de operações básicas de **CRUD** em produtos.

## 🚀 Tecnologias utilizadas

* Node.js
* Express
* MySQL

## ▶️ Como executar o projeto

1. Instalar as dependências:

```
npm install
```

2. Configurar o banco de dados MySQL com as credenciais em `app.js`:
   - Host: localhost
   - Usuário: root
   - Senha: 'sua senha'
   - Banco: loja

3. Iniciar o servidor:

```
node app.js
```

4. O servidor será iniciado em:

```
http://localhost:3000
```

---

# 📌 Rotas da API

## GET /produtos

Retorna todos os produtos cadastrados.

**Exemplo de resposta:**

```json
[
  {
    "id": 1,
    "nome": "Notebook",
    "preco": 2500.00
  }
]
```

---

## GET /produtos/:id

Retorna um produto específico, buscando por ID.

**Exemplo**

```
GET /produtos/1
```

---

## POST /produtos

Cria um novo produto.

**Exemplo Body (JSON):**

```json
{
  "nome": "Mouse",
  "preco": 50.00
}
```

**Resposta**

```json
{
  "id": 2,
  "mensagem": "Produto inserido"
}
```

---

## PUT /produtos/:id

Atualiza os dados de um produto existente.

**Exemplo**

```
PUT /produtos/1
```

**Body (JSON)**

```json
{
  "nome": "Notebook Gamer",
  "preco": 3500.00
}
```

**Resposta**

```json
{
  "mensagem": "Produto atualizado"
}
```

---

## DELETE /produtos/:id

Remove um produto.

**Exemplo**

```
DELETE /produtos/1
```

**Resposta**

```json
{
  "mensagem": "Produto deletado"
}
```

---

Projeto desenvolvido para fins de estudo na disciplina **Desenvolvimento Web III**.