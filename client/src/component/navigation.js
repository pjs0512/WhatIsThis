import React from 'react';
import { Link } from 'react-router-dom';
import './navigation.css'

class Navigation extends React.Component{

    render(){

        return (
        <div>
            <div class="navigationBar">
                <div class="menuli cl-effect-5">
                    <Link to="/">WhatisThis</Link>
                    <Link to="/"><span data-hover="메인">Main</span></Link>
                    <Link to="/play"><span data-hover="게임">  GamePlay</span></Link>
                    <Link to="/about"><span data-hover="안내">About</span></Link>
                            <div class="dropdowns">
                                <button class="dropbtns"></button>
                                <div class="dropdowns-content">
                                </div>
                            </div>

                </div>
            </div>
        </div>
        )

    }

}
export default Navigation;