import React from 'react';
import Query from './Query';
import Browse from './Browse';
import Loader from './Loader';
import DatasetInfo from './DatasetInfo';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Button } from "@material-ui/core";
import ArrowForward from "@material-ui/icons/ArrowForward";
import Info from "@material-ui/icons/Info";
import Folder from "@material-ui/icons/Folder";
import api from '../api/client';


const styles = theme => ({
    button: {
      margin: theme.spacing.unit,
      paddingRight:20,
      float: 'right'
    },
    top: {
      marginTop: 70,
      width: '100%'
    },
    tabsRoot: {
      borderBottom: '1px solid #e8e8e8',
    },
    tabsIndicator: {
      backgroundColor: '#1890ff',
    },
    tabRoot: {
      textTransform: 'initial',
      minWidth: 72,
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing.unit * 4,
      '&:hover': {
        color: '#40a9ff',
        opacity: 1,
      },
      '&$tabSelected': {
        color: '#1890ff',
        fontWeight: theme.typography.fontWeightMedium,
      },
      '&:focus': {
        color: '#40a9ff',
      },
    },
    tabSelected: {},
    typography: {
      padding: theme.spacing.unit * 3,
    },
    addButton: {
      left: 10,
      top: 10
    },
    queryZone:{
        width: '100%',
        height: 500,
        position: 'absolute',
        zIndex: 10
    },
    element:{
        marginTop: 10,
        padding: 10,
    },
    innerElement:{
        padding: 10,
    },
    innerField:{
        margin: 10,
        display: 'block'
    },
    innerButtons:{
        display: 'block',
        height: 50,
        margin: 10
    },
    overlay:{
      height: '100%', 
      width: '100%', 
      backgroundColor: 'rgba(0, 0, 0, 0.3)', 
      position: 'absolute', 
      left: 0, 
      top: 0, 
      zIndex: 10
    }
  });


class Browser extends React.Component {
    constructor(props){
        super(props);
        this.state={
            info: false,
            querying: false,
            browsing: false,
            queriedId: "",
            datasetStart: null,
            datasetEnd: null,
            datasets: [],
            loading: false
        }
        this.DEBUG = false
    }

    componentDidMount(){
        this.loadData()
    }

    loadData(){
        this.setState({loading: true})

        api.datasets()
        .then((response) => {
            if (this.DEBUG) console.log(response.body)
            
            response.body.sort((a,b) => a.dataset.name.toUpperCase() < b.dataset.name.toUpperCase() ? -1 : 1)

            this.setState({
                loading: false,
                datasets: response.body
            })
        })
        .catch((err) => {
            console.log(err)
            this.setState({
                loading: false
            })
        })
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
        this.loadData();
    };

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';
    
        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }
    
        this.setState({ order, orderBy });
    };

    loadWorkflows(dataset_id){
        api.datasetWorkflows(dataset_id)
        .then((response) => {
            if (this.DEBUG) console.log(response.body)
            this.setState({
                querying: true,
                queriedId: dataset_id,
                filter:["dataset", "request"],
                params: {wf: response.body}
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    render(){
        const { classes } = this.props;

        return (
        <div>
            {(this.state.querying || this.state.info || this.state.browsing) && <div className={classes.overlay}/>}
            {
                this.state.querying &&
                <Query 
                    queriedId={this.state.queriedId}
                    params={this.state.params} 
                    filter={this.state.filter} 
                    className={classes.queryZone} 
                    handleClickOutside={(evn) => {this.setState({querying: false})}}
                />
            }
            {
                this.state.info &&
                <DatasetInfo
                    infoId={this.state.queriedId}
                    className={classes.queryZone} 
                    handleClickOutside={(evn) => {this.setState({info: false})}}
                />
            }
            {
                this.state.browsing &&
                <Browse
                    browseId={this.state.queriedId}
                    browseName={this.state.queriedName}
                    directories={this.state.directories}
                    start={this.state.datasetStart}
                    end={this.state.datasetEnd}
                    className={classes.queryZone} 
                    handleClickOutside={(evn) => {this.setState({browsing: false})}}
                />
            }
            {
                !this.state.loading &&
                this.state.datasets.map(
                    n => {
                        return (
                            <div key={JSON.stringify(n)} className={classes.element}>
                                <Paper>
                                    <div className={classes.innerElement}>
                                        <div style={{height: 150, overflowY: 'auto'}}>
                                            <div className={classes.innerField}><strong>{n.dataset.name}</strong></div>
                                            <div className={classes.innerField}><strong>Area:</strong> {n.dataset.area}</div>
                                            <div className={classes.innerField}><strong>Period:</strong> {n.dataset.start_date} - {n.dataset.end_date}</div>
                                            <div className={classes.innerField}>{n.dataset.description}</div>
                                        </div>
                                        <div className={classes.innerButtons}>
                                            <Button 
                                                disabled={!n.dataset.queryable}
                                                variant="outlined" 
                                                onClick={() => {
                                                    this.loadWorkflows(n.dataset.id)
                                                }} 
                                                className={classes.button}
                                            >
                                                <ArrowForward />
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                onClick={() => {
                                                    this.setState({
                                                        browsing: true, 
                                                        datasetStart: n.dataset.start_date,
                                                        datasetEnd: n.dataset.end_date,
                                                        queriedId: n.dataset.id,
                                                        queriedName: n.dataset['human-readable'],
                                                        directories: n.dataset.directories
                                                })}} 
                                                className={classes.button}
                                            >
                                                <Folder />
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                onClick={() => {
                                                    this.setState({
                                                    info: true, 
                                                    queriedId: n.dataset.id,
                                                })}} 
                                                className={classes.button}
                                            >
                                                <Info />
                                            </Button>
                                        </div>
                                    </div>
                                </Paper>
                            </div>
                        )
                    }
                )
            }
            {
                this.state.loading &&
                <Loader/>
            }
        </div>
        )
    }
}

export default withStyles(styles)(Browser);