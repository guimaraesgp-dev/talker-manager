const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const generateToken = require('./utils/generateToken');
// const readData = require('./utils/fsUtils');
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

app.get('/talker/search', validateAuth, async (req, res) => {
  const { q } = req.query;
  const data = await readData(talkerPath);
  const searchTalker = data.filter((talker) => talker.name.includes(q));
  if (!q) {
    res.status(200).json(data);
  } else if (!searchTalker) {
    res.status(200).json([]);
  } else return res.status(200).json(searchTalker);
});

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

app.put('/talker/:id', validateAuth, validateName, validateAge, validateTalk, 
validateRate, validateWatchedAt, async (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  const newTalk = { watchedAt, rate };
  const talkers = await readData(talkerPath);
  const talkerNumber = talkers.findIndex((each) => each.id === Number(id));
  if (talkerNumber === -1) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  const editedTalker = { id: Number(id), name, age, talk: newTalk };
  talkers[talkerNumber] = editedTalker;
  await writeFile(talkerPath, talkers);
  res.status(200).json(editedTalker);
});

app.delete('/talker/:id', validateAuth, async (request, response) => {
    const data = await readData(talkerPath); 
    const { id } = request.params;
    const filterTalker = data.filter((talker) => talker.id !== Number(id));
    await fs.writeFile(talkerPath, JSON.stringify(filterTalker));
      return response.status(204).end();
  });

app.listen(PORT, () => {
  console.log('Online');
});
