import React from 'react';

class About extends React.Component{

    render(){
        return (
            <div>
                <h1>About {this.props.match.params.name}</h1>
            </div>
        )

    }
}

export default About;