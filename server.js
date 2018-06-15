var app = require('express')();
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);
const port = 5000;
var serverStatus = [];
var userName = new Array();

server.listen(port, () => console.log(`server started on port ${port}`));

io.on('connection', (socket) => {

  userName[socket.id] = socket.id;

  console.log(userName[socket.id] + "입장")

  io.to(socket.id).emit('userName',userName[socket.id]);
  io.to(socket.id).emit('serverStatus',serverStatus);

  socket.on('setUserName',(data) =>{ // 유저 이름 설정
    
       if(Object.values(userName).indexOf(data) == -1){ // 이름 중복 체크

        userName[socket.id] = data;
        io.to(socket.id).emit('userName',userName[socket.id]);

       }else{

        io.to(socket.id).emit('setUserNameFalse',data);

       }
  })

  socket.on('createRoom',(data) =>{ // data == roomName 방 만들기
      serverStatus.push({
        roomName : data,
        members : []
      })
      enterRoom(data);
      console.log(serverStatus);
  })
  socket.on('enterRoom',(data) =>{ // data == roomName 방 들어가기
    enterRoom(data);
    console.log(serverStatus);
  })
  socket.on('exitRoom',(data) => {
    exitRoom(data);
    console.log(serverStatus);
  })

  socket.on('disconnect',() => { // 유저 퇴장시
    console.log(socket.id + "퇴장"); 
  })

  socket.on('SEND_DRAW',(data) => { // 그림 그리기
    io.to(data.externalPos.room).emit('RECEIVE_DRAW',data);
  })

  function enterRoom(roomName){ // 방 들어가기 함수
    socket.join(roomName);
    serverStatus.forEach(element => { // serverStatus 의 members 안에 소켓아이디에 맞는 값 넣기
      if(element.roomName == roomName){
        element.members.push(userName[socket.id]);
      }
    });
    io.emit('serverStatus',serverStatus);
  }


  function exitRoom(roomName){ // 방 나가기 함수
    serverStatus.forEach(serverEl =>{
      if(serverEl.roomName == roomName){
        serverEl.members.splice(serverEl.members.indexOf(userName[socket.id]),1)
      }
    })
    deleteRoom(roomName);
    socket.leave(roomName);
    io.emit('serverStatus',serverStatus);
  }

  function deleteRoom(roomName){
    serverStatus.forEach(serverEl =>{
      if(serverEl.roomName == roomName){
        if(serverEl.members.length == 0){
          serverStatus.splice(serverEl,1);
        }
      }
    })
  }

});