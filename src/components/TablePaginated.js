import React, { Component } from 'react'
import { withStyles } from "@material-ui/core/styles";
import { Paper} from "@material-ui/core"; 
import { Table, TableCell, TableHead, TableRow, TableBody, TablePagination, TableSortLabel, TableFooter, Button } from "@material-ui/core";
import {NavigateNext, NavigateBefore} from "@material-ui/icons"
import { red, green } from '@material-ui/core/colors';

const styles = theme => ({
  margin: {
    margin: theme.spacing.unit * 2,
  },
  paper: {
    padding: 20,
    textAlign: 'center',
    overflowX: 'auto',
    height: '100%'
  },
  header:{
    position: 'sticky', 
    top: 0,
    zIndex: 1,
    backgroundColor: 'rgba(250, 250, 250, 1)'
  },
  top:{
    height: 'calc(100% - 60px)', 
    overflowY: 'auto'
  },
  statusOn: {
    textColor: {green},
    backgroundColor: {green}
  },
  statusOff: {
    textColor: {red},
  },
  table: {
    minWidth: 100,
    height: '100%'
  },
  backButton: {
    marginBottom:10,
  },
  badge: {
    backgroundColor: 'green',
    color: 'white'
  }
});

class TablePaginated extends Component {

  handleChangePage = (event, page) => {
    this.props.handleChangePage(event, page);
  };

  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { classes } = this.props;
    const { order, orderBy, page, total, size, hidePagination, count, index } = this.props;

    return (
      <Paper className={classes.paper}>
        <div className={classes.top}>
          {this.props.headers &&
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  {this.props.headers.map(row => {
                    return (
                      <TableCell className={classes.header} style={row.id === 'empty' ? {width: '20%'} : {}}
                        key={row.id}
                        sortDirection={orderBy === row.id ? order : false}
                        numeric={row.numeric}
                      >
                        <TableSortLabel
                          active={orderBy === row.id}
                          direction={order}
                          onClick={this.createSortHandler(row.id)}
                          disabled={row.disabled}
                        >
                          {row.label}
                        </TableSortLabel>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.children}
              </TableBody>
            </Table>
          }
        </div>
        {hidePagination && <Table>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={this.props.headers.length} style={{height: 45}}>
                <div style={{height: '100%', lineHeight: 3, display: 'inline-block'}}>Page {page+1}</div>
                <Button disabled={this.props.nextPageDisabled} style={{float:'right'}} onClick={(e) => this.handleChangePage(e, page+1)}>
                  <NavigateNext/>
                </Button>
                <Button disabled={!(page > 0)} style={{float:'right'}} onClick={(e) => this.handleChangePage(e, page-1)}>
                  <NavigateBefore/>
                </Button>
                <div style={{float: 'right', height: '100%', lineHeight: 3, marginRight: 50}}>{index} to {index+count}</div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>}

        {!hidePagination && <TablePagination
          component="div"
          count={total}
          rowsPerPage={size}
          labelRowsPerPage=''
          rowsPerPageOptions={[]}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
            'disabled': !(page > 0)
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
            'disabled': this.props.nextPageDisabled
          }}
          onChangePage={this.handleChangePage}
        />}
      </Paper>
    );
  }
}

export default withStyles(styles)(TablePaginated);