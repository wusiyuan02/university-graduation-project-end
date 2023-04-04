const Idtoid = require("./models/Idtoid");
let ChatContent = require("./models/ChatContent");

const handleSocket = (socket) => {
  const socketId = socket.id

  socket.on("login", async ({ username }) => {
    if ((await Idtoid.find({ username })).length > 0) {
      await Idtoid.findOneAndUpdate({ username }, { socketid: socketId })
      return
    }
    new Idtoid({ username, socketid: socketId }).save()
  })

  // 存储用户的个人id
  socket.on("sendMessage", ({ sendUsername, receiverUsername, content, sendTime }, cb) => {
    const cc = new ChatContent({ sendUsername, receiverUsername, content, sendTime })
    cc.save().then(async (res) => {
      cb(res)
      const data = await Idtoid.find({ username: receiverUsername })
      if (data.length > 0) {
        socket.to(data[0].socketid).emit('receiveMessage', res)
      }
    })
  });

  socket.on("readMessage", ({ sendUsername, receiverUsername }) => {
    ChatContent.where({ sendUsername, receiverUsername }).update({ isRead: true }, () => { })
  });
  return socket
}

module.exports = handleSocket