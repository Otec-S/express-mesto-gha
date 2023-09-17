const mongoose = require("mongoose");

const {
  ERROR_CODE_SERVER_ERROR,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
} = require("../utils");

//запрашиваем модель user и присваеваем её константе User
const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    // вернём записанные в базу данные
    .then((users) => {
      return res.status(200).send({ data: users });
    })
    .catch((err) => {
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

const findUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
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

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    // вернём записанные в базу данные
    .then((user) => {
      return res.status(201).send({ data: user });
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
};

//обновляем профиль пользователя
let currentName, currentAbout;

const updateUserProfile = (req, res) => {

  User.findById(req.user._id)
    .then((user) => {
      currentName = user.name;
      currentAbout = user.about;
    })
    .catch((err) => {
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });

  User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name || currentName, about: req.body.about || currentAbout},
    {
      new: true,
      runValidators: true,
    }
  )
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      }
      // user.name = req.body.name || user.name;
      // user.about = req.body.about || user.about;
      return res.status(200).send({ data: user });
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
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

//обновляем аватар пользователя
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
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      }
      return res.status(200).send({ data: user });
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
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

//общая ошибка в url
const wrongUrl = (req, res) => {
  return res.status(ERROR_CODE_NOT_FOUND).send({
    message: "Неверный адрес страницы",
  });
};

module.exports = {
  getUsers,
  findUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
  wrongUrl,
};
