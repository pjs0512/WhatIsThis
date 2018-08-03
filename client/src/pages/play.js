import React from 'react';
import io from "socket.io-client";
import { findDOMNode } from 'react-dom'
import {Link} from "react-router-dom";
import { EventEmitter } from 'events';
import PropTypes from 'prop-types';
import './play.css';
import gimon from '../img/gimon.png';
import hi from '../img/hi.png';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide'
import { TextField, DialogTitle, DialogContent } from '@material-ui/core';
import Beforeunload from 'react-beforeunload';
import { ServerResponse } from 'http';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import {ToastContainer,toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Roominfo, Roomlist, Message, Canvas, Navigation} from '../component';
import { Stagger, Fade,Loop } from 'react-animation-components'




function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class Play extends React.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:5000/');
        this.state = {
            open : false,
            seikaiDialog : false,
            seikaiWord : "",
            seikaiUser : "",
            messages : [],
            room : null,
            userName : null,
            serverStatus : new Object(),
            roomStatus : {}
        }
        this.socket.on('userName',(data) =>{
            this.setState({userName : data});
        })
        this.socket.on('setUserNameFalse',(data) =>{
            alert(data + "는 이미 있는 이름 입니다.");
        })
        this.socket.on('roomStatus', (data) =>{
            this.setState({roomStatus : data});
            console.log(this.state.roomStatus);
        })
        this.socket.on('serverStatus',(data) =>{
            this.setState({serverStatus : data});
            console.log(data);
        })
        this.socket.on('resetMessages',(data) =>{
            this.setState({messages : []});
        })
        this.socket.on('seikai', (data) =>{
            this.setState({seikaiDialog : true, seikaiUser : data.userName ,seikaiWord : data.message});
            setTimeout(()=> {this.setState({seikaiDialog : false, seikaiUser : "",seikaiWord : ""})},4000);
        })
        this.socket.on('messages',(data) =>{
            this.setState({messages : [...this.state.messages,data]})
        })
        this.socket.on('enterRoomSuccess',(data) =>{
            this.setState({open : true});
            this.setState({room : data});
        })
        this.socket.on('enterRoomFalse',() =>{
            alert('이미 삭제된 방입니다.');
        })
        this.getServerStatus = () =>{
            this.socket.emit('getServerStatus','');
        }
        this.enterRoom = (data) =>{
            this.socket.emit('enterRoom',data);
        }
        this.exitRoom = (data) =>{
            this.setState({open : false});
            this.setState({room : null});
            this.socket.emit('exitRoom',data);
        }
        this.setUserName = ()=>{
            let setName = prompt('이름을 설정하세요! 2~8자');
            if(setName == null){
              setName = '';
            }  
            if(setName.length > 8 || setName.length < 2){
                alert('길이 확인해 주세용~');
            }else{
                if(setName != null){
                    this.socket.emit('setUserName',setName);
                }
            }
        }
        this.createRoom = () =>{
            let roomName = prompt('방이름을 입력하세요! 20자 이내');

            if(roomName != null && roomName.length < 20){
                this.socket.emit('createRoom',roomName);
            }else{
                alert('방 이름이 너무 길어요 ');
            }
        }
    
        this.gameStart = () =>{
            this.socket.emit('gameStart',this.state.room);
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

        return (
            <div className="main-layout">
                <Beforeunload onBeforeunload={() => this.exitRoom(this.state.room)}/>
                <div className="grid">
                    <Button variant="contained" color="primary" onClick={this.setUserName} disabled style={{background : '#ffffff', color : '#000000'}}><h3>YOURNAME : {this.state.userName}</h3></Button>
                    <Button variant="contained" color="secondary" onClick={this.setUserName}><h1>NAMECHANGE</h1></Button>
                    <Button variant="contained" color="primary" onClick={this.createRoom}><h1>CREATEROOM</h1></Button>
                    
                    {Object.keys(this.state.serverStatus).map(el =>{
                            return (
                                <div className="room" onClick={() => this.enterRoom(el)}> 
                                <Stagger duration={el.length*100} delay={100} in>    
                                    <Fade >
                                        <Roomlist roomName={el} members={this.state.serverStatus[el].members} dataURL={this.state.serverStatus[el].dataURL}/>
                                    </Fade>
                                </Stagger>
                                </div>
                                )          
                    })}     
                </div>
                <Dialog
                    fullScreen
                    open={this.state.open}
                    onClose={this.handleClose}
                    onEntered ={this.enteredDialog}
                    onExit = {this.exitDialog}
                    TransitionComponent={Transition}
                >
                        <Roominfo roomStatus={this.state.roomStatus}/>

                        <Canvas socket={this.socket} room={this.state.room}/>
                        <br/>
                        <Message messages={this.state.messages}/>
                        <TextField id ="text" type="text" placeholder="답을 입력하세요!" onKeyPress={this.keyPressHandle}/>
                        <br/>
                        <Button onClick={this.gameStart}>게임시작</Button>
                        <Button variant="contained" color="primary" onClick={() => this.exitRoom(this.state.room)}>
                            나가기
                        </Button>
                        <br/>
                <Dialog
                    fullScreen
                    open={this.state.seikaiDialog}
                    onClose={this.handleClose}
                    TransitionComponent={Transition}
                >
                <div class="seikaicontainer">
                    <div class="outer">
                        <div class="inner">
                            <div class="centered">
                                <span id="seikaispan">{this.state.seikaiUser}</span><br/>    
                            </div>
                        </div>
                    </div>
                </div>
                </Dialog>
                </Dialog>   
            </div>
        )             
    }
}


export default Play;