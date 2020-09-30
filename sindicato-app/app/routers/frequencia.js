require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
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
    app.get('/app/turma/:id/' + rota, function (req, res) {

        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + 'turma-frequencia/turma/' + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {

                    var quantidadePresentes = 0;
                    var quantidadeAusentes = 0
                    for (var j = 0; j < body.data[i].frequencia.length; j++) {
                        if (body.data[i].frequencia[j].status == true) {
                            quantidadePresentes++;
                        } else {
                            quantidadeAusentes++;
                        }
                    }
                    const finallista = {
                        id: body.data[i].id,
                        dataFrequencia: moment(body.data[i].dataFrequencia).format("DD/MM/YYYY"),
                        quantidadeAlunos: body.data[i].frequencia.length,
                        quantidadePresentes: quantidadePresentes,
                        quantidadeAusentes: quantidadeAusentes
                    };
                    lista.push(finallista);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', { codigoTurma: req.params.id, itens: lista, page: rota, informacoes: req.session.json });
                    }
                });
                return lista;
            });
        }
    });

    // Rota para exibição da View Criar
    app.get('/app/turma/:id/' + rota + '/create', function (req, res) {

        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + 'turma/' + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                const turma = {
                    id: body.data.id,
                    codigo: body.data.codigo,
                    cargaHoraria: body.data.cargaHoraria,
                    horaInicio: body.data.horaInicio,
                    horaFim: body.data.horaFim,
                    local: body.data.local,
                    turno: body.data.turno,
                    inscricoes: body.data.inscricoes

                };
                res.format({
                    html: function () {
                        res.render(rota + '/Create', { codigoTurma: req.params.id, inscricoes: body.data.inscricoes, turma, turma, page: rota, informacoes: req.session.json });
                    }
                });
            })
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/turma/:id/' + rota + '/create/submit', upload.single('photo'), function (req, res) {
        var finallista = []
        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        } else {
            foto = process.env.PROFILE_IMG
        }

        request({
            url: process.env.API_HOST + 'turma/' + req.body.turmaId,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            }
        }, function (error, response, body) {

            listaFrequencia = [];
            if (Array.isArray(req.body.status)) {
                for (var i = 0; i < req.body.length; i++) {
                    const frequencia = {
                        status: req.body.status[i],
                        candidato: {
                            id: req.body.alunoId[i]
                        }
                    }
                    listaFrequencia.push(frequencia)
                }
            } else {
                const frequencia = {
                    status: req.body.status,
                    candidato: {
                        id: req.body.alunoId
                    }
                }
                listaFrequencia.push(frequencia)
            }

            for (var i = 0; i < req.body.length; i++) {


            }
            finallista = JSON.parse(JSON.stringify(listaFrequencia))
            request({
                url: process.env.API_HOST + 'turma-frequencia',
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "turma": {
                        "id": req.body.turmaId,
                    },
                    "dataFrequencia": moment(req.body.dataFrequencia).toDate(),
                    "frequencia": listaFrequencia
                }
            }, function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Item não salvo. " + body.errors);
                } else {
                    req.flash("success", "Item salvo com sucesso.");
                }
                res.redirect('/app/turma/' + req.body.turmaId + '/' + rota);
                return true;
            });
        });

    });
    // Rota para exibição da View Editar
    app.get('/app/turma/:id/' + rota + '/edit/:idFrequencia', function (req, res) {

        if (!req.session.token || req.session.json.nivel != 'ADMIN') {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + 'turma-frequencia/' + req.params.idFrequencia,
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
                            dataFrequencia: moment(body.data.dataFrequencia).format("YYYY-MM-DD"),
                            cargaHoraria: body.data.turma.cargaHoraria,
                            horaInicio: body.data.turma.horaInicio,
                            horaFim: body.data.turma.horaFim,
                            local: body.data.turma.local,
                            turno: body.data.turma.turno,
                            inscricoes: body.data.turma.inscricoes,
                            codigoTurma: req.params.id,
                            turma: body.data.turma,
                            turmaId: body.data.turma.id,
                            frequencia: body.data.frequencia,
                            page: rota,
                            informacoes: req.session.json
                        });
                    }
                });
            })
        }

    });


    // Rota para receber parametros via post editar item
    app.post('/app/turma/:id/' + rota + '/:idFrequencia/edit/submit', upload.single('photo'), function (req, res) {

        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        }

        json = req.body;
        request({
            url: process.env.API_HOST + 'turma/' + req.body.turmaId,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            }
        }, function (error, response, body) {

            listaFrequencia = [];
            for (var i = 0; i < req.body.length; i++) {
                const frequencia = {
                    status: req.body.status[i],
                    candidato: {
                        id: req.body.alunoId[i]
                    }
                }
                listaFrequencia.push(frequencia)

            }
            finallista = JSON.parse(JSON.stringify(listaFrequencia))
            request({
                url: process.env.API_HOST + 'turma-frequencia',
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "id": req.body.idFrequencia,
                    "turma": {
                        "id": req.body.turmaId,
                    },
                    "dataFrequencia": moment(req.body.dataFrequencia).toDate(),
                    "frequencia": listaFrequencia
                }
            }, function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Item não salvo. " + body.errors);
                } else {
                    req.flash("success", "Item salvo com sucesso.");
                }
                res.redirect('/app/turma/' + req.body.turmaId + '/' + rota);
                return true;
            });
        });

    });

    app.post('/app/' + rota + '/delete/', function (req, res) {
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

                res.redirect('/app/' + rota + '/list');
                return true;
            });

        }
    });


    app.get('/app/turma/:id/' + rota + '/file.pdf', function (req, res) {
        request({
            url: process.env.API_HOST + 'turma-frequencia/turma/' + req.params.id,
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
            if (body.data.length > 0)
                getPdf(body.data, res);
        });
    });

    function getPdf(turmaFrequencia, res) {
        const turmaDados = turmaFrequencia[0].turma;
        var page = 1;

        doc.on('pageAdded', () => {
            page++;
            addHeader(turmaDados, turmaFrequencia);
            addFooter(page);

        });
        addHeader(turmaDados, turmaFrequencia);
        addQuantidadeAulas(turmaFrequencia)
        addFooter(page)

        doc.pipe(res);
        doc.end();
    }

    function addHeader(turmaDados, turmaFrequencia) {
        doc.pipe(fs.createWriteStream('file.pdf'));
        doc.info['Title'] = "Lista de Frequência";
        doc.image('public/img/marcaegma.png', 10, 22, {
            fit: [160, 160],
            align: 'left',
        });

        const width = 410;
        const initialX = 250;
        const numAulas = turmaFrequencia.length
        const size = width / numAulas;

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

        doc.rect(10, 90, 180, 60).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Nome do Aluno", 74, 116, { lineBreak: true });
        doc.rect(190, 90, 60, 60).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Órgão", 210, 116, { lineBreak: true });
        doc.rect(250, 90, 410, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Aulas", 430, 96, { lineBreak: false });
        doc.rect(250, 110, 410, 40).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("", 430, 116, { lineBreak: false });
        doc.rect(660, 90, 160, 20).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Aproveitamento", 712, 96, { lineBreak: false });
        doc.rect(660, 110, 40, 40).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Nº Aulas", 665, 126, { lineBreak: false });
        doc.rect(700, 110, 40, 40).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Nº Pres.", 705, 126, { lineBreak: false });
        doc.rect(740, 110, 40, 40).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("Nº Faltas", 745, 126, { lineBreak: false });
        doc.rect(780, 110, 40, 40).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("% Pres.", 785, 126, { lineBreak: false });

        for (var j = 0; j < numAulas; j++) {
            doc.rect(initialX + (size * j), 110, size, 40).fillAndStroke('#ddd', '#000')
                .fill('#000').stroke()
                .fontSize(8).text();
            doc.font('Helvetica').fontSize(8).text(moment(turmaFrequencia[j].dataFrequencia).format('DD'), ((initialX + (size * j) + (initialX + size * (j + 1))) / 2) - 4, 116, { lineBreak: false })
            doc.font('Helvetica').fontSize(8).text(moment(turmaFrequencia[j].dataFrequencia).format('MM'), ((initialX + (size * j) + (initialX + size * (j + 1))) / 2) - 4, 126, { lineBreak: false })
            doc.font('Helvetica').fontSize(8).text(moment(turmaFrequencia[j].dataFrequencia).format('YY'), ((initialX + (size * j) + (initialX + size * (j + 1))) / 2) - 4, 136, { lineBreak: false })

        }

    }

    function verificaPresenca(status) {
        return status == true ? 'V' : 'X';
    }

    function addQuantidadeAulas(turmaFrequencia) {
        const width = 410;
        const initialX = 250;
        const numAulas = turmaFrequencia.length
        const size = width / numAulas;
        var j = 0;
        frequencia = turmaFrequencia[turmaFrequencia.length - 1].frequencia;
        var datasFrequencia = [];
        for (var i = 0; i < turmaFrequencia.length; i++) {
            datasFrequencia.push(turmaFrequencia[i].frequencia)
        }
       
        for (var i = 0; i < turmaFrequencia[turmaFrequencia.length - 1].frequencia.length; i++) {

            if (j == 15) {
                doc.addPage();
                j = 0;
            }
            if (frequencia[i] != null) {
                candidatoAtual = frequencia[i].candidato;
                frequenciaCandidato = getFrequenciaCandidato(turmaFrequencia, candidatoAtual);

                doc.rect(10, 150 + (20 * j), 180, 20).fillAndStroke('#ddd', '#000')
                    .fill('#000').stroke()
                    .fontSize(8).text(candidatoAtual.nome, 12, 150 + (10 + 20 * j), { lineBreak: true });
                doc.rect(190, 150 + (20 * j), 60, 20).fillAndStroke('#ddd', '#000')
                    .fill('#000').stroke()
                    .fontSize(8).text(candidatoAtual.orgao.sigla, 194, 150 + (10 + 20 * j), { lineBreak: true });

                for (var k = 0; k < datasFrequencia.length; k++) {
                    doc.rect(initialX + (size * k), 150 + (20 * j), size, 20).fillAndStroke('#ddd', '#000')
                        .fill('#000').stroke();

                        if(frequenciaCandidato[k] != null) {
                          
                            doc.fontSize(8).text(verificaPresenca(frequenciaCandidato[k].status), ((initialX + (size * k) + (initialX + size * (k + 1))) / 2) - 2, 150 + (8 + 20 * j), { lineBreak: true });
                        }else{
                            doc.fontSize(8).text('X', ((initialX + (size * k) + (initialX + size * (k + 1))) / 2) - 2, 150 + (8 + 20 * j), { lineBreak: true });
                        }
          
                }

                var numPresencas = 0;
                var numFaltas = 0;
                var pctPresen = 0;
                for (var k = 0; k < frequenciaCandidato.length; k++) {
                    if (frequenciaCandidato[k] != null && frequenciaCandidato[k].status == true) {
                        numPresencas++;
                    }
                }
                numFaltas = numAulas - numPresencas;
                pctPresen = (numPresencas / numAulas) * 100;
                doc.rect(660, 150 + (20 * j), 40, 20).fillAndStroke('#ddd', '#000')
                    .fill('#000').stroke()
                    .fontSize(8).text(turmaFrequencia.length, 674, 158 + (20 * j), { lineBreak: false });
                doc.rect(700, 150 + (20 * j), 40, 20).fillAndStroke('#ddd', '#000')
                    .fill('#000').stroke()
                    .fontSize(8).text(numPresencas, 714, 158 + (20 * j), { lineBreak: false });
                doc.rect(740, 150 + (20 * j), 40, 20).fillAndStroke('#ddd', '#000')
                    .fill('#000').stroke()
                    .fontSize(8).text(numFaltas, 756, 158 + (20 * j), { lineBreak: false });
                doc.rect(780, 150 + (20 * j), 40, 20).fillAndStroke('#ddd', '#000')
                    .fill('#000').stroke()
                    .fontSize(8).text(parseFloat(pctPresen).toFixed(2) + '%', 789, 158 + (20 * j), { lineBreak: false });
            }

            j++;
        }
    }

    function getFrequenciaCandidato(turmaFrequencia, candidato) {
        frequenciaCandidato = [];
        for (var i = 0; i < turmaFrequencia.length; i++) {
            for (var j = 0; j < turmaFrequencia[i].frequencia.length; j++) {
                if (candidato.id == turmaFrequencia[i].frequencia[j].candidato.id) {
                    frequenciaCandidato.push(turmaFrequencia[i].frequencia[j])
                }
            }
        }
        return frequenciaCandidato;
    }

    function addFooter(page) {
        doc.fontSize(7).text("São Luís (MA) " + moment().format('DD/MM/YYYY'), 10, doc.page.height - 50, { lineBreak: false });
        doc.text('pág.' + page, doc.page.width - 50, doc.page.height - 50, { lineBreak: false });
    }

}