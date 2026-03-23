var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let { checkLogin, checkRole } = require('../utils/authHandler.js.js')

// MODERATOR được quyền Read All danh sách user
router.get("/", checkLogin, checkRole("MODERATOR"), async function (req, res) {
  let users = await require('../schemas/users').find({ isDeleted: false }).populate('role');
  res.send(users);
});

// API đổi mật khẩu (chỉ cần đăng nhập)
router.post("/change-password", checkLogin, async function (req, res) {
  const { oldPassword, newPassword } = req.body;
  const result = await userController.ChangePassword(req.userId, oldPassword, newPassword);
  
  if (result.success) res.send(result);
  else res.status(400).send(result);
});

// Các quyền quản trị khác: Chỉ ADMIN
router.post("/", checkLogin, checkRole("ADMIN"), async function (req, res) { /* Logic tạo user */ });
router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res) { /* Logic xóa user */ });

module.exports = router;