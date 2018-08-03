import React from 'react';

class Message extends React.Component{
    constructor(props){
        super(props)
    } 
    render(){
        return(
            <div>
                    <div className="messages">
                        <h2>Chat Messages</h2>
                        {this.props.messages.map(message =>{
                            return ( <div>{message.userName} : {message.message}</div>)
                        })}
                    </div>
            </div>
        )
    }
}
export default Message;