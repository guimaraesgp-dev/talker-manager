module.exports = (req, res, next) => {
    const { date } = req.query;
    const regexDate = /\d{2}\/\d{2}\/\d{4}/;
    if (!date) {
      return next();
    } 
    if (!regexDate.test(date)) {
      return res.status(400).json({
        message: 'O parâmetro "date" deve ter o formato "dd/mm/aaaa"',
      });
    }
    next();
  };
