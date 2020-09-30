require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
let colecaoFotos = [];
let galeria;

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
                        sigla: body.data[i].sigla,
                        status: body.data[i].status
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
                url: process.env.API_HOST + "estado",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                estados = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome
                    };
                    estados.push(finalarea);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/Create', { itensEstados: estados, page: rota, informacoes: req.session.json });
                    }
                });
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {

        console.log(req.body)
        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        } else {
            foto = process.env.PROFILE_IMG
        }

        /*       const files = req.files['photos'];
               fotos = [];
               if (files) {
                   for (var i = 0; i < Object.keys(files).length; i++) {
                       const buf = Buffer.from(files[i].buffer);
                       let foto = { "imagem" : buf.toString('base64') } ;
                       fotos.push(foto);
                   }
               } else {
                   fotos.push(process.env.PROFILE_IMG);
               }
       */
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
                "sigla": req.body.sigla,
                "articulador": req.body.articulador,
                "emailArticulador": req.body.emailArticulador,
                "status": req.body.status,
                "endereco": {
                    "bairro": req.body.bairro,
                    "cep": req.body.cep,
                    "complemento": req.body.complemento,
                    "contato": req.body.contato,
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero,
                    "municipio": {
                        "id": req.body.municipio
                    }
                }
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
        estados = [];
        municipios = [];
        //var corpo;
        //var idestado;
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, corpo) {
                request({
                    url: process.env.API_HOST + "estado",
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome
                        };
                        estados.push(finalarea);
                    }
                });
                request({
                    url: process.env.API_HOST + "municipio/estado/" + corpo.data.endereco.municipio.estado.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome
                        };
                        municipios.push(finalarea);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/Edit', {
                                id: corpo.data.id,
                                nome: corpo.data.nome,
                                sigla: corpo.data.sigla,
                                articulador: corpo.data.articulador,
                                emailArticulador: corpo.data.emailArticulador,
                                status: corpo.data.status,
                                logradouro: corpo.data.endereco.logradouro,
                                numero: corpo.data.endereco.numero,
                                complemento: corpo.data.endereco.complemento,
                                bairro: corpo.data.endereco.bairro,
                                cep: corpo.data.endereco.cep,
                                contato: corpo.data.endereco.contato,
                                municipioId: corpo.data.endereco.municipio.id,
                                itensMunicipios: municipios,
                                itensEstados: estados,
                                estadosId: corpo.data.endereco.municipio.estado.id,
                                page: rota,
                                informacoes: req.session.json
                            });
                        }
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
        } /*else {
            foto = process.env.PROFILE_IMG
        }*/

        /*     const files = req.files['photos'];
             if (files) {
                 for (var i = 0; i < Object.keys(files).length; i++) {
                     const buf = Buffer.from(files[i].buffer);
                     let foto = { "imagem" : buf.toString('base64') } ;
                     colecaoFotos.push(foto);
                 }
             }
        */
       
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
                "sigla": req.body.sigla,
                "articulador": req.body.articulador,
                "emailArticulador": req.body.emailArticulador,
                "status": req.body.status,
                "endereco": {
                    "bairro": req.body.bairro,
                    "cep": req.body.cep,
                    "complemento": req.body.complemento,
                    "contato": req.body.contato,
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero,
                    "municipio": {
                        "id": req.body.municipio
                    }
                }
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

