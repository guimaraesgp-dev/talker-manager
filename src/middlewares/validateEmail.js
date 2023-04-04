module.exports = (req, res, next) => {
    const { email } = req.body;
    const emailregex = /\S+@\S+\.\S+/;
  
    if (!email) {
      return res.status(400).json({
        message: 'O campo "email" é obrigatório',
      });
    }
    if (!emailregex.test(email)) {
      return res.status(400).json({
          message: 'O "email" deve ter o formato "email@email.com"',
        });
    }
    next();
  };