const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const sequelize = require('./config/database');
const Usuario = require('./models/usuario');
const Zona = require('./models/zona'); // Zona antes de Paciente (se houver relação)
const Cita = require('./models/cita');
const Historial = require('./models/historial'); // Historial antes de Tratamiento e Multimedia
const Tratamiento = require('./models/tratamiento');
const Multimedia = require('./models/multimedia');
const Alergia = require('./models/alergia');
const Medicamento = require('./models/medicamento');

/*
// Gerar chaves JWT secrets
// const crypto = require('crypto');

// const jwtSecret = crypto.randomBytes(32).toString('hex');
// console.log("jwt", jwtSecret);

*/
// Associações entre os Modelos
Usuario.hasMany(Cita, { foreignKey: 'idPaciente', as: 'Citas' });
Usuario.hasMany(Cita, { foreignKey: 'idUsuarioCadastro' });
Cita.hasMany(Medicamento, { foreignKey: 'idCita' });

Cita.belongsTo(Zona, { foreignKey: 'idZona' });

Usuario.hasMany(Historial, { foreignKey: 'idPaciente' });
Usuario.hasMany(Alergia, { foreignKey: 'idPaciente' });

Historial.hasMany(Tratamiento, { foreignKey: 'historialClinicoId' });
Historial.hasMany(Multimedia, { foreignKey: 'historialClinicoId' });

const app = express();
const port = process.env.PORT || 8805;

app.use(express.json())
// Configuração de Cookies
app.use(cookieParser());

// Configuração do Middleware de CORS
const corsOptions = {
  origin: 'http://localhost:5173', // URL do seu frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['x-access-token'],
};
app.use(cors(corsOptions));

// Configurações de Segurança (Helmet)
app.use(helmet({
  // contentSecurityPolicy: {
  //   directives: {
  //     defaultSrc: ["'self'"],
  //     scriptSrc: ["'self'", 'http://localhost:5173'], // Substitua pelo seu domínio
  //     imgSrc: ["'self'", 'data:'],
      // ... (outras diretivas)
  //   },
  // },
}));

// Configuração do Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/v1', routes);

// Middleware de erro genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro no servidor.' });
});

// Sincronizar o banco de dados e iniciar o servidor
(async () => {
  try {
    // await sequelize.sync({ force: true });
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Banco de dados sincronizado!');

    // Iniciar o servidor
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
})();