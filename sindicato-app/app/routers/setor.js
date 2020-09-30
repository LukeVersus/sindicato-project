require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];


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

    // Rota para exibição da View Listar (Lista de Órgãos)
    app.get('/app/' + rota + '/list/:id/:sigla', function (req, res) {

        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + rota + '/orgao/' + req.params.id,
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
                        chefe: body.data[i].chefe,
                        emailchefe: body.data[i].emailChefe,
                        orgaoId: body.data[i].orgao.id,
                        orgaoSigla: body.data[i].orgao.sigla
                        //sigla: body.data[i].instituicao.sigla,
                    };
                    lista.push(finallista);
                }

                res.format({
                    html: function () {
                        res.render(rota + '/List', { orgaoId: req.params.id, itens: lista, page: rota, informacoes: req.session.json, orgaoSigla: req.params.sigla });
                    }
                });
                return lista;
            });
        }
    });

    /*
    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            res.format({
                html: function () {
                    res.render(rota + '/Create', { page: rota });
                }
            });
        }
    });
    */


    // Rota para exibição da Lista de Órgãos (para compor o select)
    app.get('/app/' + rota + '/:id/create', function (req, res) {
        orgaos = [];
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "orgao/"+req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {

                const finalarea = {
                    id: body.data.id,
                    sigla: body.data.sigla,
                };
                orgaos = finalarea;

                res.format({
                    html: function () {
                        res.render(rota + '/Create', { orgaoId: req.params.id, itensOrgaos: orgaos, page: rota, informacoes: req.session.json });
                    }
                });
            });
        }
    });


    // Rota para receber parametros via post criar item SETOR
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
                "chefe": req.body.chefe,
                "emailChefe": req.body.emailChefe,
                "orgao": { "id": req.body.orgao }
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não salvo. " + body.errors);
            } else {
                req.flash("success", "Item salvo com sucesso.");
            }

            res.redirect('/app/' + rota + '/list/' + req.body.orgao+"/"+req.body.orgaoSigla);
            return true;
        });

    });


    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id/:sigla', function (req, res) {
        orgaos = [];
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            /*
            request({
                url: process.env.API_HOST + "orgaos",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                        sigla: body.data[i].sigla,
                    };
                    orgaos.push(finalarea);
                }
            });
                */
            request({
                url: process.env.API_HOST + rota + "/" + req.params.id,
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
                            nome: body.data.nome,
                            chefe: body.data.chefe,
                            emailChefe: body.data.emailChefe,
                            orgaoId: body.data.orgao.id,
                            orgaoSigla: req.params.sigla,
                            page: rota,
                            informacoes: req.session.json
                        });
                    }
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
                "chefe": req.body.chefe,
                "emailChefe": req.body.emailChefe,
                "orgao": {
                    "id": req.body.orgaoId
                }
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não atualizado. " + body.errors);
            } else {
                req.flash("success", "Item atualizado com sucesso.");
            }

            res.redirect('/app/' + rota + '/list/' + req.body.orgaoId + '/' + req.body.orgaoSigla);
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
                    req.flash("danger", "Item não excluído. " + body.errors);
                } else {
                    req.flash("success", "Item excluído com sucesso.");
                }

                res.redirect('/app/' + rota + '/list/' + req.body.orgaoId+'/'+req.body.orgaoSigla);
                return true;
            });

        }
        
    });

}