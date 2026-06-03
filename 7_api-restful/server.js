// server.js — Ponto de entrada da aplicação
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 3000;

// Conectar ao banco e iniciar o servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📋 Ambiente: ${process.env.NODE_ENV || "development"}\n`);
  });
});
