import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { Drawer, Tooltip } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {Home, Folder, ExitToApp} from '@material-ui/icons';
import { Link } from 'react-router-dom';

const drawerWidth = 200;


const styles = theme => ({
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    })
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
});

class LeftDrawer extends React.Component {

  state = {
    open: false,
  };

  constructor(props) {
    super(props);
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  toggleDrawer() {
    var open = this.state.open;
    //this is asynchronous. Use a variable to pass the open value to the caller
    this.setState({
      open: !this.state.open
    });
    this.props.onToggle(!open);
  }
  render() {
    const { classes } = this.props;

    return (
       <Drawer
          variant="permanent"
          classes={{
            paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
          open={this.state.open}
        >
          <div style={{height: 70}}></div>
          <Link to={'/'} style={{ textDecoration: 'none' }} >
            <Tooltip title="HOMEPAGE">
              <MenuItem>
                <ListItemIcon >
                  <Home />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.primary }} primary="HOMEPAGE" />
              </MenuItem>
            </Tooltip>
          </Link>        
          <Link to={'/datasets'} style={{ textDecoration: 'none' }}>
            <Tooltip title="DATASETS">
              <MenuItem>
                <ListItemIcon >
                  <Folder />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.primary }} primary="DATASETS" />
              </MenuItem>
            </Tooltip>
          </Link>
          <Link to={'/'}style={{ textDecoration: 'none' }}>
            <Tooltip title="LOGOUT">
              <MenuItem onClick={()=> this.props.onLogout()}>
                <ListItemIcon >
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.primary }} primary="LOGOUT" />
              </MenuItem>
            </Tooltip>
          </Link>
    </Drawer>
    );
  }
}

LeftDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LeftDrawer);