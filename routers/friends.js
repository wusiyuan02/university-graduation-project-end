let express = require("express");
const dayjs = require("dayjs");

const User = require("../models/User");
const ChatContent = require("../models/ChatContent");
const FriendsApplication = require("../models/FriendsApplication");

let router = express.Router();

let responseData;

router.use((res, req, next) => {
  responseData = {
    code: 0,
    msg: "",
  };
  next();
});

// 查询好友信息
router.post("/search", async (req, res) => {
  if (!req.session.userInfo) {
    res.json({
      code: 1,
      msg: "用户信息失效，请重新登录",
    });
    return;
  }

  const { username } = req.session.userInfo;
  const { searchKey } = req.body;
  const reg = new RegExp(searchKey, "i");
  User.find({
    username: { $regex: reg },
  }).then((result) => {
    if (!result) {
      res.json({
        code: 1,
        data: [],
        msg: "没找到对应的数据唉~",
      });
      return;
    }
    res.json({
      code: 0,
      data: result.filter((item) => item.username !== username),
      msg: "成功获取！",
    });
    return;
  });
});

// 好友申请
router.post("/addRequest", async (req, res) => {
  if (!req.session.userInfo) {
    res.json({
      code: 1,
      msg: "用户信息失效，请重新登录",
    });
    return;
  }

  const { username } = req.session.userInfo;
  const { otherUsername } = req.body;
  const hasInfo = await FriendsApplication.findOne({
    sender: username,
    receiver: otherUsername,
  });
  if (hasInfo) {
    FriendsApplication.updateOne(
      {
        sender: username,
        receiver: otherUsername,
        requestTime: dayjs().format("YYYY-MM-DD  HH:mm:ss"),
      },
      () => {
        res.json({
          code: 0,
          msg: "发送请求成功！",
        });
      }
    );
  } else {
    const fa = new FriendsApplication({
      sender: username,
      receiver: otherUsername,
      requestTime: dayjs().format("YYYY-MM-DD  HH:mm:ss"),
    });
    fa.save().then(() =>
      res.json({
        code: 0,
        msg: "发送请求成功！",
      })
    );
  }
});

// 获取好友申请列表
router.get("/requestList", async (req, res) => {
  if (!req.session.userInfo) {
    res.json({
      code: 1,
      msg: "用户信息失效，请重新登录",
    });
    return;
  }

  const { username } = req.session.userInfo;
  const data = await FriendsApplication.find({
    receiver: username,
  });
  if (data) {
    res.json({
      data,
      code: 0,
      msg: "发送请求成功！",
    });
  } else {
    res.json({
      code: 1,
      msg: "网络异常，请稍后重试",
    });
  }
});

// 同意好友申请
router.post("/agree", async (req, res) => {
  if (!req.session.userInfo) {
    res.json({
      code: 1,
      msg: "用户信息失效，请重新登录",
    });
    return;
  }

  const { _id } = req.body;
  const data = await FriendsApplication.findOne({
    _id,
  });
  if (data) {
    const { sender, receiver } = data;
    const { friends } = await User.findOne({
      username: sender,
    });
    if (friends.indexOf(receiver) > -1) {
      res.json({
        code: 1,
        msg: "已是好友！",
      });
    } else {
      await Promise.all([
        User.updateOne(
          {
            username: sender,
          },
          { friends: [...friends, receiver] }
        ),
        User.updateOne(
          {
            username: receiver,
          },
          { friends: [...friends, sender] }
        ),
        FriendsApplication.deleteOne({ _id }),
      ]);
      res.json({
        code: 0,
        msg: "同意好友申请成功！",
      });
    }
  } else {
    res.json({
      code: 1,
      msg: "网络异常，请稍后重试",
    });
  }
});
// 拒绝好友申请
router.post("/refuse", async (req, res) => {
  if (!req.session.userInfo) {
    res.json({
      code: 1,
      msg: "用户信息失效，请重新登录",
    });
    return;
  }
  const { _id } = req.body;
  if (_id) {
    await FriendsApplication.deleteOne({ _id });
    res.json({
      code: 0,
      msg: "拒绝好友申请成功！",
    });
  } else {
    res.json({
      code: 1,
      msg: "网络异常，请稍后重试",
    });
  }
});

// 拒绝好友申请
router.post("/list", async (req, res) => {
  if (!req.session.userInfo) {
    res.json({
      code: 1,
      msg: "用户信息失效，请重新登录",
    });
    return;
  }
  const { _id } = req.session.userInfo;

  if (_id) {
    const data = await User.find({ _id });
    if (data) {
      const { friends } = data[0];
      const result = await User.find({ username: { $in: friends } });
      res.json({
        code: 0,
        data: result,
        msg: "请求成功",
      });
    } else {
      res.json({
        code: 1,
        msg: "网络异常，请稍后重试",
      });
    }
  } else {
    res.json({
      code: 1,
      msg: "网络异常，请稍后重试",
    });
  }
});


// 拒绝好友申请
router.get("/allMessage", async (req, res) => {
  if (!req.session.userInfo) {
    res.json({
      code: 1,
      msg: "用户信息失效，请重新登录",
    });
    return;
  }

  const { username } = req.session.userInfo;
  const messageInfos = await ChatContent.find({
    $or: [{ receiverUsername: username }, { sendUsername: username }]
  });

  const data = messageInfos.reduce((pre, nowMessageInfo) => {
    const { receiverUsername, sendUsername } = nowMessageInfo
    const messageKey = receiverUsername === username ? sendUsername : receiverUsername;
    pre[messageKey] = [...(pre[messageKey] || []), nowMessageInfo]
    return pre
  }, [])

  res.json({
    code: 0,
    data,
    msg: "请求成功",
  });
})
module.exports = router;
