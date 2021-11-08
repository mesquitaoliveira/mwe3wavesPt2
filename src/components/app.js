import ReactDOM from "react-dom";
import React from 'react';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.authFunc = this.authFunc.bind(this);
    }
    authFunc() {
        const authData = { data: "Autenticar meu Site" };
        if (WavesKeeper) {
            WavesKeeper.auth( authData )
            .then(auth => {
                console.log( auth ); //exibe o resultado no console
                /*...processing data */
            }).catch(error => {
                console.error( error ); // exibe o resultado no console
                /*...processing errors */
            })
        } else {
            alert("Para autenticar o WavesKeeper precisa estar instalado.");
        }
    }
    render() {
        return (
            <div className="container">
    		    <input className="btn btn-primary" type="submit" value="Auth" onClick={this.authFunc}/>
    	    </div>
        )
    }
}

const app = document.getElementById('app');
if(app){
    ReactDOM.render(<App/>, app);
}