const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/user");
const cardsRouter = require("./routes/card");
const ERROR_CODE_SERVER_ERROR = require("./utils");

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
  })
  .catch((err) => {
    console.log("Ошибка с подключением базы данных:", err);
    return res
      .status(ERROR_CODE_SERVER_ERROR)
      .send({ message: "На сервере произошла ошибка" });
  });

//захардкодили одного из юзеров, чтобы временно делать его собственником всех карточек
app.use((req, res, next) => {
  req.user = {
    _id: "64fdc6ff8d4ee83c0c3baaae",
  };
  next();
});

//применяем импортированный для юзеров route
app.use(usersRouter);

//применяем импортированный для карточек route
app.use(cardsRouter);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
