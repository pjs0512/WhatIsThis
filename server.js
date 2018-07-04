var app = require('express')();
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);
var Loader = require('node-file-loader');
const port = 5000;
var serverStatus = [];
var drawableUser = [];
var gameState = [];
var membersPoint = [];
var userName = new Array();
var wordSet = [];
var roomWord = [];
var roomMessages = [];
Loader.load(__dirname + "/dataset.txt").then((file) => {
  wordSet = file.split("\r\n");
}).catch((err) =>{
});
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
      gameState[data] = false;
      drawableUser[data] = null;
      enterRoom(data);
  })
  socket.on('enterRoom',(data) =>{ // data == roomName 방 들어가기
    enterRoom(data);
  })
  socket.on('exitRoom',(data) => { // 방 나가기
    exitRoom(data);
  })
  socket.on('gameStart',(data) =>{ // 게임시작
    gameStart(data,socket.id);
  })

  socket.on('roomWordData',(data) =>{
    io.to(data.roomName).emit('messages',{userName : userName[socket.id],message : data.word});
    if(data.word == roomWord[data.roomName]){  // 정답
      gameStart(data.roomName, socket.id);
    }
  });

  socket.on('disconnect',() => { // 유저 퇴장시
    console.log(socket.id + "퇴장"); 
  })

  socket.on('SEND_DRAW',(data) => { // 그림 그리기
    if(userName[socket.id] == drawableUser[data.externalPos.room]){ // drawableUser여야 그릴 수 있음
      io.to(data.externalPos.room).emit('RECEIVE_DRAW',data);
    }else{

    }
  })
  socket.on('clearCanvas', (data)=>{
    console.log(data);
    if(userName[socket.id] == drawableUser[data]){
      clearCanvas(data);
    }
  })

  function enterRoom(roomName){ // 방 들어가기 함수
    socket.join(roomName);
    serverStatus.forEach(element => { // serverStatus 의 members 안에 소켓아이디에 맞는 값 넣기
      if(element.roomName == roomName){
        element.members.push(userName[socket.id]);
      }
    });
    io.emit('serverStatus',serverStatus);
    io.emit('drawableUser',drawableUser);
    io.emit('gameState',gameState);
  }


  function exitRoom(roomName){ // 방 나가기 함수
    socket.leave(roomName);
    serverStatus.forEach(serverEl =>{    
      if(serverEl.roomName == roomName){
        serverEl.members.splice(serverEl.members.indexOf(userName[socket.id]),1)
      }
    })
    deleteRoom(roomName);
    gameEnd(roomName);
    io.emit('serverStatus',serverStatus);
    io.emit('drawableUser',drawableUser);
    io.emit('gameState', gameState);
  }

  function gameStart(roomName,socketId){
    gameState[roomName] = true;
    let word = getWord();
    roomWord[roomName] = word;
    drawableUser[roomName] = userName[socketId];
    io.to(roomName).emit('word',"");
    io.to(socketId).emit('word',roomWord[roomName]);
    io.emit('drawableUser',drawableUser);
    io.emit('gameState',gameState);
    clearCanvas(roomName);
  }

  function gameEnd(roomName){ // 인원수가 1명일 시 게임 종료
    serverStatus.forEach(serverEl =>{
      if(serverEl.roomName == roomName){
        if(serverEl.members.length == 1){
          clearCanvas(roomName);
          gameState[roomName] = false;
          drawableUser[roomName] = false;
        }
      }
    })
  }
  function deleteRoom(roomName){ // 인원수가 0명일 시 방 삭제
    serverStatus.forEach(serverEl =>{
      if(serverEl.roomName == roomName){
        if(serverEl.members.length == 0){
          serverStatus.splice(serverEl,1);
        }
      }
    })
  }
  function clearCanvas(roomName){
    io.to(roomName).emit('clearCanvas');
    io.to(roomName).emit('resetMessages',"");
  }
  function getWord(){
    return wordSet[Math.floor(Math.random()*wordSet.length)];
  }
});