import React from 'react';

class Roominfo extends React.Component{
    
    constructor(props){
        super(props);
    }

    render(){

        return(

            <div>
                {this.props.roomStatus.roomName}
            </div>
            
        );

    }

}
export default Roominfo;