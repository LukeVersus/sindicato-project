require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
var moment = require('moment');


module.exports = async function (app) {

    app.use(cookieParser());
    app.use(session({
        secret: "2C44-4D44-WppQ38S"
    }));

    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + 'inscricao/candidato/'+req.session.json.idCandidato,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {                    
                    var dataInicio = moment(body.data[i].turma.dataInicio).format("DD-MM-YYYY");
                    var dataFim = moment(body.data[i].turma.dataFim).format("DD-MM-YYYY");

                    const finallista = {
                        id: body.data[i].id,
                        idTurma: body.data[i].turma.id,
                        codigoTurma: body.data[i].turma.codigo,
                        categoria: body.data[i].turma.curso.categoria,
                        modalidade: body.data[i].turma.curso.modalidade,
                        curso: body.data[i].turma.curso.nome,
                        idCandidato: body.data[i].candidato.id,
                        nomeCandidato: body.data[i].candidato.nome,
                        motivo: body.data[i].motivoInscricao,
                        chave: body.data[i].chave,
                        dataInicio: dataInicio,
                        dataFim: dataFim,
                        horaInicio: body.data[i].turma.horaInicio,
                        horaFim: body.data[i].turma.horaFim,
                        cargaHoraria: body.data[i].turma.curso.cargaHoraria,
                        cienciaTermo: body.data[i].cienciaTermo
                    };
                    if (finallista.modalidade == 'PRESENCIAL') {
                        lista.push(finallista);
                    }
                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', { itens: lista, page: rota, informacoes: req.session.json });
                    }
                });
                return lista;
            });
        }
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/detail/:id', function (req, res) {
        categorias = [];
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "inscricao/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                var dataInicio = moment(body.data.turma.dataInicio).format("DD-MM-YYYY");
                var dataFim = moment(body.data.turma.dataFim).format("DD-MM-YYYY");

                var motivo;

                switch (body.data.motivoInscricao) {
                    case 'INICIATIVA_PROPRIA':
                        motivo = 'Iniciativa Própria';
                        break;
                    case 'ORIENTACAO_DO_AGENTE_DA_REDE':
                        motivo = 'Orientação do agente da rede';
                        break;
                    case 'RECOMENDACAO_DO_CHEFE':
                        motivo = 'Recomendação do chefe';
                        break;
                    default:
                        break;
                }

                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            codigoTurma: body.data.turma.codigo,
                            cursoTurma: body.data.turma.curso.nome,
                            categoria: body.data.turma.curso.categoria.nome,
                            nomeCandidato: body.data.candidato.nome,
                            motivo: motivo,
                            dataInicio: dataInicio,
                            dataFim: dataFim,
                            horaInicio: body.data.turma.horaInicio,
                            horaFim: body.data.turma.horaFim,
                            chave: body.data.chave,
                            cargaHoraria: body.data.turma.curso.cargaHoraria,
                            page: rota,
                            informacoes: req.session.json
                        });
                    }
                });
            });
        }
    });


    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "inscricao/" + req.body.id,
                method: "DELETE",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não excluído. " + body.errors);
                } else {
                    req.flash("success", "Item excluído com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });

        }
    });
}