import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import gimon from '../img/gimon.png';

const styles = {
    card: {
      minWidth: '100%',
      maxWidth: '100%',
      transition: '1s',
    },
    media: {
    },
  };

class Roomlist extends React.Component{
    constructor(props){
        super(props);
    }
  render(){
      return (  
        <div >
        <Card className={styles.card}>
            <img src={this.props.dataURL} style={{maxWidth:350,maxHeight: 175,}}/>
            <CardContent>
            <Typography gutterBottom variant="headline" component="h2">
                {this.props.roomName}({this.props.members.length})
            </Typography>
            <Typography component="p">
                {this.props.members.map(el =>{
                    return el + ','
                })}
            </Typography>
            </CardContent>
        </Card>
        </div>
  );
  }

}

export default withStyles(styles)(Roomlist);