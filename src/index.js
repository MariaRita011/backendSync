require('dotenv').config();
require("./whatsapp/whatsapp");
const express = require('express');
const cors = require('cors'); 
const usuariosRoute = require('./routes/usuarios.routes');

const categoriasRoute = require('./routes/categorias.routes');
const salasFixasRoute = require('./routes/salasFixas.routes')
const historicoRoute = require('./routes/historico.routes')
const chavesRoute = require('./routes/chaves.routes')
const ambientesRoute = require('./routes/ambientes.routes')
const path = require('path')

const app = express();

const port = process.env.PORT || 3033;


app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers","X-Custom-Header, Content-Type, Authorization")
    app.use(cors());
    next();
});

app.use('/uploads', (req, res, next) => {
    console.log(`acessando ${req.path}`);
    next();
}, express.static(path.join(__dirname, '..', 'uploads')));

app.use('/', usuariosRoute);
app.use('/', categoriasRoute);
app.use('/', salasFixasRoute);
app.use('/', historicoRoute);
app.use('/', chavesRoute);
app.use('/', ambientesRoute);

app.listen(port, () => {
    console.log(`App listening on  http://localhost:${port}`);
    });