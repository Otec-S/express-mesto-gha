const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Жак-Ив Кусто",
      minlength: 2,
      maxlength: 30,
    },
    about: {
      type: String,
      default: "Исследователь",
      minlength: 2,
      maxlength: 30,
    },

    avatar: {
      type: String,
      default:
        "https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png",
      validate: {
        validator: (v) =>
          /^((https?):\/\/(www.)?([A-Z0-9]-)*)([A-Z0-9]+)(\w\.)*/i.test(v),
        message: "Некорректный URL",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Некорректный email",
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("user", userSchema);
