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
    .orFail(new Error("NotValidId"))
    .then((user) => {
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      } else if (err instanceof mongoose.Error.CastError) {
        return res
          .status(ERROR_CODE_BAD_REQUEST)
          .send({ message: "Пользователь по указанному _id не найден" });
      } else {
        return res
          .status(ERROR_CODE_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      }
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
      } else {
        return res
          .status(ERROR_CODE_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      }
    });
};

//обновляем профиль пользователя
let newName, newAbout;

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
    .then((user) => {
      return res.status(200).send({ data: user });
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.message === "NotValidId") {
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      } else if (err instanceof mongoose.Error.ValidationError) {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: "Переданы некорректные данные при обновлении профиля",
        });
      } else {
        return res
          .status(ERROR_CODE_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      }
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
    .orFail(new Error("NotValidId"))
    .then((user) => {
      return res.status(200).send({ data: user });
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.message === "NotValidId") {
        return res.status(ERROR_CODE_NOT_FOUND).send({
          message: "Пользователь с указанным _id не найден",
        });
      } else if (err instanceof mongoose.Error.ValidationError) {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: "Переданы некорректные данные при обновлении аватара",
        });
      } else {
        return res
          .status(ERROR_CODE_SERVER_ERROR)
          .send({ message: "На сервере произошла ошибка" });
      }
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
