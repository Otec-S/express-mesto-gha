const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/user");
const cardsRouter = require("./routes/card");
const { createUser } = require("./controllers/user"); // ????????? правильно достал?
const { login } = require("./controllers/user"); // ????????? правильно достал?
const auth = require("./middlewares/auth"); // ????????? правильно достал?
const ERROR_CODE_SERVER_ERROR = require("./utils");

const { PORT = 3000 } = process.env;

const app = express();

// научили express работать с json
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
  })
  .catch((err) =>
    err
      .status(ERROR_CODE_SERVER_ERROR)
      .send({ message: "На сервере произошла ошибка" })
  );

// роуты, не требующие авторизации, например, регистрация и логин
app.post("/signin", login);
app.post("/signup", createUser);

// авторизация
app.use(auth);

// применяем импортированный для юзеров route
app.use(usersRouter);

// применяем импортированный для карточек route
app.use(cardsRouter);

// здесь обрабатываем все ошибки
app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    // проверяем статус и выставляем сообщение в зависимости от него
    message: statusCode === 500 ? "На сервере произошла ошибка" : message,
  });
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
