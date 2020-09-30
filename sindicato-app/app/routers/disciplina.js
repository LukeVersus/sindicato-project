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
                curso = {
                    id: body.data.id,
                    nome: body.data.nome,
                    categoria: body.data.categoria.nome
                };
                request({
                    url: process.env.API_HOST + 'disciplina/curso/' + req.params.id,
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
                            curso: body.data[i].curso.nome,
                            codigo: body.data[i].codigo,
                            nome: body.data[i].nome,
                            professor: body.data[i].professor.nome
                        };
                        lista.push(finallista);
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
                url: process.env.API_HOST + "professor",
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
                        nome: body.data.nome
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
        request({
            url: process.env.API_HOST + 'disciplina',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "curso": { "id": req.body.curso },
                "professor": { "id": req.body.professor },
                "nome": req.body.nome,
            },
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
                        nome: body.data.nome
                    };
                    request({
                        url: process.env.API_HOST + 'disciplina' + "/" + req.params.id,
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                    }, function (error, response, body) {
    
                        res.format({
                            html: function () {
                                res.render(rota + '/Edit', {
                                    id: body.data.id,
                                    codigo: body.data.codigo,
                                    nome: body.data.nome,
                                    curso: curso,
                                    itensProfessores: professores,
                                    professorId: body.data.professor.id,
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
        request({
            url: process.env.API_HOST + 'disciplina',
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.body.id,
                "codigo": req.body.codigo,
                "nome": req.body.nome,
                "curso": {
                    "id": req.params.id
                },
                "professor": {
                    "id": req.body.professor
                }
            },
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
    app.post('/app/curso/:idCurso/' + rota + '/delete/', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + 'disciplina' + "/" + req.body.id,
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

                res.redirect('/app/curso/' + req.params.idCurso + '/' + rota + '/list');
                return true;
            });

        }
    });

}