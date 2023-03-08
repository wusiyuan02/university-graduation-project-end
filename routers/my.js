let express = require('express')
let router = express.Router()
let User = require('../models/User')

let responseData

router.use((res, req, next) => {
  responseData = {
    code: 0,
    msg: '',
  }
  next()
})

// 获取个人信息
router.get('/detail', async (req, res) => {
  const { _id } = req.session.userInfo
  User.findOne({
    _id
  }).then((result) => {
    if (!result) {
      res.json({
        code: 1,
        msg: '没找到对应的数据唉~'
      })
      return
    }
    res.json({
      code: 0,
      data: result,
      msg: '成功获取！'
    });
    return;
  })
})

// 修改个人信息
router.post('/edit', async (req, res) => {
  User.update({
    ...req.body
  }).then(() => {
    res.json({
      code: 0,
      msg: '修改成功！'
    });
    return 0;
  })
})

module.exports = router;