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
    app.get('/app/turma/:id/' + rota + '/:codigo', function (req, res) {

        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + 'inscricao/turma/'+ req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    var motivo;

                    switch (body.data[i].motivoInscricao) {
                        case "INICIATIVA_PROPRIA":
                            motivo = "Iniciativa própria";
                            break;
                        case "ORIENTACAO_DO_AGENTE_DA_REDE":
                            motivo = "Orientação do agente da rede";
                            break;
                        case "RECOMENDACAO_DO_CHEFE":
                            motivo = "Recomendação do chefe";
                            break;
                        default:
                            break;
                    }

                    const finallista = {
                        id: body.data[i].id,
                        turma: body.data[i].turma.codigo,
                        curso: body.data[i].turma.curso.nome,
                        idcurso: body.data[i].turma.curso.idcurso != null ? body.data[i].turma.curso.idcurso : 0,
                        categoria: body.data[i].turma.curso.categoria.nome,
                        candidato: body.data[i].candidato.nome,
                        username: body.data[i].candidato.cpf,
                        candidatoLotacao: body.data[i].candidato.lotacao,
                        candidatoCargo: body.data[i].candidato.cargo,
                        candidatoFuncao: body.data[i].candidato.funcao,
                        candidatoOrgao: body.data[i].candidato.orgao.nome,
                        deferido: body.data[i].deferido,
                        motivo: motivo
                    };
                    lista.push(finallista);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', { idTurma: req.params.id,codigoTurma: req.params.codigo, itens: lista, page: rota, informacoes: req.session.json });
                    }
                });
                return lista;
            });
        }
    });


    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
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
                var motivo;
                switch (body.data.motivoInscricao) {
                    case "INICIATIVA_PROPRIA":
                        motivo = "Iniciativa própria";
                        break;
                    case "ORIENTACAO_DO_AGENTE_DA_REDE":
                        motivo = "Orientação do agente da rede";
                        break;
                    case "RECOMENDACAO_DO_CHEFE":
                        motivo = "Recomendação do chefe";
                        break;
                    default:
                        break;
                }

                var formacao;

                switch (body.data.candidato.tpformacao) {
                    case "ENSINO_MEDIO":
                        formacao = "Ensino médio";
                        break;
                    case "SUPERIOR_INCOMPLETO":
                        formacao = "Superior incompleto";
                        break;
                    case "SUPERIOR_COMPLETO":
                        formacao = "Superior completo";
                        break;
                    case "POS_GRADUACAO":
                        formacao = "Pós graduação";
                        break;
                    case "MESTRADO":
                        formacao = "Mestrado";
                        break;
                    case "DOUTORADO":
                        formacao = "Doutorado";
                        break;
                    default:
                        break;
                }
                var datanasc = moment(body.data.candidato.datanascimento).toDate();
                
                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            turma: {
                                id: body.data.turma.id,
                                codigo: body.data.turma.codigo,
                                curso: body.data.turma.curso.nome
                            },
                            motivo: motivo,
                            candidato: {
                                nome: body.data.candidato.nome,
                                lotacao: body.data.candidato.lotacao,
                                cargo: body.data.candidato.cargo,
                                funcao: body.data.candidato.funcao,
                                area: body.data.candidato.area,
                                matricula: body.data.candidato.matricula,
                                rg: body.data.candidato.rg,
                                cpf: body.data.candidato.cpf,
                                sexo: body.data.candidato.sexo,
                                endereco: {
                                    logradouro: body.data.candidato.endereco.logradouro,
                                    numero: body.data.candidato.endereco.numero,
                                    complemento: body.data.candidato.endereco.complemento,
                                    bairro: body.data.candidato.endereco.bairro,
                                    cep: body.data.candidato.endereco.cep,
                                    contato: body.data.candidato.endereco.contato
                                },
                                formacao: formacao,
                                orgao: body.data.candidato.orgao.nome,
                                datanascimento: moment(body.data.candidato.datanascimento).format('DD/MM/YYYY').toString(),
                                nomesocial: body.data.candidato.nomesocial,
                                fone: body.data.candidato.fone,
                                celular: body.data.candidato.celular
                            },
                            page: rota,
                            informacoes: req.session.json
                        });
                    }
                });
            });
        }
    });

    app.post('/app/' + rota + '/:id/:codigo/delete/', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_MOODLE + "mdl-user-enrolments/" + req.body.idcurso + "/" + req.body.username,
                method: "DELETE",
                json: true,
                headers: {
                    "content-type": "application/json"
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não excluído. " + body.errors);
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
                            res.redirect('/app/turma/'+ req.params.id + '/' + rota + '/' + req.params.codigo);
                            return true;
                        }
                    });
                }
            });

        }
    });

}