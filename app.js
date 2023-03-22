//第三方插件
let express = require("express");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");
// let path = require("path");
let session = require("express-session");
const http = require("http");
let socketio = require("socket.io");
let socketHandler = require("./socket"); //socket要实现的具体逻
// const cors = require("cors");
let User = require("./models/User");
let ChatContent = require("./models/ChatContent");

const webConfig = require("./web.config");
let app = express();

app.use(bodyParser.json({ limit: "50mb" })); //限制文件大小
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: "secret", // 对session id 相关的cookie 进行签名
    resave: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 设置 session 的有效时间，单位毫秒
    },
  })
);

app.use("/public", express.static(__dirname + "/public")); //设置静态资源

//设置登录用户的session
app.use((req, res, next) => {
  if (req.session.userInfo) {
    try {
      req.userInfo = req.session.userInfo;
      User.findOne({
        _id: req.userInfo._id,
      }).then((userInfo) => {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
        req.userInfo.username = userInfo.username;
        req.userInfo.avatar = userInfo.avatar;
        req.userInfo.signature = userInfo.signature;
        next();
      });
    } catch (e) { }
  } else {
    next();
  }
});

//划分模块
app.use("/chat", require("./routers/chat"));
app.use("/comment", require("./routers/comment"));
app.use("/my", require("./routers/my"));
app.use("/friends", require("./routers/friends"));
app.use("/pyq", require("./routers/pyq"));
app.use("/search", require("./routers/search"));
app.use("/", require("./routers/main"));
app.listen(3001, () => {
  console.log("server running in http://localhost:3001");
});

mongoose.connect(
  `mongodb://${webConfig.ip}:${webConfig.ip}/${webConfig.databaseName}`,
  { useNewUrlParser: true },
  (err) => {
    if (err) {
      console.log("数据库连接失败。");
    } else {
      console.log("数据库连接成功！");
      const server = http.Server(app);
      const io = socketio(server);
      io.on("connection", (socket) => {
        socket.on("sendMessage", ({ sendUsername, receiverUsername, content, sendTime }, cb) => {
          const cc = new ChatContent({ sendUsername, receiverUsername, content, sendTime })
          cc.save().then((res) => {
            cb(res)
            socket.broadcast.emit('receiveMessage', res)
          })
        });

        socket.on("changeMessageStatus", ({ _id, ...params }, cb) => {
          ChatContent.findOneAndUpdate(
            { _id },
            {
              ...params,
            }).then(() => {
              cb({ code: 0 })
            })
        });
      });
      server.listen(3000, () => {
        console.log("socket server running in http://localhost:3000");
      });
    }
  }
);
