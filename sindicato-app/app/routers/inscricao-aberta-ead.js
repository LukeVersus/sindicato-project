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
                jainscrito = null;
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    jainscrito = false;
                    var dataInicio = moment(body.data[i].dataInicio).format("DD/MM/YYYY");
                    var dataFim = moment(body.data[i].dataFim).format("DD/MM/YYYY");
                    for (let j = 0; j < body.data[i].inscricoes.length; j++) {
                        if(body.data[i].inscricoes[j].candidato.id == req.session.json.idCandidato) {
                            jainscrito = true;
                        }
                    }
                    const finallista = {
                        id: body.data[i].id,
                        codigo: body.data[i].codigo,
                        publicar: body.data[i].publicar,
                        curso: body.data[i].curso.nome,
                        categoria: body.data[i].curso.categoria.nome,
                        modalidade: body.data[i].curso.modalidade,
                        audiencia: body.data[i].curso.audiencia,
                        vagas: body.data[i].vagas,
                        dataInicio: dataInicio,
                        dataFim: dataFim,
                        cargaHoraria: body.data[i].curso.cargaHoraria,
                        inscricoes: body.data[i].inscricoes,
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
                                precisaDeferimento: body.data.curso.precisaDeferimento,
                                temDisciplina: body.data.curso.disciplina,
                                categoria: body.data.curso.categoria.nome,
                                idcurso: body.data.curso.idcurso,
                                cargaHoraria: body.data.curso.cargaHoraria,
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

        var nome = req.session.json.nome;
        var nomeatr = nome.split(" ");
        var firstname = nomeatr[0];
        var lastname = nomeatr[nomeatr.length-1];
        var timestampAtual = moment().format('X');
        var timestamp30Dias = moment().add(1, 'M').format('X');
        request({
            url: process.env.API_MOODLE + 'mdl-user/' +req.body.idcurso + '/' + req.body.modalidade,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json"
            },
            json: {
                "city": req.session.json.cidade,
                "email": req.session.json.email,
                "firstname": firstname,
                "lastname": lastname,
                "username": req.session.json.username,
                "password": req.session.json.senha
            },
        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Inscrição não realizada."+body.errors);
                res.redirect('/app/'+ rota +'/list');
            } else {                
                var urlmoodle;
                if (req.body.modalidade == 'EAD_ESCALAR') {
                    urlmoodle = 'http://ead.egma.ma.gov.br/webservice/rest/server.php?wstoken=a7a2b5aeb0adca9f03ce132f92a6662a&'+
                    'wsfunction=enrol_manual_enrol_users&enrolments[0][roleid]=5&enrolments[0][userid]='+body.data.id+'&enrolments[0][courseid]='+req.body.idcurso+'&'+
                    'enrolments[0][timestart]='+timestampAtual+'&enrolments[0][timeend]='+timestamp30Dias+'&enrolments[0][suspend]=0';
                } else {
                    urlmoodle = 'http://ead.egma.ma.gov.br/webservice/rest/server.php?wstoken=a7a2b5aeb0adca9f03ce132f92a6662a&'+
                    'wsfunction=enrol_manual_enrol_users&enrolments[0][roleid]=5&enrolments[0][userid]='+body.data.id+'&'+
                    'enrolments[0][courseid]='+req.body.idcurso+'&enrolments[0][suspend]=0';
                }
                request({
                    url: urlmoodle,
                    method: "GET",
                    json: true
                }, function(error, response, corpo) {
                    if(response.statusCode != 200) {
                        req.flash("danger", "Não foi possível realizar a inscrição.");
                        res.redirect("/app/"+rota+"/list");
                    } else {
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
                                "termoUsoEAD": req.body.termoUsoEAD,
                                "turma": {
                                  "id": req.body.idturma
                                },
                                "deferido": req.body.precisaDeferimento ? null : true
                            },
                        }, function (error, response, body) {
                            const teste = req.body.precisaDeferimento.toString() === 'true' ? 0 : 1;
                            if (response.statusCode != 200) {
                                req.flash("danger", "Não foi possível concluir a inscrição.");
                                res.redirect('/app/'+ rota +'/list');
                            } else { 
                                if (teste === 0) {
                                    req.flash("success", "Pré inscrição realizada com sucesso. Aguarde confirmação do Deferimento ou Indeferimento da inscrição por e-mail cadastrado.")
                                } else {
                                    req.flash("success", "Inscrição realizada com sucesso. Aguarde mais informações por e-mail cadastrado.");
                                }      
                                res.redirect('/app/meus-cursos-ead/list');
                            }
                
                            return true;
                        });
                    }
                });
            }
        });
        
        

    });

}