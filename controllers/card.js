// GET /cards — возвращает все карточки
// POST /cards — создаёт карточку
// DELETE /cards/:cardId — удаляет карточку по идентификатору

//запрашиваем модель card и присваеваем её константе Card
const Card = require("../models/card");

const getCards = (req, res) => {
  Card.find({})
    // вернём все карточки
    .then((cards) => {
      return res.status(200).send({ data: cards });
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
      console.log("Ошибка сервера:", err);
      return res.status(500).send({ message: "Произошла ошибка сервера" });
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
      console.log("Ошибка:", err);
      return res.status(400).send({ message: err.message });
    });
};

const deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId, { useFindAndModify: false} )
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: "Карточка не найдена" });
      }
      return res.send({ data: card });
    })
    //!!! TODO переделать обработчик ошибок на разные варианты
    .catch((err) => {
      return res.status(500).send({ message: "Произошла ошибка" });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
};