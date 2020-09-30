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
            request({
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
                    var dataInicio = moment(body.data[i].dataInicio).format("DD-MM-YYYY");
                    var dataFim = moment(body.data[i].dataFim).format("DD-MM-YYYY");
                    const finallista = {
                        id: body.data[i].id,
                        codigo: body.data[i].codigo,
                        publicar: body.data[i].publicar,
                        vagas: body.data[i].vagas,
                        dataInicio: dataInicio,
                        dataFim: dataFim,
                        horaInicio: body.data[i].horaInicio,
                        horaFim: body.data[i].horaFim,
                        curso: body.data[i].curso.nome,
                        cargaHoraria: body.data[i].curso.cargaHoraria,
                        audiencia: body.data[i].curso.audiencia
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
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
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

                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            codigo: body.data.codigo,
                            page: rota,
                            informacoes: req.session.json
                        });
                    }
                });
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {
        var datainscricao = moment().now;
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
                "chave": req.body.chave,
                "dataInscricao": datainscricao,
                "motivoInscricao": req.body.motivo,
                "turma": {
                  "id": req.body.idturma
                }
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Item não atualizado. "+body.errors);
            } else {
                req.flash("success", "Item atualizado com sucesso.");
            }

            res.redirect('/app/' + rota + '/list');
            return true;
        });

    });

}