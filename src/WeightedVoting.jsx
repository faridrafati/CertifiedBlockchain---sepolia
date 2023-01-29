import React from 'react';
import Web3 from 'web3/dist/web3.min';
import 'bootstrap/dist/css/bootstrap.min.css';
import {WEIGHTED_VOTING_TOKEN_ABI,WEIGHTED_VOTING_TOKEN_ADDRESS} from './components/WeightedVotingConfig';
import resetProvider from './resetProvider';
import HideShow from './HideShow';
class WeightedVoting extends resetProvider{
    state = {

        web3:new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network:'',
        account:'',
        Contract:[],
        isMetaMask:'', 
        input:"",
        candidatesList:[
            {name:'',voteCount:''},
            {name:'',voteCount:''},
            {name:'',voteCount:''},
        ],
        accountBid:'',
    }

    componentDidMount = () => {
        this.checkMetamask();
        this.tokenContractHandler();
    }
    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(WEIGHTED_VOTING_TOKEN_ABI,WEIGHTED_VOTING_TOKEN_ADDRESS);
        await this.extraInitContract();
    }
    
    extraInitContract = async () => {
        let {Contract,candidatesList} = this.state;
        let list= await Contract.methods.getAllCandidatesWithVotes().call();
        for (let i=0 ; i<3 ; i++){
            candidatesList[i].name=list[2*i];
            candidatesList[i].voteCount=list[2*i+1];
        }
        this.setState({candidatesList});
    }

    getCandidatesList = async () => {
        let {candidatesList,Contract} = this.state;
        let list= await Contract.methods.getAllCandidatesWithVotes().call();
        for (let i=0 ; i<3 ; i++){
            candidatesList[i].name=list[2*i];
            candidatesList[i].voteCount=list[2*i+1];
        }
       return candidatesList;
    }




    authorizeVoter = async (e) => {
        let TxId = '';
        e.preventDefault();
        let {account,input,Contract} = this.state;
        await Contract.methods.authorizeVoter(input).send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Authorizing is in Progress');
              }else{
                console.log(error);
                this.notify('error','Authorizing is Failed: '+error.message);
              }
          
            });
        await this.extraInitContract();
        this.notify('success','Authorizing is Done: '+TxId);
    }

    voteForCandidate = async(index) => {
        let TxId = '';
        let {account,Contract} = this.state;
        await Contract.methods.voteForCandidate(index).send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Voting is in Progress');
              }else{
                console.log(error);
                this.notify('error','Voting is Failed: '+error.message);
              }
          
            });
        await this.extraInitContract();
        this.notify('success','Voting is Done: '+TxId);
    }

    inputHandler = (e) => {
        let input = this.state.input;
        input = e.currentTarget.value;
        this.setState({input});
    }


    render() { 
        let {candidatesList,owner,account,input} = this.state;
        return (
            <div className='container'>
                <section className="bg-light text-center">
                    <h1>Weighted Voting Contract</h1>
                    <HideShow 
                        currentAccount = {this.state.currentAccount}
                        contractAddress = {WEIGHTED_VOTING_TOKEN_ADDRESS}
                        chainId = {this.state.chainId}
                        owner = {owner}
                    />
                </section>
                <hr />
                {(owner === account)?<div className="container">

                    <div id="votersRow" className="row">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Candidate Names</th>
                                    <th scope="col">Votes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                candidatesList.map((candidate,index)=>(
                                    <tr key={index}>
                                        <th scope="row">{index}</th>
                                        <td>{candidate['name']}</td>
                                        <td>{candidate['voteCount']}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="form-authorize">
                        <label htmlFor="usr">Authorized Voter Address:</label>
                        <input type="text" className="form-control" id="address" value={input} onChange = {this.inputHandler} style={{marginBottom:'10px'}}/>
                        <button type="button" className="btn btn-primary" onClick={this.authorizeVoter} >Authorize</button>
                    </div>
                </div>:


                <div id="votingTemplate">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Candidate Names</th>
                                <th scope="col">Votes</th>
                                <th scope="col">Vote</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                            candidatesList.map((candidate,index)=>(
                                <tr key={index}>
                                    <th scope="row">{index}</th>
                                    <td>{candidate['name']}</td>
                                    <td>{candidate['voteCount']}</td>
                                    <td><button className='btn btn-primary' onClick={()=>this.voteForCandidate(index)}>VOTE</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>
            
        );
    }
}
 
export default WeightedVoting;