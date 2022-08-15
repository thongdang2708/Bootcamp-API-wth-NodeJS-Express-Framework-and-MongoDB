
const express = require("express");

const {register, login, getMe, forgetPassword, resetPassword, updateDetails, updatePassword, logOut} = require("../controllers/auth");

const {protect, roleAuthorization} = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(protect, getMe);
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:resettoken").put(resetPassword);
router.route("/updatedetails").put(protect, updateDetails);
router.route("/updatepassword").put(protect, updatePassword);
router.route("/logout").get(logOut);
module.exports = router;