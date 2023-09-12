//запрашиваем модель user и присваеваем её константе User
const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    // вернём записанные в базу данные
    .then((users) => {
      return res.status(200).send({ data: users });
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
      console.log("Ошибка сервера:", err);
      return res.status(500).send({ message: "Произошла ошибка сервера" });
    });
};

const findUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "Пользователь не найден" });
      }
      return res.send({ data: user });
    })
    //!!! TODO переделать обработчик ошибок на разные варианты
    .catch((err) => {
      return res.status(500).send({ message: "Произошла ошибка" });
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
      console.log("Ошибка:", err);
      return res.status(400).send({ message: err.message });
    });
};

module.exports = {
  getUsers,
  findUserById,
  createUser,
};
