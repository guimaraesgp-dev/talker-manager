const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const generateToken = require('./utils/generateToken');
const validateEmail = require('./middlewares/validateEmail');
const validadePassword = require('./middlewares/validatePassword');
const validateRate = require('./middlewares/validateRate');
const validateWatchedAt = require('./middlewares/validateWatchedAt');
const validateTalk = require('./middlewares/validateTalk');
const validateAuth = require('./middlewares/validateAuth');
const validateName = require('./middlewares/validateName');
const validateAge = require('./middlewares/validateAge');
const validateRateNumber = require('./middlewares/validateRateNumber');
const validateWatchedDate = require('./middlewares/validateWatchedDate');
const validateNewTalk = require('./middlewares/validateNewTalk');

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

app.get('/', (req, res) => {
  res.status(HTTP_OK_STATUS).send();
});

 app.patch('/talker/rate/:id', validateAuth, validateNewTalk, async (req, res) => {
   const { id } = req.params;
   const { rate } = req.body;
   const talkers = await readData(talkerPath);
   const index = talkers.findIndex((talker) => talker.id === Number(id));
   talkers[index].talk.rate = rate;
   await writeFile(talkerPath, talkers);
   return res.status(204).end();
 });

app.get('/talker/search', validateAuth, validateRateNumber, validateWatchedDate,  
async (req, res) => {
  let data = await readData(talkerPath); 
  const { q, rate, date } = req.query;
    if (q) {
    data = data.filter((talker) => talker.name.toLowerCase().includes(q.toLowerCase()));
  }
  if (rate) {
    data = data.filter((talkerN) => talkerN.talk.rate === Number(rate));
  }
  if (date) {
    data = data.filter((talkerW) => talkerW.talk.watchedAt === date);
  } 
  return res.status(200).json(data);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = await readData(talkerPath);
  const idTalker = data.find((talker) => talker.id === Number(id));
  if (!idTalker) {
    return res.status(404).send({
      message: 'Pessoa palestrante não encontrada',
    });
  }
  return res.status(200).json(idTalker);
});

app.get('/talker', async (req, res) => {
  const data = await readData(talkerPath);
  return res.status(200).json(data);
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
  validateWatchedAt, validateRate, async (req, res) => {
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

app.delete('/talker/:id', validateAuth, async (req, res) => {
    const data = await readData(talkerPath); 
    const { id } = req.params;
    const filterTalker = data.filter((talker) => talker.id !== Number(id));
    await fs.writeFile(talkerPath, JSON.stringify(filterTalker));
      return res.status(204).end();
  });

app.listen(PORT, () => {
  console.log('Online');
});
