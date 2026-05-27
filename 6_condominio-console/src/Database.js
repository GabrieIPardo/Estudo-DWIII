const fs   = require('fs');
const path = require('path');
// Node.js 22 built-in SQLite — sem dependências externas!
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'condominio.db');

let _db = null;

// ── Inicializa banco ──────────────────────────────────────────────────────────
function conectar() {
  _db = new DatabaseSync(DB_PATH);
  _criarTabelas();

  // Se o banco está vazio, insere os dados de demonstração
  const total = _db.prepare('SELECT COUNT(*) AS n FROM condominoss').get();
  if (!total || total.n === 0) _seed();

  return _db;
}

// ── DDL ───────────────────────────────────────────────────────────────────────
function _criarTabelas() {
  _db.exec(`
    CREATE TABLE IF NOT EXISTS condominoss (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nome            TEXT    NOT NULL,
      cpf             TEXT    UNIQUE NOT NULL,
      email           TEXT    UNIQUE NOT NULL,
      telefone        TEXT    DEFAULT '',
      tipo            TEXT    DEFAULT 'condomino',
      num_automoveis  INTEGER DEFAULT 1,
      criado_em       TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS unidades (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      bloco        TEXT    NOT NULL,
      numero       TEXT    NOT NULL,
      tipo         TEXT    DEFAULT 'apartamento',
      condomino_id INTEGER REFERENCES condominoss(id),
      criado_em    TEXT    DEFAULT (datetime('now','localtime')),
      UNIQUE(bloco, numero)
    );

    CREATE TABLE IF NOT EXISTS garagens (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      numero       TEXT    NOT NULL UNIQUE,
      tipo         TEXT    DEFAULT 'sorteavel',
      condomino_id INTEGER REFERENCES condominoss(id),
      criado_em    TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS sorteios (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      observacoes  TEXT    DEFAULT '',
      realizado_em TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS sorteio_resultados (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      sorteio_id   INTEGER REFERENCES sorteios(id),
      garagem_id   INTEGER REFERENCES garagens(id),
      condomino_id INTEGER REFERENCES condominoss(id)
    );

    CREATE TABLE IF NOT EXISTS utensilios (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT    NOT NULL,
      quantidade  INTEGER DEFAULT 1,
      estado      TEXT    DEFAULT 'bom',
      observacoes TEXT    DEFAULT '',
      criado_em   TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS mensagens (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      condomino_id INTEGER REFERENCES condominoss(id),
      mensagem     TEXT    NOT NULL,
      enviada_em   TEXT    DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS reservas (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      condomino_id   INTEGER REFERENCES condominoss(id),
      data_evento    TEXT    NOT NULL,
      hora_inicio    TEXT    NOT NULL,
      hora_fim       TEXT    NOT NULL,
      motivo         TEXT    DEFAULT '',
      num_convidados INTEGER DEFAULT 0,
      status         TEXT    DEFAULT 'pendente',
      criado_em      TEXT    DEFAULT (datetime('now','localtime'))
    );
  `);
}

// ── Dados de demonstração ─────────────────────────────────────────────────────
function _seed() {
  const insCond = _db.prepare(
    'INSERT INTO condominoss (nome,cpf,email,telefone,tipo,num_automoveis) VALUES (?,?,?,?,?,?)'
  );
  [
    ['João Silva',     '111.111.111-11', 'joao@cond.com',    '(11) 91111-1111', 'sindico',    1],
    ['Maria Souza',    '222.222.222-22', 'maria@cond.com',   '(11) 92222-2222', 'subsindico', 1],
    ['Carlos Pereira', '333.333.333-33', 'carlos@cond.com',  '(11) 93333-3333', 'condomino',  2],
    ['Ana Lima',       '444.444.444-44', 'ana@cond.com',     '(11) 94444-4444', 'condomino',  1],
    ['Pedro Costa',    '555.555.555-55', 'pedro@cond.com',   '(11) 95555-5555', 'condomino',  2],
    ['Lucia Ferreira', '666.666.666-66', 'lucia@cond.com',   '(11) 96666-6666', 'condomino',  1],
  ].forEach(r => insCond.run(...r));

  const insUnit = _db.prepare(
    'INSERT INTO unidades (bloco,numero,tipo,condomino_id) VALUES (?,?,?,?)'
  );
  [
    ['A','101','apartamento',1], ['A','102','apartamento',2],
    ['A','201','apartamento',3], ['A','202','apartamento',4],
    ['B','101','apartamento',5], ['B','102','apartamento',6],
  ].forEach(r => insUnit.run(...r));

  const insGar = _db.prepare(
    'INSERT INTO garagens (numero,tipo,condomino_id) VALUES (?,?,?)'
  );
  [
    ['G-01','fixa_sindico',1],    ['G-02','fixa_subsindico',2],
    ['G-03','predeterminada',4],  ['G-04','predeterminada',6],
    ['G-05','sorteavel',null],    ['G-06','sorteavel',null],
    ['G-07','sorteavel',null],    ['G-08','sorteavel',null],
  ].forEach(r => insGar.run(...r));

  const insUt = _db.prepare(
    'INSERT INTO utensilios (nome,quantidade,estado,observacoes) VALUES (?,?,?,?)'
  );
  [
    ['Prato grande (30 cm)',    24, 'bom',     ''],
    ['Prato sobremesa (20 cm)', 24, 'bom',     ''],
    ['Xícara com pires',        30, 'bom',     ''],
    ['Taça de vinho',           40, 'regular', '3 unidades com trinca'],
    ['Copo americano',          50, 'bom',     ''],
    ['Panela grande (30 L)',     2, 'bom',     ''],
    ['Panela média (15 L)',      3, 'bom',     ''],
    ['Forma de bolo redonda',    6, 'bom',     ''],
    ['Talheres — jogo 24 pçs',   4, 'regular', 'alguns com manchas'],
    ['Garfo de servir',          6, 'bom',     ''],
    ['Concha grande',            4, 'bom',     ''],
    ['Travessa de vidro',        8, 'bom',     ''],
    ['Balde de gelo',            4, 'bom',     ''],
    ['Abridor de lata',          3, 'ruim',    'um quebrado — substituir'],
  ].forEach(r => insUt.run(...r));

  const insMsg = _db.prepare(
    'INSERT INTO mensagens (condomino_id, mensagem) VALUES (?,?)'
  );
  [
    [1, 'Bem-vindos ao chat! Use este espaço para tratar de assuntos coletivos. 🏢'],
    [2, 'Reunião de condomínio agendada para sexta-feira às 19h no salão. Presença importante!'],
    [3, 'Alguém sabe se o portão automático vai ser consertado essa semana?'],
    [1, 'Sim Carlos, o técnico vem na quinta-feira de manhã.'],
  ].forEach(r => insMsg.run(...r));
}

// ── Helpers de query ──────────────────────────────────────────────────────────

/** SELECT → array de objetos simples */
function query(sql, params = []) {
  // Trata o caso especial last_insert_rowid()
  if (/last_insert_rowid/i.test(sql)) {
    const row = _db.prepare('SELECT last_insert_rowid() AS id').get();
    return [{ id: row ? row.id : null }];
  }
  const rows = _db.prepare(sql).all(...params);
  // Converte null-prototype objects para objetos normais
  return rows.map(r => Object.assign({}, r));
}

/** INSERT / UPDATE / DELETE */
function exec(sql, params = []) {
  _db.prepare(sql).run(...params);
}

/** Último id inserido */
function lastInsertId() {
  const row = _db.prepare('SELECT last_insert_rowid() AS id').get();
  return row ? row.id : null;
}

// conectar pode ser chamada como async (por compatibilidade com o padrão do projeto)
async function conectarAsync() {
  return conectar();
}

module.exports = { conectar: conectarAsync, query, exec, lastInsertId };
