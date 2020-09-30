require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
var moment = require('moment');
let colecaoDocumentos = [];
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
                url: process.env.API_HOST + 'professor',
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                if (body.data != null) {
                    for (var i = 0; i < body.data.length; i++) {
                        const professor = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            formacoes: body.data[i].formacao,
                            statusDeferimento: body.data[i].statusDeferimento,
                            pontuacao: body.data[i].pontuacao,
                            servidor: body.data[i].candidato.servidor,
                        };
                        lista.push(professor);
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

                areasInteresse = []
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const area = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                    };
                    areasInteresse.push(area);
                }

                formacoes = []
                let itemFormacao = {
                    formacao: '',
                    curso: '',
                    ano: ''
                }
                experiencias = []
                let itemExperiencia = {
                    curso: '',
                    dataInicio: '',
                    dataFim: '',
                    cargaHoraria: '',
                }
                formacoes.push(itemFormacao)
                experiencias.push(itemExperiencia)
                request({
                    url: process.env.API_HOST + "estado",
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                    },
                }, async function (error, response, body) {
                    estados = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            sigla: body.data[i].sigla
                        };
                        estados.push(finalarea);
                    }
                    request({
                        url: process.env.API_HOST + "orgao/ativos",
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                    }, async function (error, response, body) {
                        orgaos = [];
                        for (var i = 0; i < Object.keys(body.data).length; i++) {
                            const finalarea = {
                                id: body.data[i].id,
                                nome: body.data[i].nome,
                                sigla: body.data[i].sigla
                            };
                            orgaos.push(finalarea);
                        }
                        res.format({
                            html: function () {
                                res.render(rota + '/Create', { itensOrgaos: orgaos, itensEstados: estados, page: rota, informacoes: req.session.json, formacoes: formacoes, experiencias: experiencias, areasInteresse: areasInteresse });
                            }
                        });
                    })
                })

            })
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.array('documento'), function (req, res) {
        const files = req.files;
        if (files) {
            for (var i = 0; i < Object.keys(files).length; i++) {
                const buf = Buffer.from(files[i].buffer);
                let documento = {
                    "nome": files[i].originalname,
                    "documento": buf.toString('base64')
                };
                colecaoDocumentos.push(documento);
            }
        }
        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        } else {
            foto = process.env.PROFILE_IMG
        }
        var cadastrodata = moment.now();
        var datanasc = moment(req.body.datanascimento).toDate();
        var cpf = req.body.cpf;
        cpf = cpf.replace('.', '');
        cpf = cpf.replace('.', '');
        cpf = cpf.replace('-', '');

        request({
            url: process.env.API_SEGEP + 'egma-servidores?cpf=' + cpf,
            method: "GET",
            json: true,
            headers: {
                "accept": "application/json",
                "Authorization": "Bearer RfIKxynXUGi2lvK3OqbB"
            },
        }, function (error, response, body) {
            formacoes = [];
            experiencias = [];
            // interesses = [];
            if (Array.isArray(req.body.experienciaInstituicao)) {
                for (var i = 0; i < req.body.experienciaInstituicao.length; i++) {
                    const experiencia = {
                        "dataInicio": moment(req.body.experienciaInicio[i]).toDate(),
                        "dataFim": moment(req.body.experienciaFim[i]).toDate(),
                        "curso": req.body.experienciaCurso[i],
                        "cargaHoraria": req.body.experienciaCargaHoraria[i],
                        "instituicao": req.body.experienciaInstituicao[i]
                    }
                    experiencias.push(experiencia);
                }
            } else {
                const experiencia = {
                    "dataInicio": moment(req.body.experienciaInicio).toDate(),
                    "dataFim": moment(req.body.experienciaFim).toDate(),
                    "curso": req.body.experienciaCurso,
                    "cargaHoraria": req.body.experienciaCargaHoraria,
                    "instituicao": req.body.experienciaInstituicao
                }
                experiencias.push(experiencia);
            }

            cursos = [];
            cursos1 = [];

            if (req.body.curso != null) {
                if (Array.isArray(req.body.curso)) {
                    for (var i = 0; i < req.body.curso.length; i++) {
                        const curso = {
                            "id": req.body.curso[i]
                        };
                        cursos.push(curso);
                    }
                } else {
                    const curso = {
                        "id": req.body.curso
                    };
                    cursos.push(curso);
                }

            }

            if (req.body.curso1 != null) {
                if (req.body.categoria1 != null) {
                    if (Array.isArray(req.body.curso1)) {
                        for (var j = 0; j < req.body.curso1.length; j++) {
                            const curso1 = {
                                "id": req.body.curso1[j]
                            };
                            cursos1.push(curso1);
                        }
                    } else {
                        const curso1 = {
                            "id": req.body.curso1
                        };
                        cursos1.push(curso1);
                    }

                }
            }

            if (Array.isArray(req.body.tpFormacao)) {

                for (var i = 0; i < req.body.tpFormacao.length; i++) {
                    const formacao = {
                        "tpFormacao": req.body.tpFormacao[i],
                        "ano": req.body.ano[i],
                        "curso": req.body.cursoFormacao[i],
                        "instituicao": req.body.instituicao[i]
                    }
                    formacoes.push(formacao);
                }
            } else {
                const formacao = {
                    "tpFormacao": req.body.tpFormacao,
                    "ano": req.body.ano,
                    "curso": req.body.cursoFormacao,
                    "instituicao": req.body.instituicao
                }
                formacoes.push(formacao);
            }
            if (response.statusCode == 200) {
                request({
                    url: process.env.API_HOST + 'professor/admin/create',
                    method: "POST",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                    json: {
                        "nome": req.body.nome,
                        "rg": req.body.rg,
                        "email": req.body.email,
                        "cpf": cpf,
                        "sexo": req.body.sexo,
                        "datanascimento": datanasc,
                        "estadoCivil": req.body.estadocivil,
                        "fone": req.body.fone,
                        "cel": req.body.celular,
                        "pis": req.body.pis,
                        "pasep": req.body.pasep,
                        "inss": req.body.inss,
                        "statusDeferimento": "AGUARDANDO",
                        "formacao": formacoes,
                        "experiencia": experiencias,
                        "interesse": [
                            req.body.categoria != '' ? {
                                "categoria": { "id": req.body.categoria },
                                "curso": cursos
                            } : {},
                            req.body.categoria1 != '' ? {
                                "categoria": { "id": req.body.categoria1 },
                                "curso": cursos1
                            } : {}
                        ],
                        "documento": colecaoDocumentos,
                        "candidato": {
                            "nome": req.body.nome,
                            "lotacao": req.body.lotacao,
                            "cargo": req.body.cargo,
                            "funcao": req.body.funcao,
                            "area": req.body.area,
                            "matricula": req.body.matricula,
                            "rg": req.body.rg,
                            "cpf": cpf,
                            "sexo": req.body.sexo,
                            "datacadastro": cadastrodata,
                            "endereco": {
                                "logradouro": req.body.logradouro,
                                "numero": req.body.numero,
                                "complemento": req.body.complemento,
                                "bairro": req.body.bairro,
                                "cep": req.body.cep,
                                "contato": req.body.celular,
                                "municipio": {
                                    "id": req.body.municipio
                                }
                            },
                            "tpformacao": req.body.formacao,
                            "orgao": {
                                "id": req.body.orgao
                            },
                            /*
                            "setor": {
                                "id": req.body.setor
                            },
                            */
                            "setor": req.body.setor,
                            "chefe": req.body.chefe,
                            "emailchefe": req.body.emailchefe,
                            "datanascimento": datanasc,
                            "nomesocial": req.body.nomesocial,
                            "fone": req.body.fone,
                            "celular": req.body.celular,
                            "status": true,
                            "servidor": body.length == 0 ? false : true,
                            "usuario": {
                                "nome": req.body.nome,
                                "username": cpf,
                                "password": cpf,
                                "imgCapa": foto,
                                "niveis": ["EXTERNO"],
                                "email": req.body.email,
                                "telefone": req.body.fone
                            }
                        }

                    }
                }, function (error, response, body) {
                    if (response.statusCode != 200) {
                        req.flash("danger", "Item não salvo. " + body.errors);
                    } else {
                        req.flash("success", "Item salvo com sucesso.");
                    }
                    res.redirect('/app/' + rota + '/list');
                    return true;
                });
            } else {
                req.flash("danger", "Item não salvo. " + body.errors);
                res.redirect('/app/' + rota + '/list');
            }
        });
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        estados = [];
        municipios = [];
        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + 'professor' + "/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, corpo) {
                var experiencias = [];
                var interesses = [];
                var documentos = [];
                for (var j = 0; j < Object.keys(corpo.data.experiencia).length; j++) {
                    const experiencia = {
                        id: corpo.data.experiencia[j].id,
                        professor: corpo.data.experiencia[j].professor,
                        dataInicio: moment(corpo.data.experiencia[j].dataInicio).format("YYYY-MM-DD"),
                        dataFim: moment(corpo.data.experiencia[j].dataFim).format("YYYY-MM-DD"),
                        curso: corpo.data.experiencia[j].curso,
                        instituicao: corpo.data.experiencia[j].instituicao,
                        cargaHoraria: corpo.data.experiencia[j].cargaHoraria
                    }
                    experiencias.push(experiencia)
                }

                for (var k = 0; k < Object.keys(corpo.data.interesse).length; k++) {
                    const interesse = {
                        categoria: { "id": corpo.data.interesse[k].categoria != null ? corpo.data.interesse[k].categoria.id : 0 },
                        curso: corpo.data.interesse[k].curso,
                    };
                    interesses.push(interesse);
                }

                for (let l = 0; l < corpo.data.documento.length; l++) {
                    const documento = {
                        id: corpo.data.documento[l].id,
                        nome: corpo.data.documento[l].nome,
                        documento: corpo.data.documento[l].documento
                    }
                    documentos.push(documento);
                }
                request({
                    url: process.env.API_HOST + "categoria",
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, async function (error, response, body) {

                    areasInteresse = []
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const area = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                        };
                        areasInteresse.push(area);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/Edit', {
                                nome: corpo.data.nome,
                                id: corpo.data.id,
                                pis: corpo.data.pis,
                                pasep: corpo.data.pasep,
                                articulador: corpo.data.articulador,
                                inss: corpo.data.inss,
                                estadocivil: corpo.data.estadoCivil,
                                page: rota,
                                informacoes: req.session.json,
                                formacoes: corpo.data.formacao,
                                interesses: interesses,
                                statusDeferimento: corpo.data.statusDeferimento,
                                pontuacao: corpo.data.pontuacao,
                                experiencias: experiencias,
                                documentos: documentos,
                                areasInteresse: areasInteresse
                            });
                        }
                    });


                });
            })
        }
    })



    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {
        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        }
        request({
            url: process.env.API_HOST + 'professor/deferimento',
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.body.id,
                "statusDeferimento": req.body.statusDeferimento,
                "pontuacao": req.body.pontuacao,

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

