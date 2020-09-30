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
    app.get('/app/curso/:id/' + rota + '/list', function (req, res) {

        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "curso/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                const curso = {
                    id: body.data.id,
                    nome: body.data.nome
                };
                request({
                    url: process.env.API_HOST + 'turma/curso/' + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {
                    lista = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finallista = {
                            id: body.data[i].id,
                            codigo: body.data[i].codigo,
                            curso: body.data[i].curso.nome,
                            categoria: body.data[i].curso.categoria.nome
                        };
                        if (body.data[i].curso.modalidade != 'PRESENCIAL') {
                            lista.push(finallista);
                        }
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/List', {curso: curso, itens: lista, page: rota, informacoes: req.session.json });
                        }
                    });
                    return lista;
                });
            });
        }
    });

    // Rota para exibição da View Criar
    app.get('/app/curso/:id/' + rota + '/create', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "professor/deferidos",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                professores = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                    };
                    professores.push(finalarea);
                }
                request({
                    url: process.env.API_HOST + "curso/" + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, async function (error, response, body) {
                    curso = {
                        id: body.data.id,
                        nome: body.data.nome,
                        modalidade: body.data.modalidade,
                        disciplina: body.data.disciplina
                    };
                    res.format({
                        html: function () {
                            res.render(rota + '/Create', { curso: curso, itensProfessores: professores, page: rota, informacoes: req.session.json });
                        }
                    });
                });
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/curso/:id/' + rota + '/create/submit', upload.single('photo'), function (req, res) {
        var dataInicio = moment(req.body.dataInicio).toDate();
        var dataFim = moment(req.body.dataFim).toDate();
        jsonWithProfessor = {
            "situacao": req.body.situacao,
            "curso": { "id": req.params.id },
            "professor": { "id": req.body.professor },
            "vagas": req.body.vagas,
            "restricao": req.body.restricao,
            "obs": req.body.obs,
            "publicar": req.body.publicar,
            "dataInicio": dataInicio,
            "dataFim": dataFim,
            "fechar": req.body.fechar
        };
        jsonWithoutProfessor = {
            "situacao": req.body.situacao,
            "curso": { "id": req.params.id },
            "vagas": req.body.vagas,
            "restricao": req.body.restricao,
            "obs": req.body.obs,
            "publicar": req.body.publicar,
            "dataInicio": dataInicio,
            "dataFim": dataFim,
            "fechar": req.body.fechar
        };
        request({
            url: process.env.API_HOST + 'turma',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: req.body.professor == null ? jsonWithoutProfessor : jsonWithProfessor,
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não salvo. " + body.errors);
            } else {
                req.flash("success", "Item salvo com sucesso.");
            }

            res.redirect('/app/curso/' + req.params.id + '/' + rota + '/list');
            return true;
        });

    });

    // Rota para exibição da View Editar
    app.get('/app/curso/:idCurso/' + rota + '/edit/:id', function (req, res) {
        cursos = [];
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + 'professor',
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                professores = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                    };
                    professores.push(finalarea);
                }
                request({
                    url: process.env.API_HOST + "curso/" + req.params.idCurso,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, async function (error, response, body) {
                    const curso = {
                        id: body.data.id,
                        nome: body.data.nome,
                        modalidade: body.data.modalidade,
                        disciplina: body.data.disciplina
                    };
                    request({
                        url: process.env.API_HOST + 'turma' + "/" + req.params.id,
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                    }, function (error, response, body) {
                        var dataI = moment(body.data.dataInicio).format("YYYY-MM-DD");
                        var dataF = moment(body.data.dataFim).format("YYYY-MM-DD");
                        res.format({
                            html: function () {
                                res.render(rota + '/Edit', {
                                    id: body.data.id,
                                    codigo: body.data.codigo,
                                    vagas: body.data.vagas,
                                    restricao: body.data.restricao,
                                    obs: body.data.obs,
                                    publicar: body.data.publicar,
                                    fechar: body.data.fechar,
                                    situacao: body.data.situacao,
                                    dataInicio: dataI,
                                    dataFim: dataF,
                                    curso: curso,
                                    itensProfessores: professores,
                                    professorId: body.data.professor != null ? body.data.professor.id : null,
                                    page: rota,
                                    informacoes: req.session.json
                                });
                            }
                        });
                    });
                });
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/curso/:id/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {
        jsonWithProfessor = {
            "id": req.body.id,
            "codigo": req.body.codigo,
            "vagas": req.body.vagas,
            "restricao": req.body.restricao,
            "obs": req.body.obs,
            "publicar": req.body.publicar,
            "fechar": req.body.fechar,
            "situacao": req.body.situacao,
            "curso": {
                "id": req.params.id
            },
            "professor": {"id": req.body.professor}
        };
        jsonWithoutProfessor = {
            "id": req.body.id,
            "codigo": req.body.codigo,
            "vagas": req.body.vagas,
            "restricao": req.body.restricao,
            "obs": req.body.obs,
            "publicar": req.body.publicar,
            "fechar": req.body.fechar,
            "situacao": req.body.situacao,
            "curso": {
                "id": req.params.id
            }
        };
        request({
            url: process.env.API_HOST + 'turma',
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: req.body.professor == null ? jsonWithoutProfessor : jsonWithProfessor,
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não atualizado. " + body.errors);
            } else {
                req.flash("success", "Item atualizado com sucesso.");
            }

            res.redirect('/app/curso/' + req.params.id + '/' + rota + '/list');
            return true;
        });

    });

    // Rota para exclusão de um item
    app.post('/app/curso/:id/' + rota + '/delete/', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + 'turma' + "/" + req.body.id,
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

                res.redirect('/app/curso/' + req.params.id + '/' + rota + '/list');
                return true;
            });

        }
    });

}