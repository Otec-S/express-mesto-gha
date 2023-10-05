const mongoose = require("mongoose");
const validator = require("validator");

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Поле 'name' должно быть заполнено"],
      minlength: 2,
      maxlength: 30,
    },
    link: {
      type: String,
      required: [true, "Поле 'link' должно быть заполнено"],
      validate: {
        validator: (v) => validator.isURL(v),
        message: "Некорректный URL",
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: undefined,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("card", cardSchema);
