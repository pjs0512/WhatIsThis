import React from 'react';
import { SketchPicker } from 'react-color'
import Button from '@material-ui/core/Button';
import { Slider } from 'material-ui-slider';
import './canvas.css'


class Canvas extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                room : this.props.room,
                drawable : false,
                dram : false,
                color : 'black',
                lineWidth : 1,
            }
            this.onMouseDown = this.onMouseDown.bind(this);
            this.onMouseMove = this.onMouseMove.bind(this);
            this.onMouseUp = this.onMouseUp.bind(this);
            this.addDraw = this.addDraw.bind(this);
            this.clearCanvasAll = this.clearCanvasAll.bind(this);
            this.getColor = this.getColor.bind(this);
            this.changelineWidth = this.changelineWidth.bind(this);
            this.save = this.save.bind(this);
            this.test = this.test.bind(this);
            this.socket = props.socket;
            this.socket.on('RECEIVE_DRAW',(data) =>{ // 그림이 그려 지는 것
                this.addDraw(data);
            });
            this.socket.on('clearCanvas',(data) =>{ // 캔버스전부 지우기
                this.clearCanvas();
            })
        }
        componentDidMount(){
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext("2d");
            this.rect = this.canvas.getBoundingClientRect();
            this.slider = document.getElementById('lineWidthRange');
        }
        test = () =>{

        }
        save = () =>{
            let data = {
                roomName : this.state.room,
                dataURL : this.canvas.toDataURL()
            }
            this.socket.emit('snapShot',data);
        } 
        addDraw = data => { // 그리는 함수
            if(this.state.dram){
                this.ctx.beginPath();
                this.ctx.strokeStyle = data.externalPos.color;
                this.ctx.lineWidth = data.externalPos.lineWidth;
                this.ctx.stroke();
                this.state.dram = false;
            }        
            if(data.externalPos.x === -1 && data.externalPos.y === -1){
                this.ctx.closePath();
                this.state.dram = true;
            }else{
                this.ctx.strokeStyle = data.externalPos.color;
                this.ctx.lineWidth = data.externalPos.lineWidth;
                this.ctx.lineTo(data.externalPos.x-this.canvas.offsetLeft, data.externalPos.y-this.canvas.offsetTop);
                // 펜 스타일 정하기
                this.ctx.stroke();
            }
        }
        clearCanvas = ev =>{
            this.ctx.closePath();
            this.state.dram = true;
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        }

        onMouseDown = ev =>{
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

        onMouseMove = ev =>{
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
        onMouseUp = ev =>{
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
        getColor = (color) =>{
            this.setState({color : color});
        }
        changelineWidth = (value) =>{
            this.setState({lineWidth : value});
        }
        clearCanvasAll = () =>{
            this.socket.emit('clearCanvas', this.state.room);
        }
        
        render() {
            const colorSet = ['aqua','black','blue','fuchsia','gray','green','lime','maroon','navy','olive','purple','red','silver','teal','white','yellow']
            
            return (
            <div className="canvasContainer">
             <div> 
                <canvas id="canvas" 
                        onMouseDown ={this.onMouseDown} 
                        onMouseMove ={this.onMouseMove} 
                        onMouseUp ={this.onMouseUp} 
                        onMouseOut ={this.onMouseOut}
                        width={800}
                        height={400}/>
             </div>
            <div className="colorContainer">
                {colorSet.map( // colorSet
                    (color) => {
                        return (
                            <div 
                            style={{backgroundColor : color}} 
                            className="circle ripplEffect"
                            onClick={() => this.getColor(color)}
                            >
                            </div>
                        )
                    }
                )}
            </div>
            <div className="lineWidthContainer">
                
                <div align="center"><strong>Color</strong><div style={{backgroundColor : this.state.color, height : 30}}></div></div>
                     
                <div align="center"><strong>Thick</strong><br/>{this.state.lineWidth}</div>
                
                <Slider 
                defaultValue={this.state.lineWidth} 
                min="1" max="10" 
                direction ="vertical"
                onChange={this.changelineWidth}/>

                <div id="clearbutton" onClick={this.clearCanvasAll}>CLEAR</div>
                <button onClick={this.save}>저장</button>
            </div>
            <div>           
            </div>
        </div>
        )
        }
        
}

export default Canvas;