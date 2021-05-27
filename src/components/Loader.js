import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  container: {
    display:'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  progress: {
    margin: theme.spacing.unit * 2,
    height: '100%'
  },
});

function Loader(props) {
  const { classes } = props;
  return (
    <div className={classes.container}>
      <CircularProgress className={classes.progress} size={50} color="secondary"/>
    </div>
  );
}

Loader.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Loader);