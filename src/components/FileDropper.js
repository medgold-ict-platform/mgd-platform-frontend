import React, { Component } from 'react'
import { withStyles } from "@material-ui/core/styles";
import Dropzone from 'react-dropzone';
import Loader from './Loader';
import {Paper, Button} from '@material-ui/core';
import FileDropperEntry from './FileDropperEntry';
import AWS from 'aws-sdk';
var Amplify = require('aws-amplify');

const styles = theme =>  ({
    root: {
        minWidth: "40%",
        overflowX: "auto"
    },
    button: {
        marginTop: 20,
        marginRight: '2%',
        float: 'right',
        display: 'inline-block',
        border: '1px solid rgba(0,0,0,0.1)'
    },
    buttonLeft: {
        marginTop: 20,
        marginLeft: '2%',
        float: 'left',
        display: 'inline-block',
        border: '1px solid rgba(0,0,0,0.1)'
    },
    dropArea:{
        marginTop: 20,
        marginLeft: '2%',
        width: '96%',
        height: 500
    },
    top: {
        marginTop: 70,
        width: '100%'
    },
    divStart:{
        top: '-70%',
        position: 'absolute',
        left:'20%',
        width: '60%',
        height: 550,
        transition: '1s',
    },
    divStop:{
        top: '20%',
        position: 'absolute',
        left: '20%',
        width: '60%',
        height: 550,
        transition: '1s',
    }
  });

const BUCKET_NAME = "dev-medgold-sharing"
const CHUNK_SIZE = 5 * 1024 * 1024;
const SIZE_THRESHOLD = 5 * 1024 * 1024 * 1024;

class FileDropper extends Component {

    constructor(props){
        super(props);
        this.state = {
            componentMounted: false,
            filesDropped: [],
            readyToUpload: false,
            metadata: [],
            loading: false,
            page: this.props.page
        };
        this.parent = this.props.scope;
        this.handleClickOutside = this.props.handleClickOutside;
        this.handleOperation = this.props.handleOperation;
    }

    componentWillMount(){
        document.addEventListener('mousedown', this.handleClick, false);
    }

    componentWillUnmount(){
        document.removeEventListener('mousedown', this.handleClick, false);
    }

    componentDidMount(){
        this.loadData()
    }

    handleClick = (e) => {
        if(this.node.contains(e.target)) return;
        this.setState({componentMounted: false})
        setTimeout(() => this.handleClickOutside(), 650)
    }

