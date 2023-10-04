const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/user");
const cardsRouter = require("./routes/card");
const { createUser } = require("./controllers/user"); // ????????? правильно достал?
const { login } = require("./controllers/user"); // ????????? правильно достал?
const auth = require("./middlewares/auth"); // ????????? правильно достал?

const { errors, celebrate, Joi } = require("celebrate");

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
    console.log("База данных подключена");
  })
  .catch(new Error("Ошибка подключения базы данных"));

// роуты, не требующие авторизации, например, регистрация и логин
app.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string()
        .required()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    }),
  }),
  login
);

app.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string()
        .required()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    }),
  }),
  createUser
);

// модлвэр авторизации
app.use(auth);

// применяем импортированный для юзеров route
app.use(usersRouter);

// применяем импортированный для карточек route
app.use(cardsRouter);

// обработчик ошибок celebrate
app.use(errors());

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
  // Если всё работает, консоль покажет, какой порт слушает приложение
  console.log(`Приложение слушает порт ${PORT}`);
});
