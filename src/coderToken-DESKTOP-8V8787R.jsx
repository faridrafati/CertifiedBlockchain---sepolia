import React, { Component } from 'react';
import Web3 from 'web3/dist/web3.min';
import {CODER_TOKEN_ABI,CODER_TOKEN_ADDRESS} from './components/Token_config';

class CoderToken extends Component {
    state = { 
        address:'',
        account:'',
        network:'',
        amount:'',
        name:'',
        symbol:'',
        decimals:'',
        balance:'',
        totalSupply:'',
        coderTokenContract:''
    }

    tokenContractHandler = async () => {
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
      const network = await web3.eth.net.getNetworkType();
      const accounts = await web3.eth.getAccounts();
      this.setState({account: accounts[0],network});
      const coderTokenContract = new web3.eth.Contract(CODER_TOKEN_ABI,CODER_TOKEN_ADDRESS);
      this.setState({coderTokenContract});
      const name = (await coderTokenContract.methods.name().call());
      this.setState({name});
      const decimals = (await coderTokenContract.methods.decimals().call());
      this.setState({decimals});
      const symbol = (await coderTokenContract.methods.symbol().call());
      this.setState({symbol});
      const totalSupply = (await coderTokenContract.methods.totalSupply().call());
      this.setState({totalSupply});
      const balance = (await coderTokenContract.methods.balanceOf(this.state.account).call())/10 ** parseInt(decimals);
      this.setState({balance});
  }

    refreshPage = () => {
      this.tokenContractHandler();  
    }

    componentDidMount = () => {
      this.tokenContractHandler();       
    }
    changeHandler = (e) => {
        let {address , amount} = this.state;
        let {name, value} = e.currentTarget;
        name === 'TransferAddress' ? address = value : amount = value;
        this.setState({address, amount});
    } 

    transferHandler = async() => {
      let address = this.state.address;
      let amount = this.state.amount;
      let coderTokenContract = this.state.coderTokenContract;
      let decimals = this.state.decimals;
      for (let i = 0; i < decimals; i++){
        amount = amount+'0';
      }

      await coderTokenContract.methods.transfer(address,amount).send({from: (this.state.account), gas: '1000000'},(error,result) => {
        if(!error){
          console.log("it worked voteForCandidate: " +result);
        }else{
          console.log("err-->"+error);
        }
    
      });
      console.log('voteForCandidate');
      this.refreshPage();
  }
   

 
    render() { 
        let {address, amount} = this.setState;
        return (
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-sm-8 offset-sm-2">
                            <h1 className="text-center">{this.state.name}</h1>
                            <hr />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-6 col-md-4 col-lg-5 offset-sm-3 offset-md-4 offset-lg-4">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="mb-0">My Wallet</h3>
                                </div>
                                <div className="card-body">
                                    <h4>Balance</h4><strong>Balance: </strong><span id="Balance"> {this.state.balance}</span><span id="Balance"> {this.state.symbol}</span>
                                    <br />
                                    <h4>Transfer</h4>
                                    <input 
                                        type="text" 
                                        id="TransferAddress"
                                        name="TransferAddress"  
                                        className="form-control" 
                                        placeholder="Address"
                                        value={address}
                                        onChange={this.changeHandler} />
                                    <input 
                                        type="number" 
                                        id="TransferAmount" 
                                        name="TransferAmount" 
                                        className="form-control" 
                                        placeholder="Amount" 
                                        value={amount}
                                        style={{marginTop: "7px"}}
                                        onChange={this.changeHandler} />
                                    <button 
                                        className="btn btn-primary" 
                                        id="transferButton" 
                                        type="button" 
                                        style={{marginTop: "9px"}}
                                        onClick={this.transferHandler}
                                        >
                                        Transfer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default CoderToken;