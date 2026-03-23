var express = require('express');
let slugify = require('slugify')
var router = express.Router();
let modelProduct = require('../schemas/products')
let { checkLogin, checkRole } = require('../utils/authHandler.js.js')

// 1. GET: Tất cả user - không cần đăng nhập
router.get('/', async function (req, res) {
  let data = await modelProduct.find({ isDeleted: false });
  res.send(data);
});

router.get('/:id', async function (req, res) {
  try {
    let result = await modelProduct.findById(req.params.id)
    if (result && (!result.isDeleted)) res.send(result)
    else res.status(404).send({ message: "ID not found" })
  } catch (error) {
    res.status(404).send({ message: "ID not found" })
  }
})

// 2. CREATE & UPDATE: Chấp nhận MODERATOR và ADMIN
router.post('/', checkLogin, checkRole('MODERATOR'), async function (req, res) {
  let newObj = new modelProduct({
    ...req.body,
    slug: slugify(req.body.title, { replacement: '-', locale: 'vi', trim: true })
  })
  await newObj.save();
  res.send(newObj)
})

router.put('/:id', checkLogin, checkRole('MODERATOR'), async function (req, res) {
  try {
    let result = await modelProduct.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.send(result);
  } catch (error) {
    res.status(404).send({ message: "Update failed" })
  }
})

// 3. DELETE: Chỉ ADMIN
router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res) {
  try {
    let result = await modelProduct.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true })
    res.send({ message: "Deleted successfully", result });
  } catch (error) {
    res.status(404).send({ message: "Delete failed" })
  }
})

module.exports = router;