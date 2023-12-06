const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

const conString = config.urlConnection;
const client = new Client(conString);
client.connect();

app.get("/", (req, res) => {
    res.send("Ok - Servidor disponível.");
});

app.get("/usuarios", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM Usuarios");
        res.send(result.rows);
    } catch (error) {
        console.error("Erro ao executar a qry de SELECT", error);
        res.status(500).send("Erro interno do servidor");
    }
});

app.get("/usuarios/:id", async (req, res) => {
    try {
        const result = await client.query(
            "SELECT * FROM Usuarios WHERE id = $1",
            [req.params.id]
        );
        res.send(result.rows);
    } catch (error) {
        console.error("Erro ao executar a qry de SELECT id", error);
        res.status(500).send("Erro interno do servidor");
    }
});

app.delete("/usuarios/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await client.query(
            "DELETE FROM Usuarios WHERE id = $1",
            [id]
        );
        
        if (result.rowCount === 0) {
            res.status(400).json({ info: "Registro não encontrado." });
        } else {
            res.status(200).json({ info: `Registro excluído. Código: ${id}` });
        }
    } catch (error) {
        console.error("Erro ao executar a qry de DELETE", error);
        res.status(500).send("Erro interno do servidor");
    }
});

app.post("/usuarios", async (req, res) => {
    try {
        const { nome, telefone, email } = req.body;
        const result = await client.query(
            "INSERT INTO Usuarios (nome, telefone, email) VALUES ($1, $2, $3) RETURNING *",
            [nome, telefone, email]
        );

        const { id } = result.rows[0];
        res.setHeader("id", `${id}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao executar a qry de INSERT", error);
        res.status(500).send("Erro interno do servidor");
    }
});

app.put("/usuarios/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { nome, telefone, email } = req.body;
        const result = await client.query(
            "UPDATE Usuarios SET nome=$1, telefone=$2, email=$3 WHERE id =$4 RETURNING *",
            [nome, telefone, email, id]
        );

        res.setHeader("id", id);
        res.status(202).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao executar a qry de UPDATE", error);
        res.status(500).send("Erro interno do servidor");
    }
});

app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app;
