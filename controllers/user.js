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
    .orFail(new NotFound404Error("Пользователь с указанным _id не найден"))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(
          new BadRequest400Error("Невалидный _id пользователя")
        );
        return;
      }
      next(err);
    });
};

// создаем нового пользователя
const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;
  // хэшируем пароль
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User.create({ name, about, avatar, email, password: hash })
        // вернём записанные в базу данные
        .then((user) => {
          res.status(201).send({
            data: {
              name: user.name,
              about: user.about,
              avatar: user.avatar,
              _id: user._id,
              email: user.email,
            },
          });
        })
        // данные не записались, вернём ошибку
        .catch((err) => {
          if (err.code === 11000) {
            next(
              new Conflict409Error(
                "Пользователь с таким email уже зарегистрирован"
              )
            );
            return;
          }
          if (err instanceof mongoose.Error.ValidationError) {
            next(
              new BadRequest400Error(
                "Переданы некорректные данные при создании пользователя"
              )
            );
            return;
          }
          next(err);
        });
    })
    .catch(next);
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
          .then((authUser) => {
            // создадим токен
            const token = jwt.sign({ _id: authUser._id }, "some-secret-key", {
              expiresIn: "7d",
            });
            // вернём токен
            res.send({ token });
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

const updateUserProfile = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      about: req.body.about,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(new NotFound404Error("Пользователь с указанным _id не найден"))
    .then((user) => res.status(200).send({ data: user }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(
          new BadRequest400Error(
            "Переданы некорректные данные при обновлении профиля"
          )
        );
        return;
      }
      next(err);
    });
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
    .orFail(new NotFound404Error("Пользователь с указанным _id не найден"))
    .then((user) => res.status(200).send({ data: user }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(
          new BadRequest400Error(
            "Переданы некорректные данные при обновлении аватара"
          )
        );
        return;
      }
      next(err);
    });
};

module.exports = {
  getUsers,
  findUserById,
  createUser,
  login,
  findCurrentUser,
  updateUserProfile,
  updateUserAvatar,
};
