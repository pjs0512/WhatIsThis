import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Main, Play, About } from 'pages';
import Navigation from 'component/navigation';

class App extends React.Component {
    render() {
        return (
            <div>
                <Navigation/>
                <br/>
                <br/>
                <Route exact path="/" component={Main}/>
                <Route path="/play" component={Play}/>
                <Switch>
                <Route path="/about/" component={About}/>
                <Route path="/about/:name" component={About}/>
                </Switch>
            </div>
        );
    }
}

export default App;