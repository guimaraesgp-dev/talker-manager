module.exports = (req, res, next) => {
  const { rate } = req.query;
  if (rate === undefined) {
    return next();
  } 
  if (!Number.isInteger(Number(rate)) || rate > 5 || rate < 1) {
    return res.status(400).json({
      message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
    });
  } 
  next();
  };
