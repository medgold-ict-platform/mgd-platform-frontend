import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = theme => ({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) !important',

  },
  dialog: {
    width: 500,
    heigth: 500,
    position: 'absolute',
    left: '40%',
    top: "-20%"
  }
});

class AlertDialog extends React.Component {

  state = {
    open: false,
    id: ''
  };

  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  handleOpen(id) {
    this.setState({ 
      open: true,
      id: id || ''
     });
  }

  handleClose = () => {
    this.setState({ open: false });

    this.props.handleClose();
  };

  handleOk = () => {
    this.setState({ open: false });

    this.props.handleOk(this.state.id);
  };

  render() {
    const { classes } = this.props;
    const message = this.props.message ? this.props.message : '';
    return (
      <div className={classes.container}>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className={classes.dialog}
        >
          <DialogTitle id="alert-dialog-title">{''}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleOk} color="secondary">
              Ok
            </Button>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(AlertDialog);