const router = require("express").Router();
const {
  getUsers,
  findUserById,
  findCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  wrongUrl,
} = require("../controllers/user");

router.get("/users", getUsers);

// router.post("/users", createUser);

router.get("/users/me", findCurrentUser);

router.patch("/users/me", updateUserProfile);

router.patch("/users/me/avatar", updateUserAvatar);

router.get("/users/:id", findUserById);

router.patch("/*", wrongUrl);

module.exports = router;
