import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Main, Play, About } from 'pages';
import { Navigation } from 'component'

class App extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div>
                <Navigation/>
                <br/>
                <br/>
                <br/>
                <br/>
                <Route exact path="/" component={Main}/>
                <Route exact path="/play" component={Play}/>
                <Route exact path="/play/:room" component={Play}/>
                <Route exact path="/about" component={About}/>
            </div>
        );
    }
}

export default App;