const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 4000;
var notas = require("./Controllers/notas.js");

// Dados para conexão à base de dados
const url = "mongodb://localhost:27017";
const dbName = "lab-03"; //Colocar o nome da Base de dados em Questão
const connect = mongoose.connect(url, { dbName: dbName });
const Users = require("./Models/users");

const jwt = require("jsonwebtoken");
const secretKey = 'secret';

// Função que gera o token usando o id e role do utilizador
function generateJWTToken(userId, role) {
	const payload = {
		userId: userId,
		role: role
	};

	const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
	return token;
}

app.use(express.json());

// Imprime os pedidos na consola
app.use(function (req, res, next) {
    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    console.log("Um novo pedido " + req.method + " foi realizado. " + datetime);
    if (req.method === "GET" && req.url !== "/notas/" && req.url !== "/login/" && !req.url.includes("/notas/pesquisar/")) {
        res.status(404).send("Endereço Inválido.");
    } else if(req.method === "POST" && req.url !== "/notas/") {
        res.status(404).send("Endereço Inválido.");
    } else if(req.method === "PATCH" && !req.url.includes("/notas/atualizar/")) {
        res.status(404).send("Endereço inválido.");
    } else if(req.method === "DELETE" && req.url !== "/notas/" && !req.url.includes("/notas/apagar/")) {
        res.status(404).send("Endereço inválido.");
    }
    next();
});

// Conexão à base de dados, ligação ao controller notas e inicialização
connect.then((db) => {
    console.log("Conectado à base de dados!");
    var notas = require("./Controllers/notas");
    app.use('/notas', notas);
    app.listen(port, () => console.log(`As minhas notas ${port}!`))
});

// Endpoint para fazer login requer name e password e devolve o token e o role
app.get('/login', (req, res) => {
	let name = req.body.name;
	let password = req.body.password;
	if(!name || !password) 
		return res.status(400).send("Name e password são necessários.");

	Users.findOne({ name: req.body.name, password: req.body.password})
	.then(result => {
		if(!(typeof(result) === 'undefined')){
			const token = generateJWTToken(result.userId, result.role);
			res.status(200).json({ token: token, userId: result.userId, role: result.role} );
		} else {
			res.status(401).send("Credenciais inválidas.");
		}
	}).catch(err => { res.status(401).send("Credenciais inválidas."); });
});

