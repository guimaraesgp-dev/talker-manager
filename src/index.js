const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const generateToken = require('./utils/generateToken');
//const readData = require('./utils/fsUtils');
const validateEmail = require('./middlewares/validateEmail');
const validadePassword = require('./middlewares/validatePassword');
const validateRate = require('./middlewares/validateRate');
const validateWatchedAt = require('./middlewares/validateWatchedAt');
const validateTalk = require('./middlewares/validateTalk');
const validateAuth = require('./middlewares/validateAuth');
const validateName = require('./middlewares/validateName');
const validateAge = require('./middlewares/validateAge');

const talkerPath = path.resolve(__dirname, 'talker.json');


const readData = async (pathUrl) => {
  const obj = await fs.readFile(pathUrl);
  return JSON.parse(obj);
};

const writeFile = async (pathUrl, toWrite) => {
  await fs.writeFile(pathUrl, JSON.stringify(toWrite));
};

  const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (request, response) => {
  const data = await readData(talkerPath);
  return response.status(200).json(data);
});

app.get('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const data = await readData(talkerPath);
  const idTalker = data.find((talker) => talker.id === Number(id));
  if (!idTalker) {
    return response.status(404).send({
      message: 'Pessoa palestrante não encontrada',
    });
  }
  return response.status(200).json(idTalker);
});

app.post('/login', validateEmail, validadePassword, (req, res) => {
  try {
    const token = generateToken();
    res.status(200).json({ token });
  } catch (err) { 
    res.status(500).send({ message: err.message });
  }
});

app.post('/talker', 
  validateAuth, validateName, validateAge, validateTalk, 
  validateRate, validateWatchedAt, async (req, res) => {
  const obj = await readData(talkerPath);
  const talker = req.body;
  talker.id = obj.length + 1;
  obj.push(talker);
  await writeFile(talkerPath, obj);

  res.status(201).json(talker);
});

app.listen(PORT, () => {
  console.log('Online');
});
