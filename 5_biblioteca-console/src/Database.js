const fs         = require('fs');
const path       = require('path');
const initSqlJs  = require('sql.js');

const DB_PATH = path.join(__dirname, '..', 'biblioteca.db');

let _db   = null;   // instância sql.js
let _SQL  = null;   // classe SQL

// ── Inicializa banco (abre arquivo existente ou cria novo) ────────────────────
async function conectar() {
  _SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    _db = new _SQL.Database(buffer);
  } else {
    _db = new _SQL.Database();
    _criarTabelas();
    _seed();
    _salvar();
  }

  return _db;
}

// ── Persiste o banco em arquivo após cada operação de escrita ─────────────────
function _salvar() {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ── DDL: criação das tabelas ──────────────────────────────────────────────────
function _criarTabelas() {
  _db.run(`
    CREATE TABLE IF NOT EXISTS livros (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo      TEXT    NOT NULL,
      autor       TEXT    NOT NULL,
      isbn        TEXT    UNIQUE NOT NULL,
      genero      TEXT    DEFAULT 'Não informado',
      disponivel  INTEGER DEFAULT 1,
      criado_em   TEXT    DEFAULT (datetime('now','localtime'))
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT  NOT NULL,
      email     TEXT  UNIQUE NOT NULL,
      criado_em TEXT  DEFAULT (datetime('now','localtime'))
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS emprestimos (
      id                      INTEGER PRIMARY KEY AUTOINCREMENT,
      livro_id                INTEGER NOT NULL REFERENCES livros(id),
      usuario_id              INTEGER NOT NULL REFERENCES usuarios(id),
      data_emprestimo         TEXT    DEFAULT (datetime('now','localtime')),
      data_devolucao_prevista TEXT,
      data_devolucao_real     TEXT,
      status                  TEXT    DEFAULT 'ativo'   -- ativo | devolvido
    )
  `);
}

// ── Dados iniciais de demonstração ───────────────────────────────────────────
function _seed() {
  const livros = [
    ['Dom Casmurro',                    'Machado de Assis',         '978-8535910663', 'Romance'  ],
    ['1984',                            'George Orwell',            '978-8535914849', 'Distopia' ],
    ['O Pequeno Príncipe',              'Antoine de Saint-Exupéry', '978-8594318022', 'Infantil' ],
    ['Harry Potter - Pedra Filosofal',  'J.K. Rowling',             '978-8532523051', 'Fantasia' ],
    ['Sapiens',                         'Yuval Noah Harari',        '978-8535921229', 'História' ],
    ['Clean Code',                      'Robert C. Martin',         '978-0132350884', 'Tecnologia'],
  ];
  livros.forEach(([t, a, i, g]) =>
    _db.run('INSERT INTO livros (titulo, autor, isbn, genero) VALUES (?,?,?,?)', [t, a, i, g])
  );

  const usuarios = [
    ['Ana Beatriz',  'ana@biblioteca.com'   ],
    ['Carlos Lima',  'carlos@biblioteca.com'],
  ];
  usuarios.forEach(([n, e]) =>
    _db.run('INSERT INTO usuarios (nome, email) VALUES (?,?)', [n, e])
  );
}

// ── Helpers de query ──────────────────────────────────────────────────────────

/** Retorna array de objetos para um SELECT */
function query(sql, params = []) {
  const stmt    = _db.prepare(sql);
  const rows    = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

/** Executa INSERT/UPDATE/DELETE e salva o arquivo */
function exec(sql, params = []) {
  _db.run(sql, params);
  _salvar();
}

/** Retorna o último id inserido */
function lastInsertId() {
  return query('SELECT last_insert_rowid() AS id')[0].id;
}

module.exports = { conectar, query, exec, lastInsertId };
