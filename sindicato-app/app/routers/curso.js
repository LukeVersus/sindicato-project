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

        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + rota,
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
                        nome: body.data[i].nome,
                        descricao: body.data[i].descricao,
                        status: body.data[i].status,
                        disciplina: body.data[i].disciplina,
                        modalidade: body.data[i].modalidade
                    };
                    lista.push(finallista);
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

    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "categoria",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                categoriacurso = body.data;

                request({
                    url: process.env.API_MOODLE + "mdl-course",
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                      //  "Authorization": req.session.token
                    },
                }, function (error, response, body) {
                    courses = [];
                    for (let i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].fullname
                        };
                        courses.push(finalarea);                        
                    }
                    categorias = [];
                    for (var i = 0; i < Object.keys(categoriacurso).length; i++) {
                        const finalarea = {
                            id: categoriacurso[i].id,
                            nome: categoriacurso[i].nome,
                            status: categoriacurso[i].status,
                        };
                        categorias.push(finalarea);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/Create', {itensMoodle: courses, itensCategorias: categorias, page: rota, informacoes: req.session.json });
                        }
                    });
                });
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {

        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        } else {
            foto = process.env.PROFILE_IMG
        }

        request({
            url: process.env.API_HOST + rota,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "nome": req.body.nome,
                "status": req.body.status,
                "descricao": req.body.descricao,
                "categoria": { "id": req.body.categoria },
                "modalidade": req.body.modalidade,
                "dataCadastro": moment().toDate(),
                "objetivo": req.body.objetivo,
                "publico": req.body.publico,
                "ementa": req.body.ementa,
                "idcurso": req.body.course,
                "disciplina": req.body.disciplina,
                "audiencia": req.body.audiencia,
                "cargaHoraria": req.body.cargaHoraria,
                "precisaDeferimento": req.body.precisaDeferimento
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não salvo. " + body.errors);
            } else {
                req.flash("success", "Item salvo com sucesso.");
            }

            res.redirect('/app/' + rota + '/list');
            return true;
        });

    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        categorias = [];
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "categoria",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                categoriacurso = body.data;
                request({
                    url: process.env.API_HOST + rota + "/" + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {
                    var curso = body.data;
                    var dataCad = moment(body.data.dataCadastro).format("YYYY-MM-DD");
                    request({
                        url: process.env.API_MOODLE + "mdl-course",
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        //  "Authorization": req.session.token
                        },
                    }, function (error, response, body) {
                        courses = [];
                        for (let i = 0; i < Object.keys(body.data).length; i++) {
                            const finalarea = {
                                id: body.data[i].id,
                                nome: body.data[i].fullname
                            };
                            courses.push(finalarea);                        
                        }
                        categorias = [];
                        for (var i = 0; i < Object.keys(categoriacurso).length; i++) {
                            const finalarea = {
                                id: categoriacurso[i].id,
                                nome: categoriacurso[i].nome,
                                status: categoriacurso[i].status,
                            };
                            categorias.push(finalarea);
                        }
                        res.format({
                            html: function () {
                                res.render(rota + '/Edit', {
                                    itensMoodle: courses,
                                    id: curso.id,
                                    precisaDeferimento: curso.precisaDeferimento,
                                    nome: curso.nome,
                                    descricao: curso.descricao,
                                    status: curso.status,
                                    codigo: curso.codigo,
                                    dataCadastro: dataCad,
                                    objetivo: curso.objetivo,
                                    publico: curso.publico,
                                    ementa: curso.ementa,
                                    idcurso: curso.idcurso,
                                    disciplina: curso.disciplina,
                                    audiencia: curso.audiencia,
                                    cargaHoraria: curso.cargaHoraria,
                                    modalidade: curso.modalidade,
                                    categoriaId: curso.categoria.id,
                                    categoriaNome: curso.categoria.nome,
                                    itensCategorias: categorias,
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
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {

        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        }

        json = req.body;
        var cadastrodate = moment(req.body.dataCadastro).toDate();

        request({
            url: process.env.API_HOST + rota,
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.body.id,
                "nome": req.body.nome,
                "status": req.body.status,
                "descricao": req.body.descricao,
                "codigo": req.body.codigoCurso,
                "objetivo": req.body.objetivo,
                "ementa": req.body.ementa,
                "audiencia": req.body.audiencia,
                "cargaHoraria": req.body.cargaHoraria,
                "disciplina": req.body.disciplina,
                "publico": req.body.publico,
                "dataCadastro": req.body.dataCadastro,
                "idcurso": req.body.course,
                "categoria": {
                    "id": req.body.categoria
                },
                "modalidade": req.body.modalidade,
                "precisaDeferimento": req.body.precisaDeferimento
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não atualizado. " + body.errors);
            } else {
                req.flash("success", "Item atualizado com sucesso.");
            }

            res.redirect('/app/' + rota + '/list');
            return true;
        });

    });

    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.body.id,
                method: "DELETE",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível excluir o curso. Verifique se esse curso já possui turmas ou aguarde e tente novamente mais tarde.");
                } else {
                    req.flash("success", "Curso excluído com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });

        }
    });



}