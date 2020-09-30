require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
var moment = require('moment');
const fs = require('fs');
const PDFDocument = require('pdfkit');
var doc;

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
                let lista = [];
                request({
                    url: process.env.API_HOST + rota + '/curso/' + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, async function (error, response, body) {

                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        var finallista = {
                            id: body.data[i].id,
                            codigo: body.data[i].codigo,
                            curso: body.data[i].curso.nome,
                            categoria: body.data[i].curso.categoria.nome,
                            dataInicio: moment(body.data[i].dataInicio).format("DD/MM/YYYY"),
                            dataFim: moment(body.data[i].dataFim).format("DD/MM/YYYY"),
                            horaInicio: body.data[i].horaInicio,
                            horaFim: body.data[i].horaFim,
                            vagas: body.data[i].vagas,
                            inscritos: 0,
                            deferidos: 0,
                            indeferidos: 0,
                            confirmados: 0,
                        };
                        for (var j = 0; j < body.data[i].inscricoes.length; j++) {
                            const inscricao = body.data[i].inscricoes[j]
                            finallista.inscritos++;
                            if (inscricao.deferido == true) {
                                finallista.deferidos++;
                            } else if (inscricao.deferido == false) {
                                finallista.indeferidos++;
                            }
                            if (inscricao.cienciaTermo == true) {
                                finallista.confirmados++;
                            }
                        }
                        if (body.data[i].curso.modalidade == 'PRESENCIAL') {
                            lista.push(finallista);
                        }
                    }

                    res.format({
                        html: function () {
                            res.render(rota + '/List', { curso: curso, itens: lista, page: rota, informacoes: req.session.json });
                        }
                    })
                });
            });
        }
    })

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
            "nome": req.body.nome,
            "situacao": req.body.situacao,
            "curso": { "id": req.body.curso },
            "professor": { "id": req.body.professor },
            "dataInicio": dataInicio,
            "dataFim": dataFim,
            "vagas": req.body.vagas,
            "horaInicio": req.body.horaInicio,
            "horaFim": req.body.horaFim,
            "local": req.body.local,
            "turno": req.body.turno,
            "restricao": req.body.restricao,
            "obs": req.body.obs,
            "publicar": req.body.publicar,
            "fechar": req.body.fechar
        };
        jsonWithoutProfessor = {
            "nome": req.body.nome,
            "situacao": req.body.situacao,
            "curso": { "id": req.body.curso },
            "dataInicio": dataInicio,
            "dataFim": dataFim,
            "vagas": req.body.vagas,
            "horaInicio": req.body.horaInicio,
            "horaFim": req.body.horaFim,
            "local": req.body.local,
            "turno": req.body.turno,
            "restricao": req.body.restricao,
            "obs": req.body.obs,
            "publicar": req.body.publicar,
            "fechar": req.body.fechar
        };
        request({
            url: process.env.API_HOST + rota,
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
                        disciplina: body.data.disciplina
                    };
                    request({
                        url: process.env.API_HOST + rota + "/" + req.params.id,
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                    }, function (error, response, body) {
                        var dataI = moment(body.data.dataInicio).format("YYYY-MM-DD");
                        var dataF = moment(body.data.dataFim).format("YYYY-MM-DD");
                        var horaI = moment(body.data.horaInicio, "HH:mm:ss").format("HH:mm");
                        var horaF = moment(body.data.horaFim, "HH:mm:ss").format("HH:mm");
                        res.format({
                            html: function () {
                                res.render(rota + '/Edit', {
                                    id: body.data.id,
                                    codigo: body.data.codigo,
                                    vagas: body.data.vagas,
                                    dataInicio: dataI,
                                    dataFim: dataF,
                                    horaInicio: horaI,
                                    horaFim: horaF,
                                    local: body.data.local,
                                    turno: body.data.turno,
                                    restricao: body.data.restricao,
                                    obs: body.data.obs,
                                    publicar: body.data.publicar,
                                    fechar: body.data.fechar,
                                    situacao: body.data.situacao,
                                    curso: curso,
                                    itensCursos: cursos,
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
        var dataI = moment(req.body.dataInicio).toDate();
        var dataF = moment(req.body.dataFim).toDate();
        jsonWithProfessor = {
            "id": req.body.id,
            "codigo": req.body.codigo,
            "vagas": req.body.vagas,
            "dataInicio": dataI,
            "dataFim": dataF,
            "horaInicio": req.body.horaInicio,
            "horaFim": req.body.horaFim,
            "local": req.body.local,
            "turno": req.body.turno,
            "restricao": req.body.restricao,
            "obs": req.body.obs,
            "publicar": req.body.publicar,
            "fechar": req.body.fechar,
            "situacao": req.body.situacao,
            "curso": {
                "id": req.body.curso
            },
            "professor": { "id": req.body.professor }
        };
        jsonWithoutProfessor = {
            "id": req.body.id,
            "codigo": req.body.codigo,
            "vagas": req.body.vagas,
            "dataInicio": dataI,
            "dataFim": dataF,
            "horaInicio": req.body.horaInicio,
            "horaFim": req.body.horaFim,
            "local": req.body.local,
            "turno": req.body.turno,
            "restricao": req.body.restricao,
            "obs": req.body.obs,
            "publicar": req.body.publicar,
            "fechar": req.body.fechar,
            "situacao": req.body.situacao,
            "curso": {
                "id": req.body.curso
            }
        };
        request({
            url: process.env.API_HOST + rota,
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

                res.redirect('/app/curso/' + req.params.id + '/' + rota + '/list');
                return true;
            });

        }
    });

    app.get('/app/:id/' + rota + '/file.pdf', function (req, res) {
        request({
            url: process.env.API_HOST + rota + '/' + req.params.id,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, function (error, response, body) {
            doc = new PDFDocument(
                {
                    size: 'A4',
                    layout: 'landscape',
                    bufferPages: 'true'
                }
            );
            getPdf(body.data, res);
        });
    });

    function getPdf(turmaDados, res) {

        const inscricoes = turmaDados.inscricoes;
        var page = 1;

        doc.on('pageAdded', () => {
            page++;
            addHeader(turmaDados)
            addFooter(page);

        });

        addHeader(turmaDados);
        addFooter(page)
        const start = 120;

        var j = 0;
        for (let i = 0; i < inscricoes.length; i++) {
            if (j >= 20) {
                doc.addPage();
                j = 0;
            }

            doc.font('Helvetica').fontSize(8).text(inscricoes[i].candidato.matricula, 15, start + j * 20, { lineBreak: false })
            doc.font('Helvetica').fontSize(8).text(inscricoes[i].candidato.nome, 95, start + j * 20, { lineBreak: false })
            doc.font('Helvetica').fontSize(8).text(inscricoes[i].candidato.orgao.sigla, 290, start + j * 20, { lineBreak: false })
            doc.font('Helvetica').fontSize(8).text(inscricoes[i].candidato.rg, 370, start + j * 20, { lineBreak: false })
            doc.font('Helvetica').fontSize(8).text(inscricoes[i].candidato.cpf, 450, start + j * 20, { lineBreak: false })
            doc.font('Helvetica').fontSize(8).text(inscricoes[i].candidato.usuario.email, 530, start + j * 20, { lineBreak: false })
            doc.font('Helvetica').fontSize(8).text("________________________________", 675, start + j * 20, { lineBreak: false })
            j++;
        }

        doc.pipe(res);
        doc.end();
    }

    function addHeader(turmaDados) {
        doc.pipe(fs.createWriteStream('file.pdf'));
        doc.info['Title'] = "Lista de Frequência";
        doc.image('public/img/marcaegma.png', 10, 22, {
            fit: [160, 160],
            align: 'left',
        });
        doc.font('Helvetica').fontSize(12);

        doc.rect(170, 22, 162.5, 25).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(8).text("Curso: ", 180, 27, { lineBreak: false })
            .font('Helvetica').fontSize(8).text(turmaDados.curso.nome, 180, 37, { lineBreak: false })
        doc.rect(332.5, 22, 162.5, 25).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(8).text("Carga Horária: ", 342.5, 27, { lineBreak: false })
            .font('Helvetica').fontSize(8).text(turmaDados.curso.cargaHoraria + " H", 342.5, 37, { lineBreak: false })
        doc.rect(495, 22, 162.5, 25).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(8).text("Vagas: ", 505, 27, { lineBreak: false })
            .font('Helvetica').fontSize(8).text(turmaDados.vagas, 505, 37, { lineBreak: false })
        doc.rect(657.5, 22, 162.5, 25).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(8).text("Código da Turma: ", 667.5, 27, { lineBreak: false })
            .font('Helvetica').fontSize(8).text(turmaDados.codigo, 667.5, 37, { lineBreak: false })
        doc.rect(170, 47, 162.5, 25).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(8).text("Categoria: ", 180, 52, { lineBreak: false })
            .font('Helvetica').fontSize(8).text(turmaDados.curso.categoria.nome, 180, 62, { lineBreak: false })
        doc.rect(332.5, 47, 162.5, 25).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(8).text("Período: ", 342.5, 52, { lineBreak: false })
            .font('Helvetica').fontSize(8).text(moment(turmaDados.dataInicio).format("DD/MM/YYYY") + " até " + moment(turmaDados.dataFim).format("DD/MM/YYYY"), 342.5, 62, { lineBreak: false })
        doc.rect(495, 47, 162.5, 25).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(8).text("Horário / Turno: ", 505, 52, { lineBreak: false })
            .font('Helvetica').fontSize(8).text(turmaDados.horaInicio + " até " + turmaDados.horaFim + " / " + turmaDados.turno, 505, 62, { lineBreak: false })
        doc.rect(657.5, 47, 162.5, 25).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(8).text("Inscritos: ", 667.5, 52, { lineBreak: false })
            .font('Helvetica').fontSize(8).text(turmaDados.inscricoes.length, 667.5, 62, { lineBreak: false })

        doc.rect(10, 90, 80, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Matrícula", 30, 96, { lineBreak: false });
        doc.rect(90, 90, 190, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Nome do Aluno", 150, 96, { lineBreak: false });
        doc.rect(280, 90, 80, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Órgão", 310, 96, { lineBreak: false });
        doc.rect(360, 90, 80, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("RG", 395, 96, { lineBreak: false });
        doc.rect(440, 90, 80, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("CPF", 465, 96, { lineBreak: false });
        doc.rect(520, 90, 150, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("E-mail", 580, 96, { lineBreak: false });
        doc.rect(670, 90, 150, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Assinatura", 730, 96, { lineBreak: false });
    }

    function addFooter(page) {
        doc.fontSize(7).text("São Luís (MA) " + moment().format('DD/MM/YYYY'), 10, doc.page.height - 50, { lineBreak: false });
        doc.text('pág.' + page, doc.page.width - 50, doc.page.height - 50, { lineBreak: false });
    }

}