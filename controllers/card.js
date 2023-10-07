const mongoose = require("mongoose");

const BadRequest400Error = require("../errors/bad-request-400-error");
const Forbidden403Error = require("../errors/forbidden-403-error");
const NotFound404Error = require("../errors/not-found-404-error");

// запрашиваем модель card и присваеваем её константе Card
const Card = require("../models/card");

// получаем перечень всех карточек
const getCards = (req, res, next) => {
  Card.find({})
    // вернём все карточки
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(next);
};

// создание новой карточки
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    // вернём записанные в базу данные
    .then((card) => res.status(201).send({ data: card }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new BadRequest400Error(
          "Переданы некорректные данные при создании карточки"
        );
      }
    })
    .catch(next);
};

// удаление карточки
const deleteCardById = (req, res, next) => {
  console.log("req.params.cardId:", req.params.cardId);
  Card.findById(req.params.cardId)
    .orFail(new Error("NotValidId"))
    .then((card) => {
      console.log("req.user._id:", req.user._id);
      console.log("card.owner:", card.owner);

      if (req.user._id === card.owner) {
        res.send({ data: card });
        card.deleteOne();
      } else {
        throw new Forbidden403Error("У вас нет прав на удаление этой карточки");
      }
    })
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFound404Error("Карточка с указанным _id не найдена.");
      }
      if (err instanceof mongoose.Error.CastError) {
        throw new BadRequest400Error(
          "Переданы некорректные данные для удаления карточки"
        );
      }
    })
    .catch(next);
};

// поставить лайк карточке
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .orFail(new Error("NotValidId"))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFound404Error("Карточка с указанным _id не найдена.");
      }
      if (err instanceof mongoose.Error.CastError) {
        throw new BadRequest400Error("Передан несуществующий _id карточки");
      }
    })
    .catch(next);
};

// убрать лайк с карточки
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true }
  )
    .orFail(new Error("NotValidId"))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFound404Error("Карточка с указанным _id не найдена.");
      }
      if (err instanceof mongoose.Error.CastError) {
        throw new BadRequest400Error("Передан несуществующий _id карточки");
      }
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
