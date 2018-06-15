import React from 'react';
import io from "socket.io-client";
import { findDOMNode } from 'react-dom'
import {Link} from "react-router-dom";
import { EventEmitter } from 'events';
import './play.css';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide'
import { TextField } from '@material-ui/core';
import beforeunload from 'react-beforeunload';
import Beforeunload from 'react-beforeunload';
import { ServerResponse } from 'http';


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
            room : null,
            name : null,
            serverStatus : [],
            externalPos :{
                socket_id : this.socket.id,
                room : null,
                x : -1,
                y : -1
            }
        }
        this.socket.on('setUserNameFalse',(data) =>{
            alert(data + "는 이미 있는 이름 입니다.");
        })
        this.socket.on('userName',(data) =>{
            this.setState({name : data});
        })
        this.socket.on('serverStatus',(data) =>{
            this.setState({serverStatus : data});
        })
        const addDraw = data =>{ // 그리는 함수
            if(this.state.dram){
                this.ctx.beginPath();
                this.ctx.fillRect(data.externalPos.x-this.canvas.offsetLeft, data.externalPos.y-this.canvas.offsetTop,2,2);
                this.ctx.stroke();
                this.state.dram = false;
            }        
            if(data.externalPos.x === -1 && data.externalPos.y === -1){
                this.ctx.closePath();
                this.state.dram = true;
            }else{
                this.ctx.lineTo(data.externalPos.x-this.canvas.offsetLeft, data.externalPos.y-this.canvas.offsetTop);
                // 펜 스타일 정하기
                this.ctx.stroke();
            }
        }
        this.onMouseDown = ev =>{
            this.socket.emit('SEND_DRAW',{
            externalPos : {
                socket_id : this.socket.id,
                room : this.state.room,
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
                    x : ev.pageX,
                    y : ev.pageY
                }
            });

            if(this.state.drawable){
                this.socket.emit('SEND_DRAW',{
                    externalPos :{
                        socket_id : this.socket.id,
                        room : this.state.room,
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
            this.socket.emit('exitRoom',data);
        }
        this.enteredDialog = () =>{ // 방 안에서
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext("2d");
            this.rect = this.canvas.getBoundingClientRect();
            this.socket.on('RECEIVE_DRAW',function(data){ // 그림이 그려 지는 것
                console.log(data);
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
    }
    componentWillMount(){
    }
    componentDidMount(){     
    }
    componentWillUnmount(){
        this.exitRoom(this.state.room);
        this.socket.destroy();
    }
    render(){
        return (
            <div>
                <Beforeunload onBeforeunload={() => this.exitRoom(this.state.room)}/>
                현재 이름 : {this.state.name}
                <br/>
                <Button variant="contained" color="primary" onClick={this.enterRoom}>다이어</Button>
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
                방 이름 : {this.state.room}
                {this.state.serverStatus.map(
                    (el) => {
                        if(el.roomName == this.state.room){
                            return(
                                <span>유저({el.members.length}) : 
                                {el.members.map((mem) => {
                                    return (
                                        <span>{mem},</span>
                                    )
                                })}
    
                                </span>
                            )
                        }
                })}
                    <canvas id="canvas" 
                    onMouseDown ={this.onMouseDown} 
                    onMouseMove ={this.onMouseMove} 
                    onMouseUp ={this.onMouseUp} 
                    onMouseOut ={this.onMouseOut}
                    width ={1000}
                    height = {500}
                    >
                    </canvas>
                    <Button variant="contained" color="primary" onClick={() => this.exitRoom(this.state.room)}>
                    나가기
                    </Button>
                </Dialog>   
            </div>
        )             
    }
}

export default Play;