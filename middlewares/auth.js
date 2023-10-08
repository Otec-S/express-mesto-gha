const jwt = require("jsonwebtoken");

const Unauthorized401Error = require("../errors/unauthorized-401-error");

// анонимная функция
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const err = new Unauthorized401Error("Необходима авторизация");
    return next(err);
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, "some-secret-key");
  } catch (e) {
    const err = new Unauthorized401Error("Необходима авторизация");
    return next(err);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше

  return req.user;
};
