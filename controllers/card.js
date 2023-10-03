const mongoose = require("mongoose");

const {
  ERROR_CODE_SERVER_ERROR,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_FORBIDDEN,
} = require("../utils");

// запрашиваем модель card и присваеваем её константе Card
const Card = require("../models/card");

// получаем перечень всех карточек
const getCards = (req, res) => {
  Card.find({})
    // вернём все карточки
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) =>
      err
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" })
    );
};

// создание новой карточки
const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    // вернём записанные в базу данные
    .then((card) => res.status(201).send({ data: card }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: "Переданы некорректные данные при создании карточки",
        });
      }
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

// удаление карточки
const deleteCardById = (req, res) => {
  Card.findById(req.params.cardId)
    .orFail(new Error("NotValidId"))
    .then((card) => {
      if (req.user._id == card.owner) {
        res.send({ data: card });
        return card.deleteOne();
      } else {
        return res
          .status(ERROR_CODE_FORBIDDEN)
          .send({ message: "У вас нет прав на удаление этой карточки" });
      }
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        return res
          .status(ERROR_CODE_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена." });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: "Переданы некорректные данные для удаления карточки",
        });
      }
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

// поставить лайк карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .orFail(new Error("NotValidId"))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === "NotValidId") {
        return res
          .status(ERROR_CODE_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена." });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: "Передан несуществующий _id карточки",
        });
      }
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

// убрать лайк с карточки
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true }
  )
    .orFail(new Error("NotValidId"))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === "NotValidId") {
        return res
          .status(ERROR_CODE_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена." });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: "Передан несуществующий _id карточки",
        });
      }
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
