require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
var candidatoId;
var candidatoNome;

module.exports = async function (app) {
    app.use(cookieParser());
    app.use(session({ secret: "2C44-4D44-WppQ38S" }));

    app.get('/app/login/', function (req, res) {
        if (req.session.token == null) {
            res.format({
                html: function () {
                    res.render('login');
                }
            });
        } else {
            res.format({
                html: function () {
                    res.redirect('/');
                }
            });
        }
    });

    app.post('/app/authentication/', function (req, res) {

        request({
            url: process.env.API_HOST_LOGIN,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json"
            },
            json: {
                "password": req.body.password,
                "username": req.body.email,
            },
        }, function (error, response, body) {
            if (response.statusCode != 201) {
                req.flash("danger", body.errors);
                res.redirect('/');
                return false;
            } else {
                req.session.token = body.accessToken;
                usuario = body.usuario;
                if (body.usuario.niveis[0] == "EXTERNO") {
                    if (body.usuario.primeiroAcesso != true) {
                        request({
                            url: process.env.API_SEGEP + 'egma-servidores?cpf=' + req.body.email,
                            method: "GET",
                            json: true,
                            headers: {
                                "accept": "application/json",
                                "Authorization": "Bearer RfIKxynXUGi2lvK3OqbB"
                            }
                        }, function (error, response, corpo) {
                            if (response.statusCode == 200) {
                                request({
                                    url: process.env.API_HOST + 'candidato/usuario/' + body.usuario.id,
                                    method: "GET",
                                    json: true,
                                    headers: {
                                        "content-type": "application/json",
                                        "Authorization": req.session.token
                                    },
                                }, function (error, response, body) {
                                    request({
                                        url: process.env.API_HOST + 'candidato/primeiro-acesso',
                                        method: "PUT",
                                        json: true,
                                        headers: {
                                            "content-type": "application/json",
                                            "Authorization": req.session.token
                                        },
                                        json: {
                                            "id": body.data.id,
                                            "cpf": body.data.cpf,
                                            "servidor": corpo.length == 0 ? false : true,
                                        }
                                    }, function (error, response, corpo) {
                                        candidatoId = body.data.id;
                                        candidatoNome = body.data.nome;
                                        req.session.json = {
                                            id: usuario.id,
                                            nome: body.data.nome,
                                            imgCapa: usuario.imgCapa,
                                            nivel: usuario.niveis[0],
                                            idCandidato: candidatoId,
                                            nomeCandidato: candidatoNome,
                                            email: usuario.email,
                                            username: body.data.cpf,
                                            cidade: body.data.endereco != null ? body.data.endereco.municipio.nome : '',
                                            senha: body.data.usuario.password,
                                            servidor: body.data.servidor
                                        }
                                        req.flash("danger", "Atualize seus dados!");
                                        res.redirect('/');
                                    });
                                });
                            }
                        });
                    } else {
                            request({
                                url: process.env.API_HOST + 'candidato/usuario/' + body.usuario.id,
                                method: "GET",
                                json: true,
                                headers: {
                                    "content-type": "application/json",
                                    "Authorization": req.session.token
                                },
                            }, function (error, response, body) {
                                candidatoId = body.data.id;
                                candidatoNome = body.data.nome;
                                req.session.json = {
                                    id: usuario.id,
                                    nome: body.data.nome,
                                    imgCapa: usuario.imgCapa,
                                    nivel: usuario.niveis[0],
                                    idCandidato: candidatoId,
                                    nomeCandidato: candidatoNome,
                                    email: usuario.email,
                                    username: body.data.cpf,
                                    cidade: body.data.endereco!= null ? body.data.endereco.municipio.nome : '',
                                    senha: body.data.usuario.password,
                                    servidor: body.data.servidor
                                }
                                res.redirect('/');

                            });
                    }
                } else {
                    req.session.json = {
                        id: usuario.id,
                        nome: usuario.nome,
                        imgCapa: usuario.imgCapa,
                        nivel: usuario.niveis[0]
                    }
                    res.redirect('/');
                }

                return true;
            }
        });

    });

    app.post('/app/recuperarsenha', function (req, res) {
        var cpf = req.body.cpf;
        cpf = cpf.replace('.', '');
        cpf = cpf.replace('.', '');
        cpf = cpf.replace('-', '');
        request({
            url: process.env.API_HOST + "usuario/recuperarsenha/" + cpf,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Ocorreu um erro. " + body.errors);
            } else {
                req.flash("success", "Senha enviada para o email cadastrado. (" + body.data.email + ")");
            }

            res.redirect('/');
            return true;
        });
    });

    app.get('/app/sair', function (req, res) {
        req.session.destroy();
        res.redirect('/app/login');
    });

}
