import React, { Component } from 'react';
import classNames from 'classnames';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import { Typography, IconButton } from '@material-ui/core/';
import MenuIcon from '@material-ui/icons/Menu';

const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbarButtons: {
    marginLeft: 'auto',
  },
  spacer: {
    width:20,
  },
  widerSpacer:{
    width: '80%',
  },
  logo: {
    width: 70,
    height: 45,
  },
  textLogo: {
    paddingLeft: 20,
    paddingRight: 20,
    width: 184,
    height: 40,
    right: 0
  },
  appLogo: {
    paddingLeft: 20,
    paddingRight: 20,
    width: 184,
    height: 40,
  }
});

class NavBar extends Component {

  onSignoutPressed() {
    
  }

  render() {
    const { classes } = this.props;
    return(
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.props.onClick}
              className={classNames(classes.menuButton)}
            >
              <MenuIcon />
            </IconButton>
            <span className={classes.spacer}/>
            <img alt="Med-Gold Logo" src="/images/logo-100.png" className={classes.appLogo} style={{width: 35, height: 43}}/>
            <Typography variant="h6" color="inherit">
                Console
            </Typography>
        </Toolbar>
      </AppBar>
    )
  }
}

export default withStyles(styles)(NavBar);