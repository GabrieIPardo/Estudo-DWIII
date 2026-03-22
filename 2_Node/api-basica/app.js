const express = require('express');
const app = express();
const mysql = require('mysql2');

app.use(express.json());

const PORT = 3000;

app.listen(PORT, function(){
    console.log(`Projeto iniciado na PORTa: ${PORT}`);
});


// 1. Configurar conexão
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'1234',
    database:'loja'
});

connection.connect((err) => {
    if(err) throw err;
    console.log('Conectado ao MySQL');
});


// 2. Create
app.post('/produtos', (req, res) => {
    const {nome, preco} = req.body;
    const sql = 'INSERT INTO produtos (nome, preco) VALUES (?, ?)';

    connection.query(sql, [nome, preco],  (err, result) => {
        if(err) throw err;
        res.json({ id: result.insertId, mensagem: 'Produto inserido' });
    });
});


// 3. Read
app.get('/produtos', (req, res) => {
    connection.query('SELECT * FROM produtos', (err, results) => {
        if(err) throw err;
        res.json(results);
    })
});


// 4. Read - id
app.get('/produtos/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM produtos WHERE id = ?';

    connection.query(sql, [id], (err, result) => {
        if(err) throw err;
        res.json(result)
    });
});


// 5. Update
app.put('/produtos/:id', (req, res) => {
    const {nome, preco} = req.body;
    const id = req.params.id;
    const sql = 'UPDATE produtos SET nome = ?, preco = ? WHERE id = ?';

    connection.query(sql, [nome, preco, id], (err, result) => {
        if(err) throw err;
        res.json({ mensagem: 'Produto atualizado' });
    });

});


// 6. DELETE
app.delete('/produtos/:id', (req, res) => {
    const id = req.params.id
    const sql = 'DELETE FROM produtos WHERE id = ?';

    connection.query(sql, [id], (err, result) => {
        if(err) throw err;
        res.json({ mensagem: 'Produto deletado' });
    });
});
