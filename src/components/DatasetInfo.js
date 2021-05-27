import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core'
import api from '../api/client';
import Loader from './Loader';


const styles = theme => ({
    divStart:{
        top: '-60%',
        position: 'absolute',
        left: '20%',
        'transition': '1s',
        justifyContent: 'center',
        alignItems: 'center',
        width: '60%',
        borderRadius: 5
    },
    divStop:{
        top: '17%',
        position: 'absolute',
        left: '20%',
        'transition': '1s',
        justifyContent: 'center',
        alignItems: 'center',
        width: '60%',
        borderRadius: 5
    },
    element:{
        paddingLeft: 20,
        paddingRight: 20
    },
    innerElement:{
        padding: 10,
        height: 390,
        overflowY: 'auto'
    },
    innerField:{
        margin: 10,
        display: 'block'
    },
  });


  class DatasetInfo extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            componentMounted: false,
            loading: false,
            info: null,
            datasetId: this.props.infoId,
        }
        this.handleClickOutside = this.props.handleClickOutside
        this.DEBUG = false
    }

    componentWillMount(){
        document.addEventListener('mousedown', this.handleClick, false);
    }
    
    componentWillUnmount(){
        document.removeEventListener('mousedown', this.handleClick, false);
    }

    handleClick = (e) => {
        if(this.node.contains(e.target)) return;
        this.setState({componentMounted: false})
        setTimeout(() => this.handleClickOutside(), 650)
    }

    componentDidMount(){
        this.loadData();
    }

    loadData(){
        this.setState({
            loading: true
        })
        api.datasetInfo(this.state.datasetId)
        .then((response) => {
            if(this.DEBUG) console.log(response.body)
            setTimeout(() => this.setState({
                componentMounted: true,
                info: response.body,
                loading: false
            }), 25)
        })
        .catch((err) => {
            console.log(err)
            this.setState({
                loading: false
            })
        })
    }

    render(){
        const { classes } = this.props;
        return (
            <div ref={(node) => {this.node=node}} className={this.state.componentMounted ? classes.divStop : classes.divStart}>
                <Paper className={this.props.className} onClick={this.props.onClick}>
                    {!this.state.loading && this.state.info &&
                        <div className={classes.element}>
                            <div><h2>Details</h2></div>
                            <Paper>
                                <div className={classes.innerElement}>
                                    <div className={classes.innerField}><strong>{this.state.info.name}</strong></div>
                                    <div className={classes.innerField}><strong>Area:</strong> {this.state.info.area}</div>
                                    <div className={classes.innerField}><strong>Period:</strong> {this.state.info.start_date} - {this.state.info.end_date}</div>
                                    <div className={classes.innerField}>{this.state.info.description}</div>
                                    <div style={{height: 25}}></div>
                                    {this.state.info &&
                                        Object.keys(this.state.info['vars']).map(
                                            (n) => {
                                                return (
                                                    <div key={n} className={classes.innerField}><strong>{n}</strong>: {this.state.info.vars[n]}</div>
                                                )
                                            }
                                    )}
                                </div>
                            </Paper>
                        </div>
                    }
                    {
                        this.state.loading && <Loader/>
                    }
                </Paper>
            </div>
        )
    }
  }

  export default withStyles(styles)(DatasetInfo);