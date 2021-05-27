import React from 'react';
import { Button, TextField, MenuItem } from "@material-ui/core"; 
import { withStyles } from "@material-ui/core/styles";
import Loader from './Loader';
import api from '../api/client';


const styles = theme =>  ({
  root: {
    marginTop: 10,
    display:'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: theme.spacing.unit,
    paddingRight:20,
    marginTop: 20
  },
  paper: {
    padding: 20,
    textAlign: 'center',
    width: '30%',
    heigth: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    overflowX: 'auto'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300,
  },
  select: {
    width: 300,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 300,
    maxWidth: 300,
  },
});

class DynamicForm extends React.Component {
    state ={};

    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
          ...props.defaultValues
        };
        
        this.state.loading = false;

        this.state.dbTypes = props.dbTypes ? props.dbTypes : [];
        this.state.models = props.models.models ? props.models.models : [];
        this.state.httpVerbs = props.httpVerbs ? props.httpVerbs : [];
    }

    componentDidMount(){
        this.loadModels()
    }

    loadModels(){
      this.setState({
        "loading": true,
      })
      api.models(0, -1)
      .then(response => {
        
        this.setState({
          models: response.body.models,
          loading: false,
          total: response.body.pagination.totalElements
        })
      })
      .catch(err => {
        this.setState({loading: false});
        console.error(err);
      });
    }

    isInModel(obj) {
      return obj in this.props.model
    }

    onSubmit = (e) => {
        e.preventDefault();
        const formData = {};
        
        for (const field in this.refs) {
          //validation
          if (this.state[field] === undefined) {
            alert('Please fill all fields!');
            return;
          }
          
          //Brutto, ma per ora funziona :-) 
          if (this.state[field] && this.state[field].length > 0 && this.state[field].indexOf('{') > -1 && this.state[field].indexOf('}') > -1) {
            formData[field] = JSON.parse(this.state[field]);
          } else {
            formData[field] = this.state[field];
          }
        }

        if (this.props.onSubmit) this.props.onSubmit(formData, e);
    }

    onChange = (e, key) => {
        this.setState({
          [key]: e.target.value
        })
    }

    goBack() {
      this.props.goBack();
    }

    renderDropDownList(keyword){
        switch(keyword){
            case 'model':
                return Array.from(new Set(this.state.models.map(opt => opt.model_id)))
                    .map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                    ))
            case 'database_type':
                return this.state.dbTypes.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                ))
            case 'http_verb':
                return this.state.httpVerbs.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                ))
            default:
                return
        }
    }


    renderForm = () => {
        let model = this.props.model;
        const { classes } = this.props;
        
        let formUI = model.map((m) => {
            let key = m.key;
            let name= m.label;
            var defaultValue = this.props.defaultValues ? this.props.defaultValues[key] : '';

            if (typeof defaultValue === 'object') {
              defaultValue = JSON.stringify(defaultValue);
            }

            //Is this the right way to render a drop down list? -Riccardo
            let input
            if(m.isList && (!defaultValue || (defaultValue && m.editable))){
              input = <TextField
                select
                ref={key}
                id={key}
                key={key}
                label={name}
                className={classes.textField}
                onChange={(e) => this.onChange(e, key)}
                name={name}
                value={
                  (key === "model") ? 
                    this.state.model : (key === "database_type") ? 
                      this.state.database_type : (key === "http_verb") ? this.state.http_verb : ''
                }
              >
                {this.renderDropDownList(m.key)}
              </TextField>;
            }
            else if (defaultValue && m.editable !== undefined && !m.editable){
              input = <TextField
                disabled
                multiline={m.isDict}
                ref={key}
                key={key}
                id={key}
                label={name}
                className={classes.textField}
                onChange={(e)=>{this.onChange(e, key)}}
                defaultValue={defaultValue}
                margin="normal"
                type={m.isPassword ? 'password' : 'text'}
              />;
            }
            else{
              input = <TextField
                multiline={m.isDict}
                ref={key}
                key={key}
                id={key}
                label={name}
                className={classes.textField}
                onChange={(e)=>{this.onChange(e, key)}}
                defaultValue={defaultValue}
                margin="normal"
                type={m.isPassword ? 'password' : 'text'}
              />;
            }
            return (
                <div key={key}>
                    {input}
                </div>
            );
        });
        return formUI;
    }

    render() {
      const { classes } = this.props;
      if(this.state.loading) {
        return (
          <Loader />
        )
      }
      return (
        <div className={classes.root}>
          <form onSubmit={this.onSubmit}>
           {this.renderForm()}
           <Button variant="outlined" onClick={() => this.goBack()} className={classes.button}>Back</Button>
            <Button variant="outlined" type="submit" className={classes.button}>Save</Button>
          </form>
        </div>
      );
    }
}
export default withStyles(styles)(DynamicForm);
