import React, { Component } from 'react'
import { withStyles } from "@material-ui/core/styles";

const styles = theme =>  ({
    top: {
        height: '100%',
        overflowY: 'hidden'
    },
    appLogo: {
        display: 'block',
        padding: 0,
        width: '60%',
        height: '60%',
        margin: '0 auto 0 auto'
      },
    divLogo:{
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0
    },
    appLogoFooter: {
        float: 'right',
        border: 'solid 1px',
        margin: 0,
        marginRight: '41%',
        padding: 0,
        width: 450, 
        height: 109
    },
    divFooter:{
        position: 'absolute',
        bottom: 0,
        padding: 0,
        width: '100%',
        margin: 0
    }
  });


class Homepage extends Component {
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.top}>
                {/* <div className={classes.divLogo}>
                    {/* <img alt="Logo Med-Gold" src="/images/medgold_logo.png" className={classes.appLogo} /> 
            </div>*/}
                <div className={classes.divFooter}>
                    <img alt="Loghi" src="/images/partners_mg.png" className={classes.appLogoFooter}/>
                </div>
            </div>
        )
    }
}
export default (withStyles(styles)(Homepage));