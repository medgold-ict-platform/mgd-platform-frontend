import React, { Component } from 'react'
import { withStyles } from "@material-ui/core/styles";
import {Paper, Button} from '@material-ui/core';
import AWS from 'aws-sdk';
import GetApp from '@material-ui/icons/GetApp';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import Loader from './Loader';


const styles = theme =>  ({
    root: {
      minWidth: "40%"
    },
    paper: {
        margin: 10,
        padding: 10,
        heigth: '50%',
        flex: 1,
        overflowY: "scroll",
        backgroundColor: "#ececec"
    },
    bigButton: {
        width: '100%',
        border: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: "#ececec"
    },
    button: {
      marginTop: '2%',
      marginRight: '2%',
      float: 'right',
      border: '1px solid rgba(0,0,0,0.1)'
    },
    noButton: {
        marginTop: '2%',
        marginRight: '2%',
        float: 'right',
        borderColor: 'rgba(0,0,0,0.0)'
    },
    dropArea:{
        marginTop: '2%',
        marginLeft: '2%',
        width: '96%',
        height: '82%'
    },
    table: {
      minWidth: 250
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
        height: '60%',
        transition: '1s',
    },
    divStop:{
        top: '20%',
        position: 'absolute',
        left: '20%',
        width: '60%',
        height: '60%',
        transition: '1s',
    }
  });

const BUCKET_NAME = "**********"

function wrap(prefix, path, content){
    if(path.length > 0){
        var data = {}
        var newpref = prefix + '/' + path[0]
        
        data[newpref] = wrap(newpref, path.splice(1), content)
        
        return (path.length > 1) ? {isDir: true, folded: true, nextToken: null, content: data} : data
    }
    else{
        return {isDir: true, folded: true, nextToken: null, content: content}
    }
}


class Browse extends Component {

    constructor(props){
        super(props);
        this.state = {
            componentMounted: false,
            fileDropped: '',
            files: {content: {}},
            newContent: [],
            folded: {},
            browseId: this.props.browseId,
            browseName: this.props.browseName,
            directories: this.props.directories,
            loadingFiles: {}
        };
        this.parent = this.props.scope;
        this.handleClickOutside = this.props.handleClickOutside;
        this.handleOperation = this.props.handleOperation;

        
        for(var dir of this.state.directories){
            var years = null
            var ddir = dir.replace("/{%Y}", "")

            if(dir.indexOf("/{%Y}")!==-1){
                years = {}

                for(var y=this.props.start; y<=this.props.end; y++){
                    years[this.state.browseId + ddir + '/' + y] = {isDir: true, content: null}
                    this.state.folded[this.state.browseId + ddir + '/' + y] = true
                }
            }

            var sdir = ddir.split("/").splice(1);
            ddir = sdir.shift();

            var prefix = this.state.browseId + '/' + ddir

            if(sdir.length > 0) years = wrap(prefix, sdir, years)

            if(!(prefix in this.state.files.content)){
                this.state.files.content[prefix] = {isDir: true, folded: true, nextToken: null, content: years}
            }
            else{
                this.state.files.content[prefix].content = {...years, ...this.state.files.content[prefix].content}
            }
            
            this.state.folded[prefix] = true
        }
    }

    componentWillMount(){
        document.addEventListener('mousedown', this.handleClick, false);
    }

    componentWillUnmount(){
        document.removeEventListener('mousedown', this.handleClick, false);
    }

    componentDidMount(){
        setTimeout(() => this.setState({componentMounted: true}), 50)
    }

    handleClick = (e) => {
        if(this.node.contains(e.target)) return;
        this.setState({componentMounted: false})
        setTimeout(() => this.handleClickOutside(), 650)
    }

    download(key){
        var s3 = new AWS.S3();
        s3.getObject({ Bucket: BUCKET_NAME, Key: key },
            (err, data) => {
                if (err){
                    console.log(err);
                } 
                else {
                    var element = document.createElement("a");
                    element.href = URL.createObjectURL(new Blob([data.Body]));
                    element.download = key;
                    element.click();
                }
            }
        );
    }

    handleScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
            //this.loadData()
        }
    }

    loadData(pathParts, rootPath, token=undefined){
        AWS.config.update({
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'eu-west-1:51d4187e-a31b-4d01-8942-420095d40083'
            }),
            region: 'eu-west-1'
        });

        var s3 = new AWS.S3();
        var prefix = rootPath + (pathParts.length ? '/' + pathParts.join('/') : '')

        s3.listObjectsV2(
            {
                Bucket: BUCKET_NAME,
                Prefix: prefix,
                MaxKeys: 100,
                ContinuationToken: token
            }, (err, data) => {
                var loadingFiles = this.state.loadingFiles

                if (err){
                    console.log(err)
                    
                    delete loadingFiles[prefix]
                    this.setState({
                        loadingFiles: loadingFiles
                    })
                }
                else{
                    if (data.Contents.length === 0) {
                        delete loadingFiles[prefix]
                        this.setState({loadingFiles: loadingFiles})
                    }
                    else{
                        var files = this.state.files;
                        files.content = this.updateFiles(this.state.files.content, pathParts, rootPath, (data.IsTruncated ? data.NextContinuationToken : null), data.Contents.map((n) => n.Key).filter((n) => n[n.length-1] !== '/'))

                        delete loadingFiles[prefix]
                        this.setState({
                            loadingFiles: loadingFiles,
                            files: files
                        })
                    }
                }
            }
        )
    }

    updateFiles(file, pathParts, rootPath, nextToken=null, data){
        if(pathParts.length === 0) {
            var content = {}
            file[rootPath].nextToken = nextToken
            for(var n of data){
                content[n] = {isDir: false}
            }
            file[rootPath].content = {...file[rootPath].content, ...content}
        }
        else{
            file[rootPath].content = this.updateFiles(file[rootPath].content, pathParts, rootPath +'/'+pathParts.splice(0,1)[0], nextToken, data)
        }
        return file
    }

    updateFolder = (path, value, token=undefined) => {
        var loadingFiles = this.state.loadingFiles
        loadingFiles[path] = true
        this.setState({loadingFiles: loadingFiles})

        var folded = this.state.folded
        folded[path] = value
        var pathParts = path.split('/');
        var rootPath = pathParts.splice(0, 1).join('/');

        if(!value && (pathParts.length > 1 || this.state.directories.includes('/' + pathParts.join('/')))){
            this.loadData(pathParts, rootPath + '/' + pathParts.splice(0,1)[0], token)
            this.setState({folded: folded})
        }
        else{
            delete loadingFiles[path]
            this.setState({loadingFiles: loadingFiles, folded: folded})
        }
    }

    fileBrowser(dir, classes, i){
        return Object.keys(dir).map((n) => {
            return (
                <div key={n} style={{witdh: '100%', padding: 10}}>
                    <Paper>
                        <div style={{height: 80}}>
                            <div style={{width: '50%', float: 'left', padding: 30}}>{n.split('/')[n.split('/').length - 1]}</div>
                            <div style={{width: '20%', float: 'right', padding: 15}}>
                                {
                                    !dir[n].isDir && 
                                    <Button variant="outlined" onClick={() => this.download(n)} className={classes.button}>
                                        <GetApp />
                                    </Button>
                                }
                                {
                                    dir[n].isDir && (!(n in this.state.folded) || this.state.folded[n]) &&
                                    <Button variant="outlined" onClick={() =>{this.updateFolder(n, false)}} className={classes.noButton}>
                                        <ArrowLeft/>
                                    </Button>
                                }
                                {
                                    dir[n].isDir && n in this.state.folded && !this.state.folded[n] && 
                                    <Button variant="outlined" onClick={() =>{this.updateFolder(n, true)}} className={classes.noButton}>
                                        <ArrowDropDown/>
                                    </Button>
                                }
                            </div>
                        </div>
                        {!this.state.folded[n] && dir[n].isDir && dir[n].content && this.fileBrowser(dir[n].content, classes, i+1)}

                        {dir[n].nextToken && !this.state.folded[n] && 
                            <div style={{witdh: '100%', padding: 10, height: 40}}>
                                <Button variant="outlined" onClick={() => this.updateFolder(n, false, dir[n].nextToken)} className={classes.bigButton}>
                                    MORE
                                </Button>
                            </div>
                        }
                    </Paper>
                    {this.state.loadingFiles[n] && <Loader/>}
                </div>
            )
        })
    }

    render(){
        const { classes } = this.props;

        return (
          <div ref={(node) => {this.node=node}} className={this.state.componentMounted ? classes.divStop : classes.divStart}>
            <Paper className={this.props.className} onClick={this.props.onClick}>
                <div style={{padding: 10}}>
                    <div style={{display: 'block', width: '100%', marginLeft: 10}}><h3>Browsing {this.state.browseName}</h3></div>
                    <div style={{flexDirection: 'row', display: 'flex', height: 400}} onScroll={this.handleScroll}>
                        <Paper className={classes.paper} onClick={this.props.onClick}>
                            {this.fileBrowser(this.state.files.content, classes, 0)}
                        </Paper>
                    </div>
                </div>
            </Paper>
          </div>
        )
    }
}

export default withStyles(styles)(Browse);