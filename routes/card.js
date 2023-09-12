const router = require("express").Router();
const { getCards, createCard, deleteCardById } = require("../controllers/card");

router.get("/cards", getCards);

router.post("/cards", createCard);

router.delete("/cards/:cardId", deleteCardById);

module.exports = router;
