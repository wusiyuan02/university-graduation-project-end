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
let Idtoid = require("./models/Idtoid");

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
    } catch (e) {}
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
        console.log(socket.id);
        // io.emit("ok", "123");
        // io.emit("connect");
        // io.on("login", (username) => {
        //   socketHandler.saveUserSocketId(username, socketId);
        // });
        // io.on("comment", (toUserName) => {
        //   Idtoid.findOne({
        //     username: toUserName,
        //   }).then((rs) => {
        //     io.to(rs.socketid).emit("receiveComment");
        //   });
        // });
        // io.on("chat", (data) => {
        //   console.log(data);
        //   Idtoid.findOne({
        //     username: data.to_user,
        //   }).then((rs) => {
        //     io.to(rs.socketid).emit("receiveMsg", {
        //       from_user: data.from_user,
        //       message: data.message,
        //       time: data.time,
        //       avatar: data.avatar,
        //       _id: data._id,
        //     });
        //   });
        // });
      });
      server.listen(3000, () => {
        console.log("socket server running in http://localhost:3000");
      });
    }
  }
);
