const mongoose = require("mongoose");

const {
  ERROR_CODE_SERVER_ERROR,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_NOT_FOUND,
} = require("../utils");

//запрашиваем модель card и присваеваем её константе Card
const Card = require("../models/card");

const getCards = (req, res) => {
  Card.find({})
    // вернём все карточки
    .then((cards) => {
      return res.status(200).send({ data: cards });
    })
    .catch((err) => {
      return res
        .status(ERROR_CODE_SERVER_ERROR)
        .send({ message: "На сервере произошла ошибка" });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    // вернём записанные в базу данные
    .then((card) => {
      return res.status(201).send({ data: card });
    })
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

const deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId, { useFindAndModify: false })
    .then((card) => {
      if (!card) {
        return res
          .status(ERROR_CODE_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена." });
      }
      return res.send({ data: card });
    })
    .catch((err) => {
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

//поставить лайк карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .then((card) => {
      if (!card) {
        return res
          .status(ERROR_CODE_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена." });
      }
      return res.status(201).send({ data: card });
    })
    .catch((err) => {
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
    .then((card) => {
      if (!card) {
        return res
          .status(ERROR_CODE_NOT_FOUND)
          .send({ message: "Карточка с указанным _id не найдена." });
      }
      return res.status(200).send({ data: card });
    })
    .catch((err) => {
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