    loadData(){
        var credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-1:51d4187e-a31b-4d01-8942-420095d40083'
        })

        AWS.config.update({
            credentials: credentials,
            region: 'eu-west-1'
        });
    
        var dynamo = new AWS.DynamoDB.DocumentClient();

        dynamo.scan({TableName: '*************'}, (err, data) => {
            if(err){
                this.handleOperation({error: true, message: 'Error retrieving metadata:' + err.message, dropping: false})
            }
            else{
                this.setState({componentMounted: true, metadata: data.Items ? data.Items : []})
            }
        })
    }

    openMetadata = (i) => (e) => {
        e.stopPropagation()
        e.preventDefault()
        var filesDropped = this.state.filesDropped
        filesDropped[i].open = true

        if(!filesDropped[i].metadata){
            filesDropped[i].metadata = {}

            for(var m of this.state.metadata){
                filesDropped[i].metadata[m.metadata] = ''
            }
        }

        this.setState({
            filesDropped: filesDropped
        })
    }

    closeMetadata = (i) => (e) => {
        e.stopPropagation()
        e.preventDefault()
        var filesDropped = this.state.filesDropped
        filesDropped[i].open = false
        this.setState({
            filesDropped: filesDropped
        })
    }

    changeMetadata = (name, i) => (e) => {
        e.preventDefault();

        var filesDropped = this.state.filesDropped
        filesDropped[i].metadata[name] = e.target.value
        this.setState({
            filesDropped: filesDropped
        })
    }

    copyMetadata = (m, i) => {
        var filesDropped = this.state.filesDropped;
        
        filesDropped.forEach((el, idx) => {
            if(idx !== i){
                el.metadata = {...m};
            }
        })

        this.handleOperation({success: true, message: 'Metadata successfully copied to all files'});

        this.setState({
            filesDropped: filesDropped
        })
    }

    onDrop = (accepted, rejected) => {
        this.setState({
            loading: true
        })

        for (var f of accepted) {
            if(this.props.files.includes(f.name)){
                this.handleOperation({error: true, message: 'File ' + f.name + ' already exists'})
            }
            else{
                if(f.name.length !== 0){
                    var filesDropped = this.state.filesDropped
                    filesDropped.push({name: f.name, progress: '', loaded:0, open: false, file: f})
                    this.props.files.push(f.name)
                    this.setState({
                        filesDropped: filesDropped
                    });
                }
            }
        }

        if(this.state.filesDropped.length) this.setState({readyToUpload: true, loading: false})
    }

    async upload(){
        const scope = this;

        this.setState({readyToUpload: false, loading: false})

        var credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-1:51d4187e-a31b-4d01-8942-420095d40083'
        })

        AWS.config.update({
            credentials: credentials,
            region: 'eu-west-1'
        });
    
        var s3 = new AWS.S3();

        var cognito = new AWS.CognitoIdentityServiceProvider();

        const session = await Amplify.Auth.currentSession()

        if(session){
            cognito.getUser({AccessToken: session.accessToken.jwtToken},
                (err, data) => {
                    this.state.filesDropped.forEach((el, i) => {
                        for(var m in el.metadata){
                            if(!el.metadata[m]){
                                delete el.metadata[m]
                            }
                        }

                        var params = {
                            Bucket: BUCKET_NAME, Key: el.name,
                            Metadata: {...el.metadata, 'author': data.Username}
                        };

                        s3.createMultipartUpload(params)
                        .send( (err, data) => {
                            if (err){
                                var err_msg = err.code
                                if(err.code === 'SignatureDoesNotMatch'){
                                    err_msg = 'Metadata must contain only US-ASCII characters'
                                }

                                scope.handleOperation({error: true, message: 'Error while uploading: ' + err_msg})
                                scope.setState({readyToUpload: true})
                                console.error(err);
                            }
                            else{
                                var totalParts = el.file.size >= SIZE_THRESHOLD ? 10000 : Math.ceil(el.file.size / CHUNK_SIZE);
                                const uploadId = data.UploadId;
                                var r = new FileReader();

                                let j = 0;

                                var onLoadHandler = function(event) {
                                    if (!event.target.error) {

                                        var params = {
                                            Body: event.target.result, 
                                            Bucket: BUCKET_NAME, 
                                            Key: el.name, 
                                            PartNumber: j+1, 
                                            UploadId: uploadId
                                        };

                                        s3.uploadPart(params)
                                        .on('httpUploadProgress', (event) => {
                                            var filesDropped = scope.state.filesDropped
                                            filesDropped[i].progress = parseInt((filesDropped[i].loaded + event.loaded) * 100 / filesDropped[i].file.size, 10) + '%'
                                            scope.setState({
                                                filesDropped: filesDropped
                                            })
                                        })
                                        .send(function(err, data) {
                                            if (err){
                                                console.log(err, err.stack);
                                            }
                                            else {
                                                var filesDropped = scope.state.filesDropped
                                                
                                                if(filesDropped[i].parts){
                                                    filesDropped[i].parts.push({
                                                        ETag: data.ETag,
                                                        PartNumber: j+1
                                                    })
                                                }
                                                else{
                                                    filesDropped[i].parts = [{
                                                        ETag: data.ETag,
                                                        PartNumber: j+1
                                                    }]
                                                }

                                                filesDropped[i].loaded += CHUNK_SIZE

                                                if(filesDropped[i].parts.length === totalParts){
                                                    filesDropped[i].parts.sort(
                                                        (a,b) => a.PartNumber - b.PartNumber
                                                    )
                                                    
                                                    var params = {
                                                        Bucket: BUCKET_NAME, 
                                                        Key: el.name, 
                                                        MultipartUpload: {
                                                            Parts: filesDropped[i].parts
                                                        }, 
                                                        UploadId: uploadId
                                                    };
                                                    
                                                    s3.completeMultipartUpload(params, function(err1, data1) {
                                                        if (err1){
                                                            console.log(err1);
                                                        }
                                                        else{
                                                            if(scope.state.filesDropped.every((v) => v.progress === '100%')){
                                                                scope.parent.loadData(scope.state.page);
                                                                scope.setState({componentMounted: false});
                                                                setTimeout(scope.handleOperation({success: true, message: 'Upload completed', dropping: false}), 1500);
                                                            }
                                                        }
                                                    });
                                                }

                                                scope.setState({
                                                    filesDropped: filesDropped
                                                })

                                                j++;
                                                seek();
                                            }
                                        });
                                    }
                                }

                                r.onload = onLoadHandler;

                                function seek() {
                                    if (j >= totalParts) return;

                                    var slice = el.file.slice(j*CHUNK_SIZE, (j+1) * CHUNK_SIZE);
                                    r.readAsArrayBuffer(slice);
                                }

                                seek();
                            }
                        })
                    })
                })
        }
        else{
            console.log('Error getting session');
        }
    }

    render(){
        const { classes } = this.props;

        return (
          <div ref={(node) => {this.node=node}} className={this.state.componentMounted ? classes.divStop : classes.divStart}>
            <Paper className={this.props.className} onClick={this.props.onClick}>
                <Dropzone onDrop={this.onDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()}  className={classes.dropArea}>
                            <Paper  style={{width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.1)', overflowY: 'auto'}}>
                                <input {...getInputProps()}/>
                                {(this.state.loading || !this.state.filesDropped.length) &&
                                    <div style={{marginTop: 250, textAlign: 'center'}}>
                                        {!this.state.filesDropped.length && 
                                            <p>Try dropping files here, or click to select files to upload.</p>
                                        }
                                        {this.state.loading &&
                                            <Loader/>
                                        }
                                    </div>
                                }
                                {
                                    this.state.filesDropped.map((n, i) => {
                                        return (
                                            <FileDropperEntry
                                                key={n.name}
                                                data={n}
                                                index={i}
                                                metadata={this.state.metadata}
                                                changeMetadata={this.changeMetadata}
                                                closeMetadata={this.closeMetadata}
                                                copyMetadata={this.copyMetadata}
                                                openMetadata={this.openMetadata}
                                            />
                                        )
                                    })
                                }
                            </Paper>
                        </div>
                    )}
                </Dropzone>
                
                <Button disabled={!this.state.readyToUpload} className={classes.button} onClick={() => this.upload()}>UPLOAD</Button>
            </Paper>
          </div>
        )
    }
}

export default withStyles(styles)(FileDropper);