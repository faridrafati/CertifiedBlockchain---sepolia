import React from 'react';
import Web3 from 'web3/dist/web3.min';
import {TEST_ABI,TEST_ADDRESS} from './components/testConfig';
import HideShow from './HideShow';
import resetProvider from './resetProvider';
import './components/css/test.css';
import _ from 'lodash';

class Test extends resetProvider {
    state = { 
        web3 : new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network : '',
        account:'',
        Contract:[],
        isMetaMask:'',
        gameCost:'',
        gameActive:'',
        gameValidUntil:'',
        boardSize:'',
        board:'',
        player1:'',
        player2:'',
        zeroAddress:'0x0000000000000000000000000000000000000000',
        blockNumberOfContract:0,
        winNumber: 0,
        looseNumber: 0
    }

    componentDidMount() {
        this.checkMetamask();
        this.tokenContractHandler();
        //this.interval = setInterval(()=>this.clickHandler(3), 1000);
    }


    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(TEST_ABI,TEST_ADDRESS);
        await this.extraInitContract();
    }

    extraInitContract = async () => {
        let {Contract,blockNumberOfContract} = this.state;
        let activePlayer = (await Contract.methods.activePlayer().call());
        let gameValidUntil = (await Contract.methods.gameValidUntil().call());
        let gameActive = (await Contract.methods.gameActive().call());
        let gameCost = (await Contract.methods.gameCost().call());
        let boardSize = (await Contract.methods.boardSize().call());
        let board = (await Contract.methods.getBoard().call());
        let player1 = (await Contract.methods.player1().call());
        let player2 = (await Contract.methods.player2().call());
        let tempBoard=Array(boardSize*boardSize);
        for(let i=0; i<boardSize; i++){
            for(let j=0; j<boardSize; j++){
                tempBoard[boardSize*i+j] = board[i][j];
            }
        }
        let event = await this.getEvents('GameOverWithWin',blockNumberOfContract);
        await this.getGameDetails(event);
        this.setState({activePlayer,gameValidUntil,gameCost,gameActive,boardSize,board:tempBoard,player1,player2});
    }

    getCellClass(index) {
        let {board,player1,player2,zeroAddress} = this.state;
        let className;
        if (board[index] === zeroAddress){
            className= "game-cell";
        } else if (board[index] === player1) {
            className= "game-cell cell-x";
        }else if (board[index] === player2) {
            className="game-cell cell-o";
        }
        return className;
    }
    
    markPosition = async (index) =>{
        let {Contract,board,boardSize,account,activePlayer,gameActive,zeroAddress,blockNumberOfContract} = this.state;
        let x,y;
        x = Math.trunc(index/boardSize);
        y = index % boardSize;
        if((board[index] === zeroAddress)&&(account === activePlayer)&&(gameActive)){
            let TxId='';
            await Contract.methods.setStone(x,y).send({from: (account), gas: '1000000'},(error,result) => {
                if(!error){
                    TxId=result;
                    this.notify('info','setStone is in Progress');
                }else{
                    console.log(error);
                    this.notify('error','setStone is Failed: '+error.message);
                }
            
                });
            this.notify('success','setStone is Done: '+TxId);
            board[index] = account;
            await this.extraInitContract();
        }

        let event = await this.getEvents('GameOverWithWin',blockNumberOfContract);
        await this.getGameDetails(event);
        event = await this.getEvents('GameOverWithDraw',blockNumberOfContract);
        console.log(event);
        this.setState({board});
    }

    changeHandler = (e) => {
        let {value} = e.currentTarget;
        this.setState({inputValue : value});
    }

    clickHandler = async(item) => {
        let {web3,blockNumberOfContract} = this.state;
        let TxId='';
        let {Contract,account} = this.state;
        if(item === 1){
            await Contract.methods.joinGameasPlayer1().send({from: (account), value: web3.utils.toWei('1', "finney"), gas: '1000000'},(error,result) => {
                if(!error){
                    TxId=result;
                    this.notify('info','join Game as Player1 is in Progress');
                }else{
                    console.log(error);
                    this.notify('error','⚠️ join is Failed: '+error.message);
                }
            
            });
        }else if (item === 2) {
            await Contract.methods.joinGameasPlayer2().send({from: (account), value: web3.utils.toWei('1', "finney"), gas: '1000000'},(error,result) => {
                if(!error){
                    TxId=result;
                    this.notify('info','join Game as Player2 is in Progress');
                }else{
                    console.log(error);
                    this.notify('error','⚠️ join is Failed: '+error.message);
                }
            
            });
        }else if (item === 0) {
            await Contract.methods.resetGame().send({from: (account), gas: '1000000'},(error,result) => {
                if(!error){
                    TxId=result;
                    this.notify('info','Resetting Game is in Progress');
                }else{
                    console.log(error);
                    this.notify('error','⚠️ Resetting is Failed: '+error.message);
                }
            });
        }
        let event = await this.getEvents('GameOverWithDraw',blockNumberOfContract);
        console.log(event);
        await this.extraInitContract();
    }

    getEvents = async (eventName,blockNumberOfContract) => {
        let {web3,Contract} = this.state;
        let latest_block = await web3.eth.getBlockNumber();
        let historical_block = blockNumberOfContract;//latest_block - 10000; // you can also change the value to 'latest' if you have a upgraded rpc
        const events = await Contract.getPastEvents(eventName, {
            filter: {}, // Using an array means OR: e.g. 20 or 23
            fromBlock: historical_block,
            toBlock: latest_block
        }, function(error){ 
            if(error){
                console.log(error); 
            }
        });
        return events;
    };

    getGameDetails = async (data_events) => {
        let {account} = this.state;
        let winNumber = 0;
        let looseNumber = 0;
        for (let i = 0; i < data_events.length; i++) {
            let winner = data_events[i]['returnValues']['winner'];
            if (winner === account) {
                winNumber++;
            }else{
                looseNumber++;
            }
        };
        this.setState({winNumber,looseNumber});
    };




    render() {
        let {boardSize,zeroAddress,player1,player2,activePlayer,account,winNumber,looseNumber,gameActive} = this.state;
        let cellsBoardSize = _.range(0,boardSize);
        return (
            <div className = 'container'>
                <section className="bg-light text-center">
                    <h1>TicTacToe Game App</h1>
                    <HideShow 
                        currentAccount = {this.state.currentAccount}
                        contractAddress = {TEST_ADDRESS}
                        chainId = {this.state.chainId}
                    />
                </section>
                <div className='col-6 container d-flex align-items-center justify-content-center'>
                    <h4>
                        {(account === activePlayer)&&(player2 !== zeroAddress)?
                            <span className='badge bg-success'>Its your Turn</span>
                        :(activePlayer !== zeroAddress)&&(player2 !== zeroAddress)?
                            <span className='badge bg-danger'>Its {activePlayer} Turn</span>
                        :<div></div>}
                    </h4>
                    
                </div>
                {(player2 !== zeroAddress)||(player2 !== zeroAddress)?
                <table className='table_xoSmall' >
                    <tbody>
                        <tr>
                            <td className = 'td_xoSmall' >
                                <div 
                                    className={activePlayer === player1 ? 'game-cell cell-x' : activePlayer === player2 ? 'game-cell cell-o' : 'game-cell'} />
                            </td>
                        </tr>
                    </tbody>
                </table>:null}

                <h1>
                    <span className='badge bg-success'>{winNumber}</span> - <span className='badge bg-danger'>{looseNumber}</span>
                </h1>

                <table className='table_xo' id="board">
                    <tbody>
                        {cellsBoardSize.map((row,index)=>(
                            <tr key={index}>
                                {cellsBoardSize.map((col,index)=>(
                                    <td className = 'td_xo' key={index}>
                                        <div 
                                            id={"cell-"+row*boardSize+col} 
                                            onClick={() => this.markPosition(row*boardSize+col)} 
                                            className={this.getCellClass(row*boardSize+col)} />
                                        </td>))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(player2 === zeroAddress)||(player2 === zeroAddress)||(gameActive)?null:
                <div>
                    <h1>This Game is withdraw</h1>
                </div>}
                <div className = 'row'>
                    <div className='col-3'></div>
                    <div className='col-6 container d-flex align-items-center justify-content-center'>
                        {player1 === zeroAddress?
                        <button 
                            className='btn btn-primary' 
                            onClick={()=>this.clickHandler(1)}>
                                Join as Player 1
                        </button>
                        : ((player2 === zeroAddress)&&(player1 !== account))?
                        <button 
                            className='btn btn-success' 
                            onClick={()=>this.clickHandler(2)}>
                                Join as Player 2
                        </button>
                        :((player1 !== zeroAddress)&&((player2 !== zeroAddress)))?
                        <div>
                            <button 
                                className='btn btn-success text-light' 
                                onClick={()=>this.clickHandler(3)}>
                                    Refresh Game
                            </button>
                            <button 
                                className='btn btn-danger text-light' 
                                onClick={()=>this.clickHandler(0)}>
                                    Reset Game
                            </button>
                        </div>

                        :<div></div>}
                    </div>
                    <div className='col-3'></div>
                </div>
            </div>

        );
    }
}
 
export default Test;