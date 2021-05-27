import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Paper } from '@material-ui/core';

const styles = theme => ({
    op:{
        right: '5%',
        position: 'absolute',
        bottom: '5%',
        minWidth: '20%',
        height: 50,
        transition: '1s',
        color: 'rgba(255, 255, 255, 1)',
        paddingLeft: 20,
        paddingRight: 20,
        zIndex: 10
    },
    noOp:{
        right: '-70%',
        position: 'absolute',
        bottom:'5%',
        height: 50,
        transition: '1s',
        backgroundColor: 'transparent', 
        borderColor: 'transparent'
    }
});

const defaultStyles = {
    error: {backgroundColor: 'rgba(150, 0, 0, 1)', borderColor: 'rgba(150, 0, 0, 1)'},
    warning: {backgroundColor: 'rgba(150, 150, 0, 1)', borderColor: 'rgba(150, 150, 0, 1)'},
    success: {backgroundColor: 'rgba(0, 150, 0, 1)', borderColor: 'rgba(0, 150, 0, 1)'}
}

class PaperDialog extends React.Component {

    render() {
        const { classes } = this.props;

        var status = null;

        for(var el in this.props.statuses){
            if(this.props.statuses[el]){
                status = el;
            }
        }
        
        return (
            <Paper 
                className={status ? classes.op : classes.noOp} 
                style={this.props.styles && this.props.styles[status] ? this.props.styles[status] : defaultStyles[status]}
            >
                <div style={{marginTop: 15}}>{this.props.message}</div>
            </Paper>
        );
    }
}

export default withStyles(styles)(PaperDialog);