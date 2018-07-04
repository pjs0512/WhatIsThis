import React from 'react';
import io from "socket.io-client";
import { findDOMNode } from 'react-dom'
import {Link} from "react-router-dom";
import { EventEmitter } from 'events';
import PropTypes from 'prop-types';
import './play.css';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide'
import { TextField, DialogTitle, DialogContent } from '@material-ui/core';
import beforeunload from 'react-beforeunload';
import Beforeunload from 'react-beforeunload';
import { ServerResponse } from 'http';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { SketchPicker } from 'react-color'
import {ToastContainer,toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'





function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class Play extends React.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:5000/');
        this.state = {
            open : false,
            drawable : false,
            dram : false,
            word : null,
            drawableUser : [],
            gameState : [],
            messages : [],
            memberLength : 0,
            room : null,
            name : null,
            lineWidth : 1,
            serverStatus : [],
            color : '#000000'
        }
        this.socket.on('resetMessages',(data) =>{
            this.setState({messages : []});
        })
        this.socket.on('setUserNameFalse',(data) =>{
            alert(data + "는 이미 있는 이름 입니다.");
        })
        this.socket.on('userName',(data) =>{
            this.setState({name : data});
        })
        this.socket.on('serverStatus',(data) =>{
            this.setState({serverStatus : data});
        })
        this.socket.on('drawableUser',(data) => {
            this.setState({drawableUser : data});
        })
        this.socket.on('gameState', (data) =>{
            this.setState({gameState : data});
        })
        this.socket.on('clearCanvas',(data) =>{
            this.clearCanvas();
        })
        this.socket.on('word', (data) =>{
            this.setState({word : data});
        })
        this.socket.on('messages',(data) =>{
            this.notify(data.message);
            this.setState({messages : [...this.state.messages,data]})

        })
        const addDraw = data =>{ // 그리는 함수
            if(this.state.dram){
                this.ctx.beginPath();
                this.ctx.strokeStyle=data.externalPos.color;
                this.ctx.lineWidth = data.externalPos.lineWidth;
                this.ctx.stroke();
                this.state.dram = false;
            }        
            if(data.externalPos.x === -1 && data.externalPos.y === -1){
                this.ctx.closePath();
                this.state.dram = true;
            }else{
                this.ctx.strokeStyle=data.externalPos.color;
                this.ctx.lineWidth = data.externalPos.lineWidth;
                this.ctx.lineTo(data.externalPos.x-this.canvas.offsetLeft, data.externalPos.y-this.canvas.offsetTop);
                // 펜 스타일 정하기
                this.ctx.stroke();
            }
        }
        this.clearCanvas = ev =>{
            this.ctx.closePath();
            this.state.dram = true;
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        }
        this.onMouseDown = ev =>{
            this.socket.emit('SEND_DRAW',{
            externalPos : {
                socket_id : this.socket.id,
                room : this.state.room,
                color : this.state.color,
                lineWidth : this.state.lineWidth,
                x : ev.pageX,
                y : ev.pageY
            }
            });
            this.state.drawable = true;
        }

        this.onMouseMove = ev =>{
            this.socket.emit('SEND_TRACKERXY',{
                trakerPos :{
                    socket_id : this.socket.id,
                    room : this.state.room,
                    color : this.state.color,
                    lineWidth : this.state.lineWidth,
                    x : ev.pageX,
                    y : ev.pageY
                }
            });

            if(this.state.drawable){
                this.socket.emit('SEND_DRAW',{
                    externalPos :{
                        socket_id : this.socket.id,
                        room : this.state.room,
                        color : this.state.color,
                        lineWidth : this.state.lineWidth,
                        x : ev.pageX,
                        y : ev.pageY
                    }
                });

            }
        }
        this.onMouseUp = ev =>{
            this.state.drawable = false;
            this.socket.emit('SEND_DRAW',{
                    externalPos :{
                        socket_id : this.socket.id,
                        room : this.state.room,
                        color : this.state.color,
                        lineWidth : this.state.lineWidth,
                        x : -1,
                        y : -1
                    }
            });
        }
        this.enterRoom = (data) =>{
            this.setState({open : true});
            this.setState({room : data});
            this.socket.emit('enterRoom',data);
        }
        this.exitRoom = (data) =>{
            this.setState({open : false});
            this.setState({room : null});
            this.setState({drawableUser : false});
            this.setState({memberLength : 0});
            this.socket.emit('exitRoom',data);
        }
        this.enteredDialog = () =>{ // 방 안에서
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext("2d");
            this.rect = this.canvas.getBoundingClientRect();
            this.socket.on('RECEIVE_DRAW',function(data){ // 그림이 그려 지는 것
                addDraw(data);
            });
        }
        this.exitDialog = () =>{ // 방 밖에서 
            delete(this.canvas);
            delete(this.ctx);
            delete(this.rect);
            this.socket.on('RECEIVE_DRAW',function(data){ // 그림이 그려 지는 것
            });
        }
        this.setUserName = ()=>{
            let setName = prompt('이름을 설정하세요!');
            if(setName != null){
                this.socket.emit('setUserName',setName);
            }
        }
        this.createRoom = () =>{
            let roomName = prompt('방이름을 입력하세요!');
            if(roomName != null){
                this.socket.emit('createRoom',roomName);
                this.setState({open : true});
                this.setState({room : roomName});
            }     
        }
        this.gameStart = (data) =>{
            this.socket.emit('gameStart',data);
        }
        this.keyPressHandle = ev =>{
            if(ev.key =='Enter'){
                let data = document.getElementById('text').value;
                document.getElementById('text').value = "";
                let toServer = {
                    roomName : this.state.room,
                    word : data
                }
                this.socket.emit('roomWordData',toServer);
            }
        }
        this.handleTooltipClose = () => {
            this.setState({ buttonopen: false });
          };
        
        this.handleTooltipOpen = () => {
            this.setState({ buttonopen: true });
          };
        this.getColor = (color) =>{
            this.setState({color : color.hex});
        }
        this.lineWidthGet = (value) =>{
            this.setState({lineWidth  : value});
        }
        this.clearCanvasAll = () =>{
            this.socket.emit('clearCanvas',this.state.room);
        }
        this.notify = (data) =>{
            toast(data);
        }
        
    }
    componentWillMount(){
    }
    componentDidMount(){  
    }
    componentWillUnmount(){
        this.exitRoom(this.state.room);
        
        this.socket.destroy();
    }
    componentDidUpdate(){
    
    }
    
    render(){
        const spanStyle = {
            color : "red"
        }
        const floatLeft = {
            float : "left"
        }
        const floatRight ={
            float : "right"
        }
        return (
            <div>
                <Beforeunload onBeforeunload={() => this.exitRoom(this.state.room)}/>
                현재 이름 : {this.state.name}
                <br/>
                <Button variant="contained" color="primary" onClick={this.setUserName}>이름변경</Button>
                <br/>
                <Button variant="contained" color="primary" onClick={this.createRoom}>방만들기</Button> 
                <h1>방 목록</h1>
                <ul>
                    {this.state.serverStatus.map(
                        (el) =>{
                            return(<li onClick={()=>this.enterRoom(el.roomName)}>
                            방이름 : {el.roomName} 
                            유저({el.members.length}) : {el.members.map((mem) => {
                                return ( <span>{mem},</span>);
                            })}
                            게임 상태 : {this.state.gameState[el.roomName]? <span>게임진행중 : 그리는 멤버 : {this.state.drawableUser[el.roomName]}</span> : <span>대기중</span>}
                            </li>)
                        })
                    }                 
                </ul>
                <Dialog
                    fullScreen
                    open={this.state.open}
                    onClose={this.handleClose}
                    onEntered ={this.enteredDialog}
                    onExit = {this.exitDialog}
                    TransitionComponent={Transition}
                >
                <div className="gameGrid">

                    <div>
                        게임상태 : {this.state.gameState[this.state.room]? <span>게임 진행중</span> : <span>대기중</span>}
                     </div>

                    <div>
                        <div>
                            방 이름 : {this.state.room}({this.state.serverStatus.map(x =>{if(x.roomName == this.state.room) return x.members.length})})
                        </div>

                        <div>
                            시간
                        </div>
                    </div>
                    <div>제시어 : {this.state.word}</div>
                    <div className="messages">
                        <h2>Chat Messages</h2>
                        <div>
                            {this.state.messages.map((el) =>{
                                    return (<div class="container">
                                    <span class="right">{el.userName}</span>
                                    <p>{el.message}</p>
                                    </div>)

                            })} 
                        </div>
                    </div>

                    <div>
                        <div>
                            {this.state.serverStatus.map(
                            (el) => {
                                if(el.roomName == this.state.room){
                                    return(
                                        <span>
                                        {el.members.map((mem) => {
                                            if(mem == this.state.drawableUser[this.state.room]){
                                                return (<span style={spanStyle}>{mem},</span>)
                                            }else{
                                                return (<span>{mem},</span>)
                                            }
                                        })}
                                            </span>
                                        )
                                    }
                            })}
                        </div>
                        <div>
                            <canvas id="canvas" 
                            onMouseDown ={this.onMouseDown} 
                            onMouseMove ={this.onMouseMove} 
                            onMouseUp ={this.onMouseUp} 
                            onMouseOut ={this.onMouseOut}
                            width ={800}
                            height = {400}
                            style={floatLeft}
                            >
                            </canvas>
                        </div>
                    </div>

                    <div>                
                        <SketchPicker 
                        color={ this.state.color }
                        onChangeComplete = {this.getColor}                
                        />

                        <input type="range"
                        min="1" max="10" 
                        value={this.state.lineWidth}
                        id="myRange"
                        onInput = {() => this.lineWidthGet(document.getElementById('myRange').value)}/>
                        두께 : <span>{this.state.lineWidth}</span><br/>
                                
                        <Button variant="contained" color="primary" onClick={this.clearCanvasAll}>전부지우기</Button>
                    </div>
                    <div>빈칸</div>
                    <div>
                        <TextField id ="text" type="text" placeholder="답을 입력하세요!" onKeyPress={this.keyPressHandle}/>
                        <Button variant="contained" color="primary" onClick={() => this.exitRoom(this.state.room)}>
                            나가기
                        </Button>
                    </div>
                    <div> 
                        {this.state.serverStatus.map((el) => {
                        if(el.roomName == this.state.room){
                            if(!this.state.gameState[this.state.room]){
                                if(el.members.length >=2){
                                    return (<Button variant="contained" color="primary" onClick={() =>this.gameStart(this.state.room)}>게임 시작</Button>);
                                }else{
                                    return (<Button color="default">2명이 모이면 활성화 됩니다.</Button>);
                                }

                            }
                            }
                        })}
                    </div>
                </div>
                    <ToastContainer 
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    rtl={false}
                    pauseOnVisibilityChange
                    draggable
                    />
                </Dialog>   
            </div>
        )             
    }
}


export default Play;