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
        request({
            url: process.env.API_HOST + 'turma/aberto/true',
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json"
            },
        }, function (error, response, body) {
            lista = [];
            for (var i = 0; i < Object.keys(body.data).length; i++) {
                var dataInicio = moment(body.data[i].dataInicio).format("DD/MM/YYYY");
                var dataFim = moment(body.data[i].dataFim).format("DD/MM/YYYY");
                const finallista = {
                    id: body.data[i].id,
                    codigo: body.data[i].codigo,
                    publicar: body.data[i].publicar,
                    curso: body.data[i].curso.nome,
                    cargaHoraria: body.data[i].curso.cargaHoraria,
                    audiencia: body.data[i].curso.audiencia,
                    categoria: body.data[i].curso.categoria.nome,
                    modalidade: body.data[i].curso.modalidade,
                    vagas: body.data[i].vagas,
                    horaInicio: body.data[i].horaInicio,
                    horaFim: body.data[i].horaFim,
                    dataInicio: dataInicio,
                    dataFim: dataFim,
                };
                lista.push(finallista);


            }
            res.format({
                html: function () {
                    res.render(rota + '/List', { itens: lista, page: rota });
                }
            });
            return lista;
        });
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/:id', function (req, res) {
        categorias = [];
        request({
            url: process.env.API_HOST + "turma/aberto/detail/" + req.params.id,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json"
            },
        }, function (error, response, body) {

            var dataInicio = moment(body.data.dataInicio).format("DD/MM/YYYY");
            var dataFim = moment(body.data.dataFim).format("DD/MM/YYYY");
            
            request({
                url: process.env.API_HOST + "disciplina/curso/aberto/" + body.data.curso.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json"
                },
            }, function(error, response, corpo) {
                disciplinas = [];
                for (let i = 0; i < Object.keys(corpo.data).length; i++) {
                    const finallista = {
                        professor: corpo.data[i].professor.nome
                    };
                    if (disciplinas.length != 0) {
                        for (const disciplina of disciplinas) {
                            if (finallista.professor != disciplina.professor) {
                                disciplinas.push(finallista);
                            }
                        }
                    } else {
                        disciplinas.push(finallista);
                    }
                }
                res.format({
                    html: function () {
                        res.render(rota + '/Detail', {
                            id: body.data.id,
                            curso: body.data.curso.nome,
                            objetivo: body.data.curso.objetivo,
                            ementa: body.data.curso.ementa,
                            publico: body.data.curso.publico,
                            cargaHoraria: body.data.curso.cargaHoraria,
                            dataInicio: dataInicio,
                            dataFim: dataFim,
                            horaInicio: body.data.horaInicio,
                            horaFim: body.data.horaFim,
                            turno: body.data.turno,
                            local: body.data.local,
                            instrutor: body.data.professor != null ? body.data.professor.nome : null,
                            disciplinas,
                            temDisciplina: body.data.curso.disciplina,
                            page: rota
                        });
                    }
                });
            });
        });
    });

}