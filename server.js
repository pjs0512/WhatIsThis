var app = require('express')();
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);
var Loader = require('node-file-loader');
const port = 5000;

var serverStatus = new Object();
var userName = new Object();

var wordSet = [];
var roomMessages = [];
var mainMembers = [];
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

Loader.load(__dirname + "/dataset.txt").then((file) => {
  wordSet = file.split("\r\n");
}).catch((err) =>{
});

server.listen(port, () => console.log(`server started on port ${port}`));

setInterval(mainMembersToServerStatus,500);
function mainMembersToServerStatus(){
  for(let i =0; i<mainMembers.length; i++){
    io.to(mainMembers[i]).emit('serverStatus',serverStatus);
  }
}

io.on('connection', (socket) => {

  let randomName = makeid();
  mainMembers.push(socket.id);
  while(1){ // random id generate
    let randomName = makeid();
    if(Object.values(userName).indexOf(randomName) == -1){
      userName[socket.id] = randomName;
      break;
    }
  }
  console.log(userName[socket.id] + "입장")

  io.to(socket.id).emit('userName',userName[socket.id]);
  io.to(socket.id).emit('serverStatus',serverStatus);

  socket.on('getServerStatus',(data) => {
    io.to(socket.id).emit('serverStatus',serverStatus);
  })

  socket.on('setUserName',(data) =>{ // 유저 이름 설정

       if(Object.values(userName).indexOf(data) == -1){ // 이름 중복 체크
        userName[socket.id] = data;
        io.to(socket.id).emit('userName',userName[socket.id]);
       }else{
        io.to(socket.id).emit('setUserNameFalse',data);
       }
       
  })
  socket.on('createRoom',(data) =>{ // data == roomName 방 만들기
      serverStatus[data] =  {
        roomName : data,
        gameState : false,
        members : [],
        drawableUser : "",
        word : "",
        dataURL : "",
      }
      enterRoom(data);
  })
  socket.on('snapShot',(data) =>{
    serverStatus[data.roomName].dataURL = data.dataURL;
  })
  socket.on('enterRoom',(data) =>{ // data == roomName 방 들어가기
    enterRoom(data);
  })
  socket.on('exitRoom',(data) => { // 방 나가기
    exitRoom(data);
  })
  socket.on('gameStart',(data) =>{ // 게임시작
    gameStart(data , socket.id);
  })

  socket.on('roomWordData',(data) =>{
    let reData = {
      userName : userName[socket.id],
      message : data.word
    }
    io.to(data.roomName).emit('messages',reData);
  });

  socket.on('disconnect',() => { // 유저 퇴장시
    mainMembers.splice(mainMembers.indexOf(socket.id),1);
    console.log(socket.id + "퇴장"); 
  })

  socket.on('SEND_DRAW',(data) => { // 그림 그리기
    if(userName[socket.id] == serverStatus[data.externalPos.room].drawableUser){ // drawableUser여야 그릴 수 있음
      io.to(data.externalPos.room).emit('RECEIVE_DRAW',data);
    }else{

    }
  })
  socket.on('clearCanvas', (data)=>{ // 캔버스 지우는 소켓
    console.log(data);
    if(userName[socket.id] == serverStatus[data.externalPos.room].drawableUser){
      clearCanvas(data);
    }
  })

  function enterRoom(roomName){ // 방 들어가기 함수
    if(Object.keys(serverStatus).indexOf(roomName) == -1){
      io.to(socket.id).emit('enterRoomFalse','')
    }else{
      mainMembers.splice(mainMembers.indexOf(socket.id),1);
      socket.join(roomName);
      serverStatus[roomName].members.push(userName[socket.id]);
      io.to(socket.id).emit('enterRoomSuccess',roomName);
      io.to(roomName).emit('roomStatus',serverStatus[roomName]);
    }
  }


  function exitRoom(roomName){ // 방 나가기 함수
    if(Object.keys(serverStatus).indexOf(roomName) == -1){

    }else{
        mainMembers.push(socket.id);
        socket.leave(roomName);
        serverStatus[roomName].members.splice(serverStatus[roomName].members.indexOf(userName[socket.id]),1);
        gameEnd(roomName);
        deleteRoom(roomName);
        io.to(roomName).emit('roomStatus',serverStatus[roomName]);
    }
  }

  function gameStart(roomName, socketId){ // 게임시작
    serverStatus[roomName].gameState = true;
    let word = getWord();
    serverStatus[roomName].word = word;
    serverStatus[roomName].drawableUser = userName[socketId];
    clearCanvas(roomName);
    io.to(roomName).emit('roomStatus',serverStatus[roomName]);
  }

  function gameEnd(roomName){ // 인원수가 1명일 시 게임 종료
    if(serverStatus[roomName].members.length == 1){
      serverStatus[roomName].gameState = false;
      serverStatus[roomName].drawableUser = "";
      clearCanvas(roomName);
      io.to(roomName).emit('roomStatus',serverStatus[roomName]);
    }
  }
  function deleteRoom(roomName){ // 인원수가 0명일 시 방 삭제
    if(serverStatus[roomName].members.length == 0){
      delete(serverStatus[roomName]);
    }
  }
  function clearCanvas(roomName){ //캔버스 지우기
    io.to(roomName).emit('clearCanvas');
    io.to(roomName).emit('resetMessages',"");
  }
  function getWord(){
    return wordSet[Math.floor(Math.random()*wordSet.length)];
  }

});
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}