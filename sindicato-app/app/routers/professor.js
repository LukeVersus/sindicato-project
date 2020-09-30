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

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + rota + '/candidato/' + req.session.json.idCandidato,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                if (body.data != null) {
                    const professor = {
                        id: body.data.id,
                        nome: body.data.nome,
                        formacoes: body.data.formacao,
                        statusDeferimento: body.data.statusDeferimento,
                        pontuacao: body.data.pontuacao
                    };

                    lista.push(professor);
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
        if (!req.session.token) {
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
                res.format({
                    html: function () {
                        res.render(rota + '/Create', { page: rota, informacoes: req.session.json, formacoes: formacoes, experiencias: experiencias, areasInteresse: areasInteresse });
                    }
                });
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.array('documento'), function (req, res) {
        documentoscolection = [];
        const files = req.files;
        if (files) {
            for (var i = 0; i < Object.keys(files).length; i++) {
                const buf = Buffer.from(files[i].buffer);
                let documento = {
                    "nome": files[i].originalname,
                    "documento": buf.toString('base64')
                };
                documentoscolection.push(documento);
            }
        }

        request({
            url: process.env.API_HOST + "candidato/" + req.session.json.idCandidato,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, async function (error, response, body) {
            const candidato = {
                id: body.data.id,
                nome: body.data.nome,
                cpf: body.data.cpf,
                sexo: body.data.sexo,
                datanascimento: body.data.datanascimento,
                estadocivil: body.data.estadocivil,
                endereco: body.data.endereco,
                fone: body.data.fone,
                cel: body.data.cel,
            }
            formacoes = [];
            experiencias = [];
            //interesses = [];
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
                console.log(req.body.curso);

                if(Array.isArray(req.body.curso)) {
                    for (var i = 0; i < req.body.curso.length; i++) {
                        const curso = {
                            "id": req.body.curso[i]
                        };
                        cursos.push(curso);
                    }
                } else {
                    const curso = {
                        "id": req.body.curso
                    }
                    cursos.push(curso);
                }
            }

            if(req.body.curso1 != null) {
                if (req.body.categoria1 != null) {
                    if(Array.isArray(req.body.curso1)) {
                        for (var j = 0; j < req.body.curso1.length; j++) {
                            const curso1 = {
                                "id": req.body.curso1[j]
                            };
                            cursos1.push(curso1);
                        }
                    } else {
                        const curso1 = {
                            "id": req.body.curso1
                        }
                        cursos1.push(curso1);
                    }
                    
                }
            }

            if (Array.isArray(req.body.tpFormacao)) {

                for (var i = 0; i < req.body.tpFormacao.length; i++) {
                    const formacao = {
                        "tpFormacao": req.body.tpFormacao[i],
                        "ano": req.body.ano[i],
                        "curso": req.body.cursoInstituicao[i],
                        "instituicao": req.body.instituicao[i]
                    }
                    formacoes.push(formacao);
                }
            } else {
                const formacao = {
                    "tpFormacao": req.body.tpFormacao,
                    "ano": req.body.ano,
                    "curso": req.body.cursoInstituicao,
                    "instituicao": req.body.instituicao
                }
                formacoes.push(formacao);
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
                    "nome": candidato.nome,
                    "rg": candidato.rg,
                    "email": candidato.email,
                    "cpf": candidato.cpf,
                    "sexo": candidato.sexo,
                    "datanascimento": candidato.datanascimento,
                    "estadoCivil": req.body.estadocivil,
                    "fone": candidato.fone,
                    "cel": candidato.cel,
                    "pis": req.body.pis,
                    "pasep": req.body.pasep,
                    "inss": req.body.inss,
                    "statusDeferimento": "AGUARDANDO",
                    "formacao": formacoes,
                    "experiencia": experiencias,
                    "candidato": {
                        "id": candidato.id
                    },
                    "documento": documentoscolection,
                    "interesse": [
                        req.body.categoria != '' ?  {
                              "categoria": {"id": req.body.categoria},
                              "curso": cursos
                        } : {},
                        req.body.categoria1 != '' ?  {
                            "categoria": {"id": req.body.categoria1},
                            "curso": cursos1
                        } : {}
                    ],
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
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        categorias = [];
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            categorias = [];
            request({
                url: process.env.API_HOST + "categoria",
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
                    categorias.push(finalarea);
                }
                request({
                    url: process.env.API_HOST + rota + "/" + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, corpo) {
                    var documentos = [];

                    for (let l = 0; l < corpo.data.documento.length; l++) {
                        const documento = {
                            id: corpo.data.documento[l].id,
                            nome: corpo.data.documento[l].nome,
                            documento: corpo.data.documento[l].documento
                        }
                        documentos.push(documento);
                    }
                    var experiencias = [];
                    var interesses = [];
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
                            categoria: {"id": corpo.data.interesse[k].categoria != null ? corpo.data.interesse[k].categoria.id : 0},
                            curso: corpo.data.interesse[k].curso
                        };
                        interesses.push(interesse);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/Edit', {
                                id: corpo.data.id,
                                pis: corpo.data.pis,
                                pasep: corpo.data.pasep,
                                articulador: corpo.data.articulador,
                                inss: corpo.data.inss,
                                estadocivil: corpo.data.estadoCivil,
                                page: rota,
                                informacoes: req.session.json,
                                formacoes: corpo.data.formacao,
                                statusDeferimento: corpo.data.statusDeferimento,
                                pontuacao: corpo.data.pontuacao,
                                experiencias: experiencias,
                                interesses: interesses,
                                documentos: documentos,
                                categorias: categorias
                            });
                        }
                    });
                });
            });

        }
    })



    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.array('documento'), function (req, res) {
        documentoscolection = [];
        const files = req.files;
        if (files) {
            for (var i = 0; i < Object.keys(files).length; i++) {
                const buf = Buffer.from(files[i].buffer);
                let documento = {
                    "nome": files[i].originalname,
                    "documento": buf.toString('base64')
                };
                documentoscolection.push(documento);
            }
        }
        request({
            url: process.env.API_HOST + "candidato/" + req.session.json.idCandidato,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, async function (error, response, body) {
            const candidato = {
                id: body.data.id,
                nome: body.data.nome,
                cpf: body.data.cpf,
                sexo: body.data.sexo,
                datanascimento: body.data.datanascimento,
                estadocivil: body.data.estadocivil,
                endereco: body.data.endereco,
                fone: body.data.fone,
                cel: body.data.cel,
            }
            json = req.body
            formacoes = [];
            experiencias = [];
            interesses = [];
            if (Array.isArray(req.body.experienciaInstituicao)) {
                for (var i = 0; i < req.body.experienciaInstituicao.length; i++) {
                    const experiencia = {
                        "dataInicio": moment(req.body.dataInicio[i]).toDate(),
                        "dataFim": moment(req.body.dataFim[i]).toDate(),
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
            if (Array.isArray(req.body.tpFormacao)) {

                for (var i = 0; i < req.body.tpFormacao.length; i++) {
                    const formacao = {
                        "tpFormacao": req.body.tpFormacao[i],
                        "ano": req.body.ano[i],
                        "curso": req.body.cursoInstituicao[i],
                        "instituicao": req.body.instituicao[i]
                    }
                    formacoes.push(formacao);
                }
            } else {
                const formacao = {
                    "tpFormacao": req.body.tpFormacao,
                    "ano": req.body.ano,
                    "curso": req.body.cursoInstituicao,
                    "instituicao": req.body.instituicao
                }
                formacoes.push(formacao);
            }

            cursos = [];
            cursos1 = [];

            if (req.body.curso != undefined) {
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
            
            if(req.body.curso1 != undefined) {
                if (req.body.categoria1 != undefined) {
                    if(Array.isArray(req.body.curso1)) {
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

            request({
                url: process.env.API_HOST + rota + "/update",
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "id": req.body.id,
                    "nome": candidato.nome,
                    "rg": candidato.rg,
                    "email": candidato.email,
                    "cpf": candidato.cpf,
                    "sexo": candidato.sexo,
                    "datanascimento": candidato.datanascimento,
                    "estadoCivil": req.body.estadocivil,
                    "fone": candidato.fone,
                    "cel": candidato.cel,
                    "pis": req.body.pis,
                    "pasep": req.body.pasep,
                    "inss": req.body.inss,
                    "statusDeferimento": req.body.statusDeferimento,
                    "pontuacao": req.body.pontuacao,
                    "formacao": formacoes,
                    "experiencia": experiencias,
                    "candidato": {
                        "id": candidato.id
                    },
                    "interesse": [
                        req.body.categoria != undefined ?  {
                              "categoria": {"id": req.body.categoria},
                              "curso": cursos
                          } : {},
                          req.body.categoria1 != undefined ?  {
                              "categoria": {"id": req.body.categoria1},
                              "curso": cursos1
                          } : {}
                    ],
                    "documento": documentoscolection
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
        })
    });

    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token) {
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

    app.get('/app/' + rota + '/categoria/:id', function (req, res) {
        cursos = [];
        request({
            url: process.env.API_HOST + "curso/categoria/" + req.params.id,
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
                cursos.push(finalarea);
            }
            res.json(cursos);
        });
    });

}

