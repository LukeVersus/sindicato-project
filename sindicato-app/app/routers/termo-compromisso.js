require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
const fs = require('fs');
const PDFDocument = require('pdfkit');
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
    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/:id/:token', function (req, res) {

        request({
            url: process.env.API_HOST + 'inscricao/' + req.params.id,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
               // "Authorization": req.params.token
            },
        }, function (error, response, body) {
            lista = body.data;
            inscricao = lista;
            if (response.statusCode == 200) {
                if (body.data.cienciaTermo != true) {
                    res.format({
                        html: function () {
                            res.render(rota + '/Create', { itens: lista, page: rota, informacoes: req.session.json });
                        }
                    });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        });
    });

    

    app.get('/app/:id/' + rota + '/file.pdf', function (req, res) {
        request({
            url: process.env.API_HOST + 'inscricao/' + req.params.id,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, function (error, response, body) {
            getPdf(body.data, res);
        });
    });

    function getPdf(inscricaoDados, res) {
        var formacao;

        switch (inscricaoDados.candidato.tpformacao) {
            case "ENSINO_MEDIO":
                formacao = "Ensino Médio";
                break;
            case "SUPERIOR_INCOMPLETO":
                formacao = "Superior Incompleto";
                break;
            case "SUPERIOR_COMPLETO":
                formacao = "Superior Completo";
                break;
            case "POS_GRADUACAO":
                formacao = "Pós Graduação";
                break;
            case "MESTRADO":
                formacao = "Mestrado";
                break;
            case "DOUTORADO":
                formacao = "Doutorado";
                break;
            default:
                break;
        }


        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream('file.pdf'));
        doc.info['Title'] = "Termo de Compromisso";
        doc.image('public/img/egma_segep_b_png.png', 30, 22, {
            fit: [170, 120],
            align: 'center',

        });
        doc.font('Helvetica').fontSize(12);
        doc.text("Estado do Maranhão", 210, 27);
        doc.text("Escola de Governo do Estado do Maranhão", 210, 42)
        doc.text("FICHA DE INSCRIÇÃO / TERMO DE COMPROMISSO", 210, 57);
        doc.rect(30, 90, 550, 14).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("DADOS DO ALUNO", 250, 95, {lineBreak: false});
        doc.moveDown();
        doc.rect(30, 105, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("ID", 35, 110, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.id, 35, 120)
            .font('Helvetica-Bold').fontSize(6).text("NOME", 90, 110)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.nome, 90, 120)
            .font('Helvetica-Bold').fontSize(6).text("SEXO", 290, 110)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.sexo, 290, 120)
            .font('Helvetica-Bold').fontSize(6).text("DATA DE NASCIMENTO", 350, 110)
            .font('Helvetica').fontSize(8).text(moment(inscricaoDados.candidato.datanascimento).format("DD/MM/YYYY"), 350, 120)
            .font('Helvetica-Bold').fontSize(6).text("FORMAÇÃO", 450, 110)
            .font('Helvetica').fontSize(8).text(formacao, 450, 120);
        doc.rect(30, 130, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("LOGRADOURO", 35, 135, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.endereco.logradouro, 35, 145)
            .font('Helvetica-Bold').fontSize(6).text("COMPLEMENTO", 290, 135)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.endereco.complemento, 290, 145);
        doc.rect(30, 155, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("BAIRRO", 35, 160, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.endereco.bairro, 35, 170)
            .font('Helvetica-Bold').fontSize(6).text("CEP", 290, 160)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.endereco.cep, 290, 170)
            .font('Helvetica-Bold').fontSize(6).text("CIDADE", 350, 160)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.endereco.municipio.nome, 350, 170);
        doc.rect(30, 180, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("FONE", 35, 185, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.fone, 35, 195)
            .font('Helvetica-Bold').fontSize(6).text("CELULAR", 100, 185)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.celular, 100, 195)
            .font('Helvetica-Bold').fontSize(6).text("E-MAIL", 170, 185)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.usuario.email, 170, 195)
            .font('Helvetica-Bold').fontSize(6).text("R.G (CARTEIRA DE IDENTIDADE)", 290, 185)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.rg, 290, 195)
            .font('Helvetica-Bold').fontSize(6).text("C.P.F", 470, 185)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.cpf, 470, 195);
        doc.rect(30, 205, 550, 14).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("DADOS FUNCIONAIS", 245, 210, {lineBreak: false});
        doc.rect(30, 220, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("ÓRGÃO", 35, 225, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.orgao.nome, 35, 235)
            .font('Helvetica-Bold').fontSize(6).text("LOTAÇÃO", 290, 225)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.lotacao, 290, 235);
        doc.rect(30, 245, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("CARGO", 35, 250, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.cargo, 35, 260)
            .font('Helvetica-Bold').fontSize(6).text("FUNÇÃO", 290, 250)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.funcao, 290, 260);
        doc.rect(30, 270, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("ÁREA DE ATUAÇÃO", 35, 275, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.area, 35, 285)
            .font('Helvetica-Bold').fontSize(6).text("ID", 290, 275)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.matricula, 290, 285)
            .font('Helvetica-Bold').fontSize(6).text("E-MAIL (chefe imediato)", 350, 275)
            .font('Helvetica').fontSize(8).text(inscricaoDados.candidato.emailchefe, 350, 285);
        doc.rect(30, 295, 550, 16).fillAndStroke('#ddd', '#000')
            .fill('#000').stroke()
            .fontSize(8).text("DADOS DO CURSO / INSCRIÇÃO", 230, 300, {lineBreak: false});
        doc.moveDown();
        doc.rect(30, 310, 550, 25).fillAndStroke('#fff','#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("CURSO", 35, 315, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.turma.curso.nome, 35, 325);
        doc.rect(30, 335, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("CARGA HORÁRIA", 35, 340, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.turma.curso.cargaHoraria, 35, 350)
            .font('Helvetica-Bold').fontSize(6).text("VAGAS", 170, 340)
            .font('Helvetica').fontSize(8).text(inscricaoDados.turma.vagas, 170, 350)
            .font('Helvetica-Bold').fontSize(6).text("CATEGORIA", 290, 340)
            .font('Helvetica').fontSize(8).text(inscricaoDados.turma.curso.categoria.nome, 290, 350);
        doc.rect(30, 360, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("LOCAL DE REALIZAÇÃO", 35, 365, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.turma.local, 35, 375)
            .font('Helvetica-Bold').fontSize(6).text("HORÁRIO", 290, 365)
            .font('Helvetica').fontSize(8).text(inscricaoDados.turma.horaInicio + " até " + inscricaoDados.turma.horaFim + " ("+ inscricaoDados.turma.turno + ")", 290, 375)
            .font('Helvetica-Bold').fontSize(6).text("PERÍODO", 430, 365)
            .font('Helvetica').fontSize(8).text(moment(inscricaoDados.turma.dataInicio).format("DD/MM/YYYY") + " até " + moment(inscricaoDados.turma.dataFim).format("DD/MM/YYYY"), 430, 375);
        doc.rect(30, 385, 550, 25).fillAndStroke('#fff', '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(6).text("PROFESSOR", 35, 390, {lineBreak: false})
            .font('Helvetica').fontSize(8).text(inscricaoDados.turma.professor.nome, 35, 400)
            .font('Helvetica-Bold').fontSize(6).text("DATA DE INSCRIÇÃO", 290, 390)
            .font('Helvetica').fontSize(8).text(moment(inscricaoDados.dataInscricao).format("DD/MM/YYYY"), 290, 400);
        doc.rect(30, 420, 550, 27).fillAndStroke("#ddd", '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(11).text("TRAZER ESTE TERMO ASSINADO NO 1º DIA DE AULA", 170, 430);
        doc.rect(30, 445, 550, 290).fillAndStroke("#fff", '#000')
            .fill('#000').stroke()
            .font('Helvetica-Bold').fontSize(10).text("TERMO DE COMPROMISSO E RESPONSABILIDADE", 180, 460)
            .fontSize(9)
            .font('Helvetica').text("Pelo presente TERMO DE COMPROMISSO E RESPONSABILIDADE, eu, " + inscricaoDados.candidato.nome + ", ID nº "
                + inscricaoDados.candidato.matricula + ", ocupante do cargo de " + inscricaoDados.candidato.cargo + ", lotado (a) no (na) "
                + inscricaoDados.candidato.setor + " da(o) " + inscricaoDados.candidato.orgao.nome + " (" + inscricaoDados.candidato.orgao.sigla
                + "), tendo solicitado, voluntariamente, participação no curso " + inscricaoDados.turma.curso.nome
                + " assumo os seguintes compromissos e responsabilidades:", 75, 485, {align: 'justify'})
            .text("1 - Cumprir o percentual máximo de frequência possível ou assegurar participação mínima de 70% (setenta por cento) de frequência.", 75, 525, {align: 'justify'})
            .text("2 - Cumprir as exigências curriculares e atingir a média necessária para aprovação em cada disciplina quando couber.", 75, 550, {align: 'justify'})
            .text("3 - Acatar as normas Institucionais.", 75, 575)
            .text("4 - Não abandonar o curso, salvo por motivo justificado, a ser avaliado pela Supervisão Pedagógica.", 75, 590)
            .text("5 - Em caso de desistência ou insuficiência de frequência, estou ciente de que será vedada a minha participação em programas "
                + "de capacitação ofericidos pela Escola de Governo do Maranhão/EGMA por um período de 3(três) meses.", 75, 605, {align: 'justify'})
            .text("São Luis, __________ de ________________________________________________ de " + moment().format('YYYY') + ".", 110, 650)
            .fontSize(8).text("_____________________________________", 75, 680)
            .font('Helvetica-Oblique').text("Assinatura do Servidor", 115, 690)
            .font('Helvetica').text("_____________________________________", 350, 680)
            .font('Helvetica-Oblique').text("Assinatura do Chefe Imediato", 385, 690);
        doc.fontSize(7).text("São Luís (MA) "+ moment().format('DD/MM/YYYY'), 35, doc.page.height - 50, {lineBreak: false});
        doc.text('pag. 1/1', 550 , doc.page.height - 50, {lineBreak: false});
        doc.pipe(res);
        doc.end();
    }






}