# Biblioteca Console

Sistema simples de **gerenciamento de biblioteca via terminal**.

## ✅ Requisitos
- Node.js instalado

## 📦 Instalação
```
npm install
```

## ▶️ Como executar
```
node index.js
```

## 📁 Estrutura
- `index.js` — ponto de entrada da aplicação
- `src/Biblioteca.js` — regras principais do sistema
- `src/Livro.js` — entidade e operações de livro
- `src/Usuario.js` — entidade e operações de usuário
- `src/Database.js` — acesso a dados

## ℹ️ Observações
- A persistência de dados é definida em `src/Database.js`.