const express = require("express");

// Importação das rotas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Middlewares globais
app.use(express.json());               // Parseia JSON no body das requisições
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use("/api/auth",  authRoutes);     // POST /api/auth/register | /api/auth/login
app.use("/api/users", userRoutes);     // GET/PUT/DELETE /api/users/...
app.use("/api/tasks", taskRoutes);     // CRUD de tarefas

// Rota raiz — verificação de saúde da API
app.get("/", (req, res) => {
  res.json({
    message: "API RESTful Avançada 🚀",
    version: "1.0.0",
    endpoints: {
      auth:  "/api/auth",
      users: "/api/users",
      tasks: "/api/tasks",
    },
  });
});

// Middleware de erros global (deve ser o ÚLTIMO)
app.use((err, req, res, next) => {
  console.error("❌ Erro:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
