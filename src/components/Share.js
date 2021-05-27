import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Loader from './Loader';
import GetApp from '@material-ui/icons/GetApp';
import { TableCell, TableRow, Button } from "@material-ui/core"; 
import TablePaginated from './TablePaginated';
import FileDropper from './FileDropper';
import AlertDialog from './Alert';
import PaperDialog from './PaperDialog';
import {getSorting, stableSort} from './TableSorter';
import { Add, Delete } from '@material-ui/icons';
import AWS from 'aws-sdk';
import Amplify from 'aws-amplify';


const styles = theme => ({
    button: {
      margin: theme.spacing.unit,
      paddingRight:20,
      zIndex: 0
    },
    addButton: {
      left: 15,
      top: 15
    },
    top:{
      height: 'calc(100% - 45px)'
    },
    head:{
      display: 'block',
      height: 70
    },
    content:{
      height: 'calc(100% - 70px)'
    },
    dropZone:{
      width: '100%',
      height: 600,
      position: 'absolute',
      zIndex: 10
    },
    // op:{
    //   right: '5%',
    //   position: 'absolute',
    //   bottom: '5%',
    //   minWidth: '20%',
    //   height: 50,
    //   transition: '1s',
    //   color: 'rgba(255, 255, 255, 1)',
    //   paddingLeft: 20,
    //   paddingRight: 20,
    //   zIndex: 10
    // },
    // noOp:{
    //   right: '-70%',
    //   position: 'absolute',
    //   bottom:'5%',
    //   //width: '20%',
    //   height: 50,
    //   transition: '1s',
    // },
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

var headers = [
  { id: 'Key', align: false, disabled: false, label: 'Filename' },
  { id: 'LastUpdated', align: false, disabled: false, label: 'Last Updated' },
  { id: 'Author', align: false, disabled:false, label: 'Author'},
  { id: 'Size', align: false, disabled: false, label: 'Size' },
  { id: 'empty', align: false,  disabled: true, label: '' },
];

const BUCKET_NAME = "dev-medgold-sharing"

class Share extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        loading: false,
        dropping: false,
        page: 0,
        index: 0,
        size: 50,
        count: 0,
        order: 'desc',
        orderBy: '',
        files: [],
        error: false,
        warning: false,
        message: '',
        success: false,
        currentUser: '',
        deletingKey: '',
        disableNextPage: true,
        tokens: []
      }
    }

    componentDidMount(){
      this.getUser()
      this.loadData(0)
    }

    getUser(){
      var credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'eu-west-1:51d4187e-a31b-4d01-8942-420095d40083'
      })

      AWS.config.update({
          credentials: credentials,
          region: 'eu-west-1'
      });

      var cognito = new AWS.CognitoIdentityServiceProvider();

      Amplify.Auth.currentSession()
      .then((session) =>{
        cognito.getUser({AccessToken: session.accessToken.jwtToken},
          (err, data) => {
            if(err){
              console.log(err.message)
            }
            else{
              this.setState({currentUser: data.Username})
            }
          })
      })
      .catch((err) => {
        console.log('ERROR RETRIEVING USER', err.message)
      })
    }

    loadData(page){
      this.setState({loading: true})
      AWS.config.update({
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'eu-west-1:51d4187e-a31b-4d01-8942-420095d40083'
        }),
        region: 'eu-west-1',
        maxRetries: 0
      });

      var s3 = new AWS.S3();

      var token = this.state.tokens[page];
      var index = this.state.page !== page ? this.state.page > page ? this.state.index - this.state.size : this.state.index + this.state.size : this.state.index;

      s3.listObjectsV2(
        {
          Bucket: BUCKET_NAME,
          MaxKeys: this.state.size,
          ContinuationToken: token
        }, (err, data) => {
          if (err){
            console.log(err.message)
            this.setState({
              loading: false
            })
          }
          else{
            var tokens = this.state.tokens
            tokens[page+1] = data.NextContinuationToken;

            this.setState({
              files: data.Contents, 
              index: index,
              count: data.KeyCount, 
              tokens: tokens,
              disableNextPage: !data.IsTruncated
            })

            if (data.Contents.length === 0) {
              this.setState({loading: false})
            }
            else{
              for (const [i, item] of data.Contents.entries()){
                s3.headObject({Bucket: BUCKET_NAME, Key: item.Key}, (err1, data1) => {
                  if(err1 && !data1.Metadata){
                    this.setState({
                      loading: false
                    })
                  }
                  else{
                    var files = this.state.files;
                    files[i].Author = data1.Metadata.author;

                    this.setState({
                      files: files,
                      loading: !files.every(n => n.Author)
                    })
                  }
                })
              }
            }
          }
        }
      )
    }

    download(key){
      var s3 = new AWS.S3();
      var element = document.createElement("a");
      element.href = s3.getSignedUrl('getObject', { Bucket: BUCKET_NAME, Key: key })

      var mouseEvent = document.createEvent("MouseEvents");
      mouseEvent.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
      );
      element.dispatchEvent(mouseEvent);
    }

    delete(key){
      this.child.handleOpen(key);
      this.setState({deletingKey: key})
    }

    deleteFile(key){
      var s3 = new AWS.S3();
      s3.deleteObject({ Bucket: BUCKET_NAME, Key: key },
        (err, data) => {
          if (err){
            console.log(err);
            this.handleOperation({error: true, message: 'Error deleting file: ' + err.message})
          } 
          else {
            this.handleOperation({success: true, message: 'File successfully deleted'});
            setTimeout(() => this.loadData(this.state.page), 1000);
          }
        }
      );
    }

    handleChangePage = (event, page) => {
      this.setState({ page });
      this.loadData(page);
    };

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';
    
        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }
    
        this.setState({ order, orderBy });
    };

    handleOperation = (op) => {
      this.setState(op);
      setTimeout(() => this.setState({
                  error: false,
                  success: false,
                  warning: false}
                ), 5000);
    }

    getReadableFileSizeString(fileSizeInBytes) {
      var i = -1;
      var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
      do {
          fileSizeInBytes = fileSizeInBytes / 1024;
          i++;
      } while (fileSizeInBytes > 1024);
  
      return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    };

    render(){
        const { classes } = this.props;
        const {order, orderBy, page, count, index } = this.state;
        const { success, error, warning } = this.state;

        return (
          <div className={classes.top}>
            {(this.state.dropping) && <div className={classes.overlay}/>}
            {this.state.dropping &&
              <FileDropper 
                className={classes.dropZone} 
                handleClickOutside={(evn) => {this.setState({dropping: false})}}
                scope={this} 
                files={this.state.files.map((it) => it.Key)}
                handleOperation={this.handleOperation}
                page={page}
              />
            }
            
            <div className={classes.head}>
              <Button variant="outlined" className={classes.addButton} onClick={() => this.setState({dropping: true})}>
                  <Add/>
              </Button>
            </div>
            <div className={classes.content}>
              {this.state.loading && <Loader/>}
              {!this.state.loading && 
                <TablePaginated 
                  hidePagination 
                  headers={headers} page={page} count={count}
                  order={order} orderBy={orderBy} 
                  onRequestSort={this.handleRequestSort} handleChangePage={this.handleChangePage} 
                  parent={this} index={index}
                  nextPageDisabled={this.state.disableNextPage}
                >
                  {stableSort(this.state.files, getSorting(order, orderBy)).slice().map(
                    n => {
                      return (
                          <TableRow key={n.Key}>
                              <TableCell>{n.Key}</TableCell>
                              <TableCell>{n.LastModified.toLocaleString()}</TableCell>
                              <TableCell>{n.Author}</TableCell>
                              <TableCell>{this.getReadableFileSizeString(n.Size)}</TableCell>
                              <TableCell>
                                  <Button variant="outlined" onClick={() => this.download(n.Key)} className={classes.button}>
                                      <GetApp />
                                  </Button>
                                  {n.Author===this.state.currentUser && <Button variant="outlined" onClick={() => this.delete(n.Key)} className={classes.button}>
                                      <Delete />
                                  </Button>}
                              </TableCell>
                          </TableRow>
                      );
                    }
                  )}
                </TablePaginated>
              }
            </div>

            <AlertDialog 
              onRef={ref => (this.child = ref)} 
              message={"Delete " + this.state.deletingKey + "?"} 
              handleOk={(key) => this.deleteFile(key)}
              handleClose={() => this.setState({deletingKey: ''})}
            />

            <PaperDialog
              message={this.state.message}
              statuses={{success, error, warning}}
            />
          </div>)
    }
}

export default withStyles(styles)(Share);