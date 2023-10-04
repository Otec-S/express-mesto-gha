const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken"); // импортируем модуль jsonwebtoken

const BadRequest400Error = require("../errors/bad-request-400-error");
const Unauthorized401Error = require("../errors/unauthorized-401-error");
const NotFound404Error = require("../errors/not-found-404-error");
const Conflict409Error = require("../errors/conflict-409-error");


// запрашиваем модель user и присваеваем её константе User
const User = require("../models/user");

// получение всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    // вернём записанные в базу данные
    .then((users) => res.status(200).send({ data: users }))
    .catch(next);
};

// нахождение пользователя по его Id
const findUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(new Error("NotValidId"))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFound404Error("Пользователь с указанным _id не найден");
      }
      if (err instanceof mongoose.Error.CastError) {
        throw new BadRequest400Error(
          "Пользователь по указанному _id не найден"
        );
      }
    })
    .catch(next);
};

// создаем нового пользователя
const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;
  // хэшируем пароль
  bcrypt.hash(password, 10).then((hash) => {
    User.create({ name, about, avatar, email, password: hash })
      // вернём записанные в базу данные
      .then((user) => {
        res.status(201).send({ data: user });
      })
      // данные не записались, вернём ошибку
      .catch((err) => {
        if (err.code === 11000) {
          throw new Conflict409Error(
            "Пользователь с таким email уже зарегистрирован"
          );
        }
        if (err instanceof mongoose.Error.ValidationError) {
          throw new BadRequest400Error(
            "Переданы некорректные данные при создании пользователя"
          );
        }
      })
      .catch(next);
  });
};

// аутентификация пользователя
const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select("+password")
    // сначала проверяем почту - есть такая вообще в базе?
    .then((user) => {
      if (!user) {
        throw new Unauthorized401Error("Неправильные почта или пароль");
      }
      return (
        bcrypt
          .compare(password, user.password)
          // теперь проверяем пароль на совпадение с имеющимися в базе
          .then((matched) => {
            if (!matched) {
              // хеши не совпали — выбрасываем ошибку
              throw new Unauthorized401Error("Неправильные почта или пароль");
            }
            // аутентификация успешна - возвращаем юзера
            return user;
          })
          .then((user) => {
            // создадим токен
            const token = jwt.sign({ _id: user._id }, "some-secret-key", {
              expiresIn: "7d",
            });

            // вернём токен
            res.send({ token }); // ??? почему тут объект
          })
      );
    })
    .catch(next);
};

// поиск текущего пользователя
const findCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(200).send({ data: user }))
    // пользователь не найден, вернём ошибку
    .catch(next);
};

// обновляем профиль пользователя
let newName;
let newAbout;

const updateUserProfile = (req, res, next) => {
  if (req.body.name) {
    newName = req.body.name;
  }

  if (req.body.about) {
    newAbout = req.body.about;
  }

  User.findByIdAndUpdate(
    req.user._id,
    {
      name: newName,
      about: newAbout,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(new Error("NotValidId"))
    .then((user) => res.status(200).send({ data: user }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFound404Error("Пользователь с указанным _id не найден");
      }
      if (err instanceof mongoose.Error.ValidationError) {
        throw new BadRequest400Error(
          "Переданы некорректные данные при обновлении профиля"
        );
      }
    })
    .catch(next);
};

// обновляем аватар пользователя
const updateUserAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: req.body.avatar,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(new Error("NotValidId"))
    .then((user) => res.status(200).send({ data: user }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFound404Error("Пользователь с указанным _id не найден");
      }
      if (err instanceof mongoose.Error.ValidationError) {
        throw new BadRequest400Error(
          "Переданы некорректные данные при обновлении аватара"
        );
      }
    })
    .catch(next);
};

// общая ошибка в url
const wrongUrl = (req, res, next) => {
  const err = new NotFound404Error("Неверный адрес страницы");
  return next(err);
};

module.exports = {
  getUsers,
  findUserById,
  createUser,
  login,
  findCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  wrongUrl,
};
