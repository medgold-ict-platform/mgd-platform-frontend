import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Browser from '../components/Browser';
import Share from '../components/Share';
import { Paper } from "@material-ui/core"; 


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
    paddingRight:20,
  },
  paper: {
    padding: 20,
    height: 'calc(100% - 200px)'
  },
  top: {
    marginTop: 70,
    width: '100%',
    overflowY: 'hidden',
    height: '100%'
  },
  head:{
    height: 50
  },
  content: {
    height: 'calc(100% - 50px)',
    overflowY: 'scroll'
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
  }
});

class DataSets extends React.Component {
  state = {
    value: 0,
    add: false,
    edit: false
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  add() {
    this.setState ({
      add: true,
      edit: false,
      datasource: {}
    })
  }

  goBack = () => {
    this.setState ({
      add: false, 
      edit: false
    })
  }

  handleEdit = (datasource) => {
    this.setState ({
      edit: true,
      add: false,
      datasource: datasource
    })
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    //TODO: make tabs dynamic
    return (
      <div className={classes.top}>
        <div className={classes.head}><h2>Datasets</h2></div>
        <Paper className={classes.paper}>
          <Tabs
            value={value}
            onChange={this.handleChange}
            classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
          >
            <Tab
              disableRipple
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="BROWSE"
              disabled={this.state.edit}
            />
            <Tab
              disableRipple
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="SHARE"
              disabled={this.state.edit}
            />
          </Tabs>
          <div className={classes.content}>
            {value === 0 && <Browser onEdit={this.handleEdit}/>}
            {value === 1 && <Share onEdit={this.handleEdit}/>}
          </div>
        </Paper>
      </div>
    );
  }
}

DataSets.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DataSets);
