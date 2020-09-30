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
            request({
                url: process.env.API_HOST + 'inscricao/turma/' + req.params.id,
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
                        categoria: body.data[i].turma.curso.categoria.nome,
                        modalidade: body.data[i].turma.curso.modalidade,
                        candidato: body.data[i].candidato.nome,
                        candidatoLotacao: body.data[i].candidato.lotacao,
                        candidatoCargo: body.data[i].candidato.cargo,
                        candidatoFuncao: body.data[i].candidato.funcao,
                        candidatoOrgao: body.data[i].candidato.orgao.nome,
                        deferido: body.data[i].deferido,
                        leituraTermo: body.data[i].leituraTermo,
                        cienciaTermo: body.data[i].cienciaTermo,
                        motivo: motivo,
                    };

                    lista.push(finallista);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', { codigoTurma: req.params.codigo, idTurma: req.params.id, itens: lista, page: rota, informacoes: req.session.json });
                    }
                });
                return lista;
            });
        }
    });

    app.get('/app/turma/:idTurma/' + rota + '/:codigo/zerar/:id', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "inscricao/zerar/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                if (response.statusCode == !200) {
                    req.flash("danger", "Não foi possível restaurar as informações.");
                } else {
                    req.flash("success", "Informações restauradas.");
                }

                res.redirect('/app/turma/'+ req.params.idTurma+'/' + rota + '/' + req.params.codigo);
            });
        }
    });

    app.get('/app/turma/:idTurma/' + rota + '/:codigo/reenviar/:id', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "inscricao/reenviar/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                if (response.statusCode == !200) {
                    req.flash("danger", "Não foi possível reenviar o email.");
                } else {
                    req.flash("success", "Email reenviado.");
                }
                res.redirect('/app/turma/'+ req.params.idTurma+'/' + rota + '/' + req.params.codigo);
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

    app.post('/app/' + rota + '/d/:id/:deferido', function (req, res) {
        var deferido = req.params.deferido;
        request({
            url: process.env.API_HOST + 'inscricao',
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.params.id,
                "deferido": deferido,
            },
        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Item não salvo. " + body.errors);
            } else {
                req.flash("success", "Item salvo com sucesso.");
            }
            //res.redirect('/app/' + rota + '/list');
            res.json(true);
            return true;
        });
    });

    app.post('/app/' + rota + '/ead/d/:id/:deferido/:idcurso/:username', function (req, res) {
        var deferido = req.params.deferido;
        if (deferido.toString() == 'false') {
            request({
                url: process.env.API_MOODLE + "mdl-user-enrolments/" + req.params.idcurso + "/" + req.params.username,
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
                        url: process.env.API_HOST + 'inscricao',
                        method: "PUT",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                        json: {
                            "id": req.params.id,
                            "deferido": deferido,
                        },
                    }, function (error, response, body) {
                        if (response.statusCode != 200) {
                            req.flash("danger", "Item não salvo. " + body.errors);
                        } else {
                            req.flash("success", "Item salvo com sucesso.");
                        }
                        //res.redirect('/app/' + rota + '/list');
                        res.json(true);
                        return true;
                    });
                }
            });
        } else {
            request({
                url: process.env.API_HOST + 'inscricao',
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "id": req.params.id,
                    "deferido": deferido,
                },
            }, function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Item não salvo. " + body.errors);
                } else {
                    req.flash("success", "Item salvo com sucesso.");
                }
                //res.redirect('/app/' + rota + '/list');
                res.json(true);
                return true;
            });
        }
        
        
    });

    app.post('/app/' + rota + '/v/:id', function (req, res) {

        request({
            url: process.env.API_HOST + 'inscricao',
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.params.id,
                "leituraTermo": true,
            },
        }, function (error, response, body) {
            res.json(true);
            return true;
        });
    });

    app.post('/app/' + rota + '/ct/:id', function (req, res) {
        var cienciaTermo = req.params.cienciaTermo;
        request({
            url: process.env.API_HOST + 'inscricao',
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.params.id,
                "cienciaTermo": true,
            },
        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Item não salvo. " + body.errors);
            } else {
                req.flash("success", "Item salvo com sucesso.");
            }
            //res.redirect('/app/' + rota + '/list');
            res.json(true);
            return true;
        });
    });

    // Rota para exibição da View Editar
    app.get('/app/turma/:idTurma/' + rota + '/new/create', function (req, res) {
        categorias = [];
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "turma/" + req.params.idTurma,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                var dataInicio = moment(body.data.dataInicio).format("DD-MM-YYYY");
                var dataFim = moment(body.data.dataFim).format("DD-MM-YYYY");

                const turmaInfo = {
                    id: body.data.id,
                    codigo: body.data.codigo,
                    curso: body.data.curso.nome,
                    idCurso: body.data.curso.id,
                    categoria: body.data.curso.categoria.nome,
                    modalidade: body.data.curso.modalidade,
                    cargaHoraria: body.data.curso.cargaHoraria,
                    dataInicio: dataInicio,
                    dataFim: dataFim,
                    horaInicio: body.data.horaInicio,
                    horaFim: body.data.horaFim,
                    inscricoes: body.data.inscricoes,
                    page: rota,
                    informacoes: req.session.json
                };

                request({
                    url: process.env.API_HOST + "candidato",
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {
                    candidatosInscritos = [];
                    for (var i = 0; i < turmaInfo.inscricoes.length; i++) {
                        candidatosInscritos.push(turmaInfo.inscricoes[i].candidato.id)
                    }

                    lista = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        if (!candidatosInscritos.includes(body.data[i].id)) {
                            const finallista = {
                                id: body.data[i].id,
                                nome: body.data[i].nome,
                            };
                            lista.push(finallista);
                        }

                    }


                    res.format({
                        html: function () {
                            res.render(rota + '/Create', {
                                id: turmaInfo.id,
                                codigo: turmaInfo.codigo,
                                curso: turmaInfo.curso,
                                idCurso: turmaInfo.curso.id,
                                categoria: turmaInfo.categoria.nome,
                                modalidade: turmaInfo.modalidade,
                                cargaHoraria: turmaInfo.cargaHoraria,
                                dataInicio: dataInicio,
                                dataFim: dataFim,
                                horaInicio: turmaInfo.horaInicio,
                                horaFim: turmaInfo.horaFim,
                                page: rota,
                                informacoes: req.session.json,
                                candidatos: lista
                            });
                        }
                    });
                });

            });
        }
    });

    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {
        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        }

        json = req.body;

        request({
            url: process.env.API_HOST + 'inscricao',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "candidato": {
                    "id": req.body.candidato
                },
                "chave": req.session.token,
                "dataInscricao": moment().toDate(),
                "motivoInscricao": req.body.motivo,
                "turma": {
                    "id": req.body.idturma
                }
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não atualizado. " + body.errors);
                res.redirect('/app/turma/' + req.body.idturma + '/inscricoes/' + req.body.turma);
            } else {
                req.flash("success", "Pré inscrição realizada com sucesso. Aguarde o email.");
                res.redirect('/app/turma/' + req.body.idturma + '/inscricoes/' + req.body.turma);
            }

            return true;
        });
    });

    app.post('/app/' + rota + '/:id/:codigo/delete/', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
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

                res.redirect('/app/turma/' + req.params.id + '/' + rota + '/' + req.params.codigo);
                return true;
            });

        }
    });

}