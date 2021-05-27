import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import Loader from './Loader';
import AWS from 'aws-sdk';

var Amplify = require('aws-amplify');


const styles = theme => ({
    divStart:{
        top: '-60%',
        position: 'absolute',
        left: '20%',
        'transition': '1s',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        padding: 20,
        width: '60%',
        borderRadius: 5,
        boxShadow: '0px 1px 5px 0px rgba(50,50,50, 0.6)',
      },
      divStop:{
          top: '17%',
          position: 'absolute',
          left: '20%',
          'transition': '1s',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          backgroundColor:'rgba(255, 255, 255, 1)',
          padding: 20,
          width: '60%',
          borderRadius: 5,
          boxShadow: '0px 1px 5px 0px rgba(50,50,50, 0.6)',
      }
  });

const BUCKET_NAME = "medgold-service"

class Query extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            componentMounted: false,
            swagger: {},
            loading: false
        }
        this.handleClickOutside = this.props.handleClickOutside
    }

    componentWillMount(){
        document.addEventListener('mousedown', this.handleClick, false);
    }
    
    componentWillUnmount(){
        document.removeEventListener('mousedown', this.handleClick, false);
    }

    handleClick = (e) => {
        if(this.node.contains(e.target)) return;
        this.setState({componentMounted: false})
        setTimeout(() => this.handleClickOutside(), 650)
    }

    componentDidMount(){
        this.loadData()
    }

    loadData(){
        this.setState({loading: true})

        var credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-1:51d4187e-a31b-4d01-8942-420095d40083'
        })

        AWS.config.update({
            credentials: credentials,
            region: 'eu-west-1'
        });

        var s3 = new AWS.S3()

        s3.getObject({
            Bucket: BUCKET_NAME,
            Key: 'swagger/dev-medgold-api-api-swagger.json'
        }, (err, data) => {
            if(err){
                console.log('Error retrieving swagger.json')
            }
            else{
                this.generateSwagger(JSON.parse(data.Body))
            }
        })
    }

    fillArray(value, len) {
        var arr = [];
        for (var i = 0; i < len; i++) {
            arr.push(value);
        }
        return arr;
    }

    filterParameters(array, toDelete){
        return array.filter((el) => {return !toDelete.includes(el.name)})
    }

    async generateSwagger(swaggerTemp){
        for (var f in swaggerTemp.paths){
            var toDelete = []

            //delete every OPTIONS verb
            delete swaggerTemp.paths[f].options;

            //delete every endpoint which starts with anything different from filters
            if (!this.props.filter.includes(f.split("/")[1])){
                delete swaggerTemp.paths[f]
                continue
            }

            //if this endpoint has a id path parameter
            if (f.includes("dataset/{id}")){
                //create a key with an hardcoded endpoint containing the queried ID
                var key = f.replace("{id}", this.props.queriedId)
                toDelete.push("id")
                var keys = [key]
                
                //check if endpoint contains other path parameters
                for (var param in this.props.params){
                    if (f.includes('{'+param+'}')){
                        toDelete.push(param)
                        var tempKeys = []

                        //copy the endpoint for each value of this path param
                        for (var k of keys){
                            tempKeys.push(...this.fillArray(k, this.props.params[param].length))
                        }
                        keys = tempKeys
                        
                        //set the correct value of param for each new endpoint
                        for (var i=0; i<this.props.params[param].length; i++){
                            keys[i] = keys[i].replace('{'+param+'}', this.props.params[param][i].id)
                        }
                    }
                }
                
                //for each verb of this resource
                for(var verb in swaggerTemp.paths[f]){
                    //filter each path param that was hardcoded
                    if (swaggerTemp.paths[f][verb].parameters){
                        var parameters = this.filterParameters(swaggerTemp.paths[f][verb].parameters, toDelete)
                        if (!parameters.length){
                            delete swaggerTemp.paths[f][verb].parameters
                        }
                        else{
                            swaggerTemp.paths[f][verb].parameters = parameters
                        }
                    }
                }

                //for each resource that targets a workflow, inject its input variables
                for (var k1 of keys){
                    swaggerTemp.paths[k1] = swaggerTemp.paths[f]

                    if(f.includes('{wf}')){
                        var p = f.replace('{id}', this.props.queriedId).split('{wf}')
                        var wfName = k1.replace(p[0], '').replace(p[1], '')

                        for(var par of this.props.params.wf){
                            if(par.id === wfName){
                                for(verb in swaggerTemp.paths[k1]){
                                    if (!swaggerTemp.paths[k1][verb].parameters){
                                        swaggerTemp.paths[k1][verb].parameters = []
                                    }

                                    for(var v in par.query_params){
                                        swaggerTemp.paths[k1][verb].parameters.push(
                                            {
                                                "name": v,
                                                "in": "query",
                                                "required": true,
                                                "type": "string"
                                            }
                                        )
                                    }
                                }

                                break;
                            }
                        }
                    }
                }
                delete swaggerTemp.paths[f]
            }
        }

        const session = await Amplify.Auth.currentSession()

        if(session){
            var token = session.idToken.jwtToken;
            
            setTimeout(() => this.setState({
                token: token,
                swagger: swaggerTemp,
                componentMounted: true,
                loading: false
            }), 25)
        }
        else{
            setTimeout(() => this.setState({
                loading: false
            }), 25)
        }
    }

    render(){
        const { classes } = this.props;

        return (
            <div ref={(node) => {this.node=node}} className={this.state.componentMounted ? classes.divStop : classes.divStart}>
                <div style={{height: 500, overflowY: 'auto'}}>
                    {!this.state.loading &&
                        <SwaggerUI 
                            spec={this.state.swagger} 
                            requestInterceptor={
                                (request) => {
                                    request.headers.Authorization = this.state.token;
                                    return request;
                                }
                            } 
                        />
                    }
                    {this.state.loading && <Loader/>}
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(Query);