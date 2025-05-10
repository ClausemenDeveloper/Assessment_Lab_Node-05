var express = require('express');
var router = express.Router();
const Notas = require("../Models/notas");
const secretKey = 'secret';
const jwt = require('jsonwebtoken');

// Função que verifica a autenticidade do Token e a permissão necessária 
function verificarToken(req, res, secret, roleNeeded) {
	try {
		var decoded = jwt.verify(req.body.token, secret);
		if(!(decoded.userId === req.body.userId) || !(decoded.role === req.body.role))
			return res.status(401).send("Token inválido.");
	} catch(error) {
		return res.status(401).send("Token inválido.");
	}
	if(!(roleNeeded.includes(req.body.role)))
		return res.status(403).send("Não tem permissão necessária.");
	return null;
}

// Middleware para verificar o Token e as permissões
router.use((req, res, next) => {
	if(req.method === "POST") {
		if(!(verificarToken(req, res, secretKey, ["admin", "normal"]) === null))
			return;
	} else if(req.method === "PATCH" || req.method === "DELETE") {
		if(!(verificarToken(req, res, secretKey, ["admin"]) === null))
			return;
	}
	next();
});

// Endpoint GET que devolve todos os documentos na coleção notas
router.get('/', (req, res) => { 
    let arrayString = "";
    Notas.find({}).then(result => {
        if (result != null) {
            for(var i = 0; i < result.length; i++) 
                arrayString += "Código: " + result[i].codigo + "; Disciplina: " + result[i].disciplina + "; Professor: " + result[i].professor +
                    "; Nota: " + result[i].nota + ";\n";
            return res.status(200).send("Documentos na Base de Dados:\n" + arrayString);
        } else {
            return res.status(400).send("Não foram encontrados documentos na Base de Dados.");
        }
    });
    return router;
});

// Endpoint GET que devolve o documento na coleção notas com código dado no URL
router.get('/pesquisar/:codigo', (req, res) => { 
    if(!isNaN(req.params.codigo)) {
        Notas.findOne({ "codigo": (Number) (req.params.codigo) }).then(result => {
            if (result != null) {
                    let arrayString = "Código: " + result.codigo + "; Disciplina: " + result.disciplina + "; Professor: " + result.professor +
                        "; Nota: " + result.nota + ";\n";
                return res.status(200).send("Documento da disciplina com Código " + req.params.codigo + ":\n" + arrayString);
            } else {
                return res.status(400).send("O documento com este código não foi encontrado.");
            }
        });
    } else {
        return res.status(400).send("Endereço inválido.");
    }
    return router;
});

// Endpoint POST que adiciona um documento dado no req.body na coleção notas
router.post('/', (req, res) => {
    let objEnviado = req.body;
    Notas.insertOne(objEnviado)
        .then(function () {
            res.status(200).send('Documento adicionado com sucesso.');
        }).catch(function (error) {
            res.status(400).send("Ocorreu um erro a adicionar o documento na Base de Dados.");
    });
    return router;
});

// Endpoint PATCH que atualiza os dados do documento na coleção notas cujo codigo é dado no URL
router.patch('/atualizar/:codigo', (req, res) => {
    let objEnviado = req.body;
    let updateDocStr = '';
    let codigoAtualizar = (Number) (req.params.codigo);
    if(!isNaN(req.params.codigo)) {
        Notas.findOne({ "codigo": (Number) (req.params.codigo) })
		.then(result => {
            if (result != null) {
                if(!(typeof(req.body.codigo) === 'undefined')) 
                    updateDocStr += '"codigo": ' + req.body.codigo + ',';
                if(!(typeof(req.body.disciplina) === 'undefined')) 
                    updateDocStr += '"disciplina": "' + req.body.disciplina + '",';
                if(!(typeof(req.body.professor) === 'undefined')) 
                    updateDocStr += '"professor": "' + req.body.professor + '",';
                if(!(typeof(req.body.nota) === 'undefined')) 
                    updateDocStr += '"nota": ' + req.body.nota + ',';
				if(updateDocStr.length > 0)
	            	updateDocStr = updateDocStr.substring(0, updateDocStr.length - 1);
                updateDocStr = '{' + updateDocStr + '}';
                let updateDoc = JSON.parse(updateDocStr);
                Notas.updateOne({ "codigo": codigoAtualizar }, updateDoc)
                .then(() => {
                	res.status(200).send('Documento atualizado com sucesso.');
                }).catch((error) => {
                	res.status(400).send('Ocorreu um erro ao atualizar o documento.\n' + JSON.stringify(error));
                });
            } else {
                return res.status(404).send("O documento não foi encontrado.");
            }
        }).catch((error) => {
			return res.status(400).send("Ocorreu um erro a encontrar o documento na base de dados.");
		});
    } else {
        return res.status(400).send("Endereço inválido.");
    }
    return router;
});

// Endpoint DELETE que apaga o documento na coleção notas cujo código é dado no URL
router.delete('/apagar/:codigo', (req, res) => {
    let codigo = (Number) (req.params.codigo);
    if(!isNaN(codigo)) {
		Notas.deleteOne({ codigo: (Number) (req.params.codigo) })
	    .then(function () {
			res.status(200).send("Documento apagado com sucesso.");
		}).catch(function (error) {
			res.status(400).send("Ocorreu um erro a apagar o documento.\n" + JSON.stringify(error));
		});
    } else {
		res.status(400).send("Endereço inválido.");
    }
    return router;
});

// Endpoint DELETE que apaga todos os documentos na coleção notas
router.delete('/', (req, res) => { 
    Notas.deleteMany({})
	.then(() => {
	    res.status(200).send('Todos os documentos foram apagados com sucesso.');
	}).catch((error) => {
	    res.status(400).send('Ocorreu um erro a apagar todos os documentos.');
    });
    return router;
});

module.exports = router;
