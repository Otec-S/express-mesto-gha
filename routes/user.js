const router = require("express").Router();
const {
  getUsers,
  findUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
} = require("../controllers/user");

router.get("/users", getUsers);

router.post("/users", createUser);

router.patch("/users/me", updateUserProfile);

router.patch("/users/me/avatar", updateUserAvatar);

router.get("/users/:id", findUserById);

module.exports = router;
