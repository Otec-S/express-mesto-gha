const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken"); // импортируем модуль jsonwebtoken

const {
  ERROR_CODE_SERVER_ERROR,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_UNAUTHORIZED,
} = require("../utils");

// запрашиваем модель user и присваеваем её константе User
const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    // вернём записанные в базу данные
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) =>
      err
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" })
    );
};

const findUserById = (req, res) => {
  User.findById(req.params.id)
    .orFail(new Error("NotValidId"))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === "NotValidId") {
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res
          .status(ERROR_CODE_BAD_REQUEST)
          .send({ message: "Пользователь по указанному _id не найден" });
      }
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

// создаем нового пользователя
const createUser = (req, res) => {
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
        if (err instanceof mongoose.Error.ValidationError) {
          return res.status(ERROR_CODE_BAD_REQUEST).send({
            message: "Переданы некорректные данные при создании пользователя",
          });
        }
        return res
          .status(ERROR_CODE_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      });
  });
};

// аутентификация пользователя
const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {

        // !!!!!!!!!! TODO - ERROR_CODE_UNAUTHORIZED исправь обработку ошибок здесь и далее
        return Promise.reject(new Error("Неправильные почта или пароль"));
      }

      return bcrypt
        .compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // хеши не совпали — отклоняем промис
            return Promise.reject(new Error("Неправильные почта или пароль"));
          }

          // аутентификация успешна
          return user;
        })
        .then((user) => {
          // создадим токен
          const token = jwt.sign({ _id: user._id }, "some-secret-key", {
            expiresIn: "7d",
          });

          // вернём токен
          res.send({ token }); // ??? почему тут объект
        });
    })
    .catch((err) => {
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

// обновляем профиль пользователя
let newName;
let newAbout;

const updateUserProfile = (req, res) => {
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
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      }
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: "Переданы некорректные данные при обновлении профиля",
        });
      }
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

// обновляем аватар пользователя
const updateUserAvatar = (req, res) => {
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
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      }
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: "Переданы некорректные данные при обновлении аватара",
        });
      }
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

// общая ошибка в url
const wrongUrl = (req, res) =>
  res.status(ERROR_CODE_NOT_FOUND).send({ message: "Неверный адрес страницы" });

module.exports = {
  getUsers,
  findUserById,
  createUser,
  login,
  updateUserProfile,
  updateUserAvatar,
  wrongUrl,
};
