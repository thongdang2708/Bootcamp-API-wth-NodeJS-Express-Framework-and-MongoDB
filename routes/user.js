

const express = require("express");

const {getAllUsers, getSingleUser, addUser, updateUser, deleteUser} = require("../controllers/user");
const {protect, roleAuthorization} = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.use(roleAuthorization("admin"));

router.route("/").get(getAllUsers).post(addUser);
router.route("/:id").get(getSingleUser).put(updateUser).delete(deleteUser);

module.exports = router;