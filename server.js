var app = require('express')();
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);
const port = 5000;


server.listen(port, () => console.log(`server started on port ${port}`));

io.on('connection', (socket) => {

  console.log(socket.id);
  socket.on('SEND_TRACKERXY',function(data){ // 마우스 위치 트래커
    socket.broadcast.emit('RECEIVE_TRACKERXY',data);
  })

  socket.on('SEND_DRAW', function(data){ // 좌표값 받고 그려주기
    console.log(socket.id);
      console.log(data);
      io.emit('RECEIVE_DRAW',data);
  })


  socket.on('SEND_MESSAGES', function(data){ // 채팅 메세지 보내기
    console.log(socket.id);
      console.log(data);
      io.emit('RECEIVE_MESSAGES',data);
  })


});