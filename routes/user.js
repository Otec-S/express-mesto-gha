const router = require("express").Router();
const { getUsers, findUserById, createUser } = require("../controllers/user");

router.get("/users", getUsers);

router.get("/users/:id", findUserById);

router.post("/users", createUser);

module.exports = router;