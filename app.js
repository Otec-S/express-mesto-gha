const express = require("express");
const mongoose = require("mongoose");
//запрашиваем модель user и присваеваем её константе User
const User = require("./models/user");

const { PORT = 3000 } = process.env;

const app = express();

//научили express работать с json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose
  .connect("mongodb://127.0.0.1:27017/mestodb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB");
  });

//post запрос на получение списка всех юзеров
app.get("/users", (req, res) => {
  User.find({})
    // вернём записанные в базу данные
    .then((users) => res.status(200).send({ data: users }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      console.log("Ошибка сервера:", err);
      res.status(500).send({ message: "Произошла ошибка сервера" });
    });
});

//post запрос на получение юзера по id
app.get("/users/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "Пользователь не найден" });
      }
      res.send({ data: user });
    })
    //!!! TODO переделать обработчик ошибок на разные варианты
    .catch((err) => res.status(500).send({ message: "Произошла ошибка" }));
});

//post запрос на создание нового юзера
app.post("/users", (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    // вернём записанные в базу данные
    .then((user) => res.status(201).send({ data: user }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      console.log("Ошибка:", err);
      res.status(400).send({ message: err.message });
    });
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
