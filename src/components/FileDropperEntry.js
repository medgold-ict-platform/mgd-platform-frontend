import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import {Paper, Button, TextField} from '@material-ui/core';
import {ArrowLeft, ArrowDropDown, FileCopy} from '@material-ui/icons';

const styles = theme => ({
    button: {
        float: 'right',
    }
});

class FileDropperEntry extends React.Component {

    constructor(props){
        super(props);
        
        this.metadata = this.props.metadata;
        this.changeMetadata = this.props.changeMetadata;
        this.closeMetadata = this.props.closeMetadata;
        this.copyMetadata = this.props.copyMetadata;
        this.openMetadata = this.props.openMetadata;
    }

    getReadableFileSizeString(fileSizeInBytes) {
        var i = -1;
        var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
        do {
            fileSizeInBytes = fileSizeInBytes / 1024;
            i++;
        } while (fileSizeInBytes > 1024);
    
        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    };

    render() {
        const { classes } = this.props;

        var n = this.props.data;
        var i = this.props.index;
        
        return (
            <div onClick={(e) => {e.preventDefault(); e.stopPropagation()}}>
                <Paper style={{height: n.open ? 380 : 50, margin: 5}}>
                    <div style={{height: 50}}>
                        <div style={{width: '30%', float: 'left', height: 15, padding: 15}}>{n.name}</div>

                        <div style={{width: '10%', float: 'left', height: 15, padding: 15, textAlign: 'right'}}>{this.getReadableFileSizeString(n.file.size)}</div>

                        <div style={{width: '30%', float: 'left', height: 15, padding: 15, position: 'relative', border: 'solid white 1px'}}>
                            <div style={{height: 15, width: n.progress ? n.progress : 0, backgroundColor: 'rgba(0, 150, 0, 0.7)', position: 'absolute', top: 15}}/>
                            <div 
                                style={{
                                    fontSize: 13, 
                                    width: '100%', 
                                    textAlign: 'center', 
                                    position: 'absolute', 
                                    top: 15,
                                    color: 'black'
                                }}
                            >{n.progress}</div>
                        </div>

                        <Button 
                            className={classes.button} 
                            style={{margin: 0, marginTop: 4, marginRight: 5, display: 'block', border: 'hidden'}}
                            onClick={n.open ? this.closeMetadata(i) : this.openMetadata(i)}
                        >
                            {n.open && <ArrowDropDown/>}
                            {!n.open && <ArrowLeft/>}
                        </Button>
                    </div>
                    
                    {n.open && 
                        <div style={{width: '95%', marginLeft: '2.5%', marginTop: 10}}>
                            
                            <Paper style={{height: 300, width: '100%', zIndex: 1}}>

                                <div style={{width: '95%', marginLeft: '2.5%', height: 50, paddingTop: 10}}>
                                    <div style={{display: 'inline-block', padding: '10px 0', textAlign: 'left'}}>Metadata</div>

                                    <Button 
                                        title="Copy metadata to all files"
                                        className={classes.button} 
                                        style={{margin: 0, marginTop: 4, marginRight: 5, height: 35, display: 'block', border: 'hidden'}}
                                        onClick={() => this.copyMetadata(n.metadata, i)}
                                    >
                                        <FileCopy/>
                                    </Button>
                                </div>
                                
                                <div style={{width: '100%', height: 220, overflowY: 'auto', marginTop: 10}}>
                                    {this.metadata ? this.metadata.map((m) => {
                                        return (
                                            <TextField
                                                type={m.type}
                                                key={m.name}
                                                label={m.name}
                                                value={n.metadata[m.metadata] || ''}
                                                required={m.mandatory}
                                                onChange={this.changeMetadata(m.metadata, i)}
                                                style={{display:'inline-block', width: '20%', marginLeft: '2.5%', marginRight: '2.5%', marginTop: 10, marginBottom: 10}}
                                            />
                                        )
                                    }) : (<div/>)}
                                </div>
                            </Paper>
                        </div>
                    }
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(FileDropperEntry);