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

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + 'turma',
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    jainscrito = false;
                    var dataInicio = moment(body.data[i].dataInicio).format("DD/MM/YYYY");
                    var dataFim = moment(body.data[i].dataFim).format("DD/MM/YYYY");
                    
                    if (body.data[i].inscricoes != []) {
                        var inscricoes = body.data[i].inscricoes;
                        var jainscrito;
                        jainscrito = false;
                        for (let j = 0; j < body.data[i].inscricoes.length; j++) {
                            if(body.data[i].inscricoes[j].candidato.id == req.session.json.idCandidato) {
                                jainscrito = true;
                            }
                        }
                    }
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
                        inscrito: jainscrito
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

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/create/:id', function (req, res) {
        categorias = [];
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "turma/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                var dataInicio = moment(body.data.dataInicio).format("DD-MM-YYYY");
                var dataFim = moment(body.data.dataFim).format("DD-MM-YYYY");

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
                            res.render(rota + '/Create', {
                                id: body.data.id,
                                codigo: body.data.codigo,
                                curso: body.data.curso.nome,
                                categoria: body.data.curso.categoria.nome,
                                cargaHoraria: body.data.curso.cargaHoraria,
                                temDisciplina: body.data.curso.disciplina,
                                dataInicio: dataInicio,
                                dataFim: dataFim,
                                horaInicio: body.data.horaInicio,
                                horaFim: body.data.horaFim,
                                disciplinas,
                                instrutor: body.data.professor != null ? body.data.professor.nome : null,
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
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {
        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        }

        json = req.body;
        
        request({
            url: process.env.API_HOST + 'inscricao',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "candidato": {
                  "id": req.body.idcandidato
                },
                "chave": req.session.token,
                "dataInscricao": moment().toDate(),
                "motivoInscricao": req.body.motivo,
                "turma": {
                  "id": req.body.idturma
                }
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível realizar a inscrição.");
                res.redirect('/app/'+ rota +'/list');
            } else {
                req.flash("success", "Pré inscrição realizada com sucesso. Aguarde confirmação do Deferimento ou Indeferimento da inscrição por e-mail cadastrado.");
                res.redirect('/app/meus-cursos/list');
            }

            return true;
        });
    });

 
    
 


}