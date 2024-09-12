const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();


const bodyParserJSON = bodyParser.json();

const message = require('./modulo/config.js');

////////////////////////////////////////////////////////////////////// Import das Controllers ///////////////////////////////////////////////////////////////////////////////////////////

const controllerUsuario = require('./controller/controller_usuarios')
const controllerEndereco = require('./controller/controller_endereco');

////////////////////////////////////////////////////////////////////// End Point Usuarios ///////////////////////////////////////////////////////////////////////////////////////////

// Rota para listar os usuários
app.get('/v1/itermob/usuarios', cors(), async function(request, response, next) {
    // Chama a função para retornar os dados dos usuários
    let dadosUsuario = await controllerUsuario.getListarUsuarios();

    // Validação para verificar se existem dados
    if (dadosUsuario) {
        response.status(200).json(dadosUsuario);
    } else {
        response.status(404).json({ message: 'Nenhum registro encontrado' });
    }
});

// Rota para buscar um usuário pelo ID (com dados de endereço)
app.get('/v1/itermob/usuario/:id', cors(), async function(request, response, next) {
    let idUsuario = request.params.id;
  
    let dadosUsuario = await controllerUsuario.getBuscarUsuario(idUsuario);
  
    response.status(dadosUsuario.status_code).json(dadosUsuario);
});

app.get('/v1/itermob/usuario/:id/endereco', cors(), async function(request, response, next) {
    // Recebe o ID da requisição 
    let idUsuario = request.params.id;
  
    // Solicita para o controller o usuário e o endereço filtrando pelo ID
    let dadosUsuarioEndereco = await controllerUsuario.getBuscarUsuarioComEndereco(idUsuario);
  
    response.status(dadosUsuarioEndereco.status_code).json(dadosUsuarioEndereco);
});

app.post('/v1/itermob/inserirUsuario', async function(request, response, next) {
    try {
        let contentType = request.headers['content-type'] ? request.headers['content-type'].toLowerCase().trim() : '';
        let dadosBody = request.body;

        // Extrai os dados do endereço de dentro de dadosBody, se existir
        let dadosEndereco = dadosBody.dadosEndereco || null;

        // Verifica se dadosBody contém todos os campos obrigatórios
        if (!dadosBody.cpf || !dadosBody.nome || !dadosBody.sobrenome || !dadosBody.email || !dadosBody.telefone) {
            return response.status(400).json(message.ERROR_REQUIRED_FIELDS);
        }

        // Encaminha os dados da requisição para a controller enviar para o banco de dados
        let resultDados = await controllerUsuario.setInserirNovoUsuario(dadosBody, dadosEndereco, contentType);

        response.status(resultDados.status_code).json(resultDados);
    } catch (error) {
        console.error('Erro ao inserir usuário:', error);
        response.status(500).json(message.ERROR_INTERNAL_SERVER);
    }
});


// Rota para excluir um usuário pelo ID
app.delete('/v1/itermob/usuario/:id', cors(), async function(request, response, next) {
    // Recebe o ID da requisição
    let idUsuario = request.params.id;

    // Encaminha os dados para a controller excluir o usuário
    let resultDados = await controllerUsuario.setExcluirUsuario(idUsuario);

    response.status(resultDados.status_code).json(resultDados)
});

app.put('/v1/itermob/usuario/:id', cors(), bodyParserJSON, async function(request, response, next) {
    // Recebe o ID da requisição
    let idUsuario = request.params.id;

    // Recebe o content-type da requisição (API deve receber application/json)
    let contentType = request.headers['content-type'];

    // Recebe os novos dados encaminhados na requisição do body (JSON)
    let novosDadosUsuario = request.body;

    // Encaminha os dados para a controller atualizar o usuario
    let resultDados = await controllerUsuario.setAtualizarUsuario(idUsuario, novosDadosUsuario, contentType);

    response.status(resultDados.status_code).json(resultDados);
});

////////////////////////////////////////////////////////////////////// End Point Endereços ///////////////////////////////////////////////////////////////////////////////////////////

// Rota para listar todos os endereços
app.get('/v1/itermob/enderecos', cors(), async function(request, response, next) {
    // Chama a função para retornar os dados dos endereços
    let dadosEndereco = await controllerEndereco.getListarEnderecos();

    // Validação para verificar se existem dados
    if (dadosEndereco) {
        response.status(200).json(dadosEndereco);
    } else {
        response.status(404).json({ message: 'Nenhum registro encontrado' });
    }
});

// Rota para buscar um endereço pelo ID
app.get('/v1/itermob/endereco/:id', cors(), async function(request, response, next) {
    // Recebe o ID da requisição 
    let idEndereco = request.params.id;
  
    // Solicita para o controller o endereço filtrando pelo ID
    let dadosEndereco = await controllerEndereco.getBuscarEndereco(idEndereco);
  
    response.status(dadosEndereco.status_code).json(dadosEndereco);
});

// Rota para inserir um novo endereço
app.post('/v1/itermob/inserirEndereco', cors(), bodyParserJSON, async function(request, response, next) {
    // Recebe o content-type da requisição (API deve receber application/json)
    let contentType = request.headers['content-type'];

    // Recebe os dados encaminhados na requisição do body (JSON)
    let dadosBody = request.body;
   
    // Encaminha os dados da requisição para a controller enviar para o banco de dados
    let resultDados = await controllerEndereco.setInserirNovoEndereco(dadosBody, contentType);

    response.status(resultDados.status_code).json(resultDados);
});

// Rota para excluir um endereço pelo ID
app.delete('/v1/itermob/endereco/:id', cors(), async function(request, response, next) {
    // Recebe o ID da requisição
    let idEndereco = request.params.id;

    // Encaminha os dados para a controller excluir o endereço
    let resultDados = await controllerEndereco.setExcluirEndereco(idEndereco);

    response.status(resultDados.status_code).json(resultDados);
});

// Rota para atualizar um endereço pelo ID
app.put('/v1/itermob/endereco/:id', cors(), bodyParserJSON, async function(request, response, next) {
    // Recebe o ID da requisição
    let idEndereco = request.params.id;

    // Recebe os novos dados encaminhados na requisição do body (JSON)
    let novosDadosEndereco = request.body;

    // Encaminha os dados para a controller atualizar o endereço
    let resultDados = await controllerEndereco.setAtualizarEndereco(idEndereco, novosDadosEndereco);

    response.status(resultDados.status_code).json(resultDados);
});



app.listen(8080, function() {
    console.log('Servidor rodando na porta 8080');
});