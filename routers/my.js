let express = require('express')
let router = express.Router()
let User = require('../models/User')
const Password = require('../models/Password')
const fs = require('fs');
const multipart = require('connect-multiparty')

const multipartMiddleware = multipart()
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
  if (!req.session.userInfo) {
    res.json({
      code: 1,
      msg: '没找到对应的数据唉~'
    });
    return;
  }
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
router.post('/update', async (req, res) => {
  if (req.session.userInfo) {
    const { _id } = req.session.userInfo
    const result = await User.findOneAndUpdate({ _id }, {
      ...req.body
    })
  }
  res.json({
    code: 0,
    msg: '修改成功！'
  });
})

// 修改密码
router.post('/pswupdate', async (req, res) => {
  const { username, oldPassWord, newPassword, newRePassword } = req.body;
  if (newPassword !== newRePassword) {
    res.json({ code: 1, msg: '两次输入的密码不一致哦' })
    return;
  }
  const pswInfo = await Password.findOne({ username })
  if (pswInfo.Password !== oldPassWord) {
    res.json({ code: 1, msg: '旧密码输入错误！' })
    return;
  }
  await Password.updateOne({ username }, {
    password: newPassword
  })
  res.json({
    code: 0,
    msg: '修改成功！'
  });
})

// 更换头像
router.post('/avatarUpdate', multipartMiddleware, async (req, res) => {
  if (req.files.file) {
    const { path, name } = req.files.file
    fs.readFile(path, 'binary', function (err, file) {
      if (err) {
        console.log(1)
        res.json({
          code: 1,
          msg: '图片上传失败！'
        })
        return;
      } else {
        const filename = new Date().getTime().toString() + name
        fs.writeFile('public/img/' + filename, file, 'binary', (err) => {
          if (err) {
            res.json({
              code: 1,
              msg: '图片写入失败'
            })
            return;
          }
          const avatarUrl = 'http://localhost:8088/public/img/' + filename
          if (req.session.userInfo) {
            const { _id } = req.session.userInfo
            User.findByIdAndUpdate({ _id }, {
              avatar: avatarUrl
            }).then(() => {
              res.json({
                code: 0,
                data: avatarUrl,
                msg: '保存成功'
              });
            })
          } else {
            res.json({
              code: 1,
              msg: '用户信息失效，请重新登录'
            });
          }
          return;
        })
      }
    });
  }
});

module.exports = router;