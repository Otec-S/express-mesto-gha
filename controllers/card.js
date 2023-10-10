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
        next(
          new BadRequest400Error(
            "Переданы некорректные данные при создании карточки"
          )
        );
        return;
      }
      next(err);
    });
};

// удаление карточки
const deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new NotFound404Error("Карточка с указанным _id не найдена."))
    .then((card) => {
      if (card.owner.equals(req.user._id)) {
        return card.deleteOne().then(() => res.send({ data: card }));
      }

      throw new Forbidden403Error("У вас нет прав на удаление этой карточки");
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(
          new BadRequest400Error(
            "Переданы невалидные данные для удаления карточки"
          )
        );
        return;
      }
      next(err);
    });
};

// поставить лайк карточке
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .orFail(new NotFound404Error("Карточка с указанным _id не найдена."))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequest400Error("Передан невалидный _id карточки"));
        return;
      }
      next(err);
    });
};

// убрать лайк с карточки
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true }
  )
    .orFail(new NotFound404Error("Карточка с указанным _id не найдена."))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequest400Error("Передан невалидный _id карточки"));
        return;
      }
      next(err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
