import React, { Component } from 'react'
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import NavBar from './components/NavBar'
import LeftDrawer from './components/LeftDrawer';
import Homepage from "./components/Homepage";
import DataSets from './components/DataSets';
//import Loader from './components/Loader';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import red from '@material-ui/core/colors/red';
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';

import * as common from './api/common';


Amplify.configure(awsmobile);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#ececec',
      accent: '#008001', 
    },
    accent: {
      main: '#008001',
    },
    secondary: {
      main: '#0D47A1'
    },
    error: red,
    // Used by `getContrastText()` to maximize the contrast between the background and
    // the text.
    contrastThreshold: 3,
    // Used to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
  typography: {
    useNextVariants: true,
  }
});

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    position: 'relative',
    display: 'flex',
    width: "100%",
    backgroundColor: theme.palette.background.default,
  },
  container: {
    overflowY: 'auto',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    minWidth: 0,// So the Typography noWrap works
    height: '100%'
  },
  centerPane: {
    overflowY: 'hidden',
    flexGrow: 1,
    margin: 0,
    padding: 0,
    backgroundColor: theme.palette.background.default,
    height: '100%'
  },
  toolbar: theme.mixins.toolbar
});

class App extends Component {

  state = {
    open: false,
    anchor: 'right',
    sensors: [],
    groupID: '',
    logout: false,
    tokenSaved: false,
  };

  onToggleDrawer = (open) => {
    this.setState({ open: open });
  }

  toggleDrawer() {
    this.sidebar.toggleDrawer();
  }

  onLogout = () => {
    try {
      Amplify.Auth.signOut();
      common.clearToken();
    } catch (err) {
      console.log(`onSignoutPressed: err = ${err}`);
    }
    this.setState({logout:true});
  }

  render() {
    const { classes } = this.props;
    if (this.state.logout) {
      window.location.reload();
      window.location.href = "/";
     return <div className={classes.root}></div>   
    }
    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          <div className={classes.root}>
            <LeftDrawer onRef={ref => (this.sidebar = ref)} onToggle={this.onToggleDrawer} onLogout={this.onLogout}></LeftDrawer>
            <main className={classes.container}>
              <NavBar onClick={() => this.toggleDrawer()} onLogout={this.onLogout}></NavBar>
                <div className={classes.centerPane}>
                  <Switch>
                    <Route exact path="/"
                            component={Homepage}
                    />
                     <Route exact path="/datasets" 
                      component={DataSets} 
                    />
                  </Switch>
                </div>
            </main>
          </div>
        </Router>   
      </MuiThemeProvider>
    );
  }
}
export default (withStyles(styles)(App));

