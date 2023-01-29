import React from 'react';
import './components/css/chatBox.css';
import userProfilePic from './components/images/user-profile.png';
import Web3 from 'web3/dist/web3.min';
import {CHAT_TOKEN_ABI,CHAT_TOKEN_ADDRESS} from './components/ChatConfig';
import resetProvider from './resetProvider';
import HideShow from './HideShow';
class ChatBox extends resetProvider {
    state = {
        web3:new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network:'',
        account:'',
        Contract:'',
        isMetaMask:'',
        owner:'',
        registeredUsersAddress:[],
        balance: 0,
        status:'',
        myInboxSize : 0,
        myOutboxSize: 0,
        selectedAddress:'',
        display: 'none',
        contacts: [
            { address: "0x350E98bEa1Cdbc5189F443E13D8ef4324e392B53", name: "Farid" },
            { address: "0x98C3CF43ce4FFc6d2Ec25402022fE12d95e3078F", name: "Reza" }
        ],
        messages: [
            {from:"0x350E98bEa1Cdbc5189F443E13D8ef4324e392B53",message:"Test which is a new approach to have all solutions 1",time:'11:01 AM | June 9'},
            {from:"0x5F873c07ED0A2668b9F36cE6F162f0E24a6a153f",message:"Test which is a new approach to have all solutions 2",time:'11:02 AM | June 9'},
            {from:"0x350E98bEa1Cdbc5189F443E13D8ef4324e392B53",message:"Test, which is a new approach to have 3",time:'11:01 AM | Yesterday'},
            {from:"0x5F873c07ED0A2668b9F36cE6F162f0E24a6a153f",message:"Apollo University, Delhi, India Test",time:'11:01 AM | Today'},
            {from:"0x350E98bEa1Cdbc5189F443E13D8ef4324e392B53",message:"We work directly with our designers and suppliers, and sell direct to you, which means quality, exclusive products, at a price anyone can afford.",time:'11:04 AM | Today'},
        ],
        chatListClass:''
    }

    getContractProperties = async () => {
        let {Contract} = this.state;
        let contractProperties = await Contract.methods.getContractProperties().call();
        let owner = contractProperties[0];
        let registeredUsersAddress = contractProperties[1];      
        this.setState({owner, registeredUsersAddress});
    }

    checkUserRegistration = async() => {
        let {account, Contract,status} = this.state;
        if(await Contract.methods.checkUserRegistration().call({from:account})) {
            status = 'User has been registered';
        }else{
            status = 'You are new User you need to be registered now';
            this.setState({status});
            if (window.confirm("New user: we need to setup an inbox for you on the Ethereum blockchain. For this you will need to submit a transaction in MetaMask. You will only need to do this once.")) {
                this.registerUser();
              } else {
                return null;
           }
        } 
        this.setState({status});  
    }
    extraInitContract = async () => {
        await this.getContractProperties();
        await this.checkUserRegistration();
        await this.getMyInboxSize();
        await this.getMySentBoxSize();
    }

    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(CHAT_TOKEN_ABI,CHAT_TOKEN_ADDRESS);
        await this.extraInitContract();
    }
    componentDidMount = () => {
        this.checkMetamask();
        this.tokenContractHandler();
    }


    registerUser = async () => {
        let TxId='';
        let {account, Contract,status} = this.state;
        if(status !=='User has been registered'){
            status = "User registration:(open MetaMask->submit->wait)";
            await Contract.methods.registerUser().send({from: (account), gas: '1000000'},(error,result) => {
                if(!error){
                    TxId=result;
                    this.notify('info','Registration is in Progress');
                  }else{
                    console.log(error);
                    this.notify('error','Registration is Failed: '+error.message);
                  }
              
                });
            this.notify('success','Registration is Done: '+TxId);
            await this.extraInitContract();
            var gasUsedWei = Contract.receipt.gasUsed;
            status = ("User is registered...gas spent: " + gasUsedWei + "(Wei)");
            alert("A personal inbox has been established for you on the Ethereum blockchain. You're all set!");
            this.setState({status});
        }
    }

    getMyInboxSize = async () => {
        let {account, Contract, myInboxSize,display} = this.state;
        let value = await Contract.methods.getMyInboxSize().call({from: account});
        myInboxSize = value[1];
        this.setState({myInboxSize});
        if (myInboxSize > 0) {
            display = "inline";
            this.setState({display});
            return this.receiveMessages();
        } /*else {
            display = "none";
            this.setState({display});
            return null;
        }*/
    }

    getMySentBoxSize = async () => {
        let {account, Contract, myOutboxSize,display} = this.state;
        let value = await Contract.methods.getMyInboxSize().call({from: account});
        myOutboxSize = value[0];
        this.setState({myOutboxSize});
        if (myOutboxSize > 0) {
            display = "inline";
            this.setState({display});
            return this.sentMessages();
        } /*else {
            display = "none";
            this.setState({display});
            return null;
        }*/
    }

    sendMessage = async () => {
        let TxId='';
        let {web3,Contract} = this.state;
        var receiver = document.getElementById("receiver").value;
        if (receiver === "") {
          this.setState({status: "Send address cannot be empty"});
          return null;
        }
        if (!web3.utils.isAddress(receiver)) {
            this.setState({status: "You did not enter a valid Ethereum address"});
          return null;
        }
        var newMessage = document.getElementById("message").value;
        if (newMessage === "") {
            newMessage = 'hello'
            this.setState({status: "Oops! Message is empty"});
          //return null;
        }
        newMessage = web3.utils.fromAscii(newMessage);
        document.getElementById("message").value = "";
        document.getElementById("sendMessageButton").disabled = true;
        this.setState({status: "Sending message:(open MetaMask->submit->wait)"});


        await Contract.methods.sendMessage(receiver, newMessage).send({from: (this.state.account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                var gasUsedWei = result.receipt.gasUsed;
                document.getElementById("message").value = "";
                this.notify('info','Sending Message is in Progress (Gas spent: ' + gasUsedWei + " Wei");
            }else{
                console.log(error);
                this.notify('error','Sending Message is Failed: '+error.message);
            }
        });
        this.notify('success','Sending Message is Done: '+TxId);
        await this.extraInitContract();
        }
    clearInbox = async () => {
        let TxId='';
        let {Contract,account} = this.state;
        await Contract.methods.clearInbox().send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Clearing Inbox is in Progress');
              }else{
                console.log(error);
                this.notify('error','Clearing Inbox is Failed: '+error.message);
              }
            });
        this.notify('success','Clearing Inbox is Done: '+TxId);
        await this.extraInitContract();
        var clearInboxButton = document.getElementById("clearInboxButton");
        clearInboxButton.parentNode.removeChild(clearInboxButton);
      //  $("#mytable tr").remove();
        document.getElementById("receivedTable").style.display = "none";
        alert("Your inbox was cleared");
        this.setState({status: "Inbox cleared"});
    }

    receiveMessages = async () => {
        let {web3,Contract,account,myInboxSize} = this.state;
        let value = await Contract.methods.receiveMessages().call({}, {from: account});
          var content = (value[0]);
          var timestamp = value[1];
          var sender = value[2];

          for (var m = 0; m < myInboxSize; m++) {
            var tbody = document.getElementById("mytable-receive");
            var row = tbody.insertRow();
            var cell1 = row.insertCell();
            let date = new Date(parseInt(timestamp[m])).toLocaleDateString("en-US");
            let time = new Date(parseInt(timestamp[m])).toLocaleTimeString("en-US");
            cell1.innerHTML = date+"<br />" +time; 
            var cell2 = row.insertCell();
            cell2.innerHTML = sender[m];
            var cell3 = row.insertCell();
    
            var thisRowReceivedText = content[m].toString();
            var receivedAscii = web3.utils.toAscii(thisRowReceivedText);
            cell3.innerHTML = receivedAscii;
            cell3.hidden = false;
          }
          var table = document.getElementById("mytable");
          var rows = table.rows;
          for (var i = 1; i < rows.length; i++) {
            rows[i].onclick = (function(e) {
              var thisRowContent = (this.cells[2].innerHTML);
              document.getElementById("reply").innerHTML = thisRowContent;
              document.getElementById("receiver").value = this.cells[1].innerHTML;
            });
        }
    }

    sentMessages = async () => {
        let {web3,Contract,account,myOutboxSize} = this.state;
        let value = await Contract.methods.sentMessages().call({}, {from: account});
        var content = (value[0]);
        var timestamp = value[1];
        var receiver = value[2];

        for (var m = 0; m < myOutboxSize; m++) {
            var tbody = document.getElementById("mytable-sent");
            var row = tbody.insertRow();
            var cell1 = row.insertCell();
            let date = new Date(parseInt(timestamp[m])).toLocaleDateString("en-US");
            let time = new Date(parseInt(timestamp[m])).toLocaleTimeString("en-US");
            cell1.innerHTML = date+"<br />" +time; 
            var cell2 = row.insertCell();
            cell2.innerHTML = receiver[m];
            var cell3 = row.insertCell();

            var thisRowReceivedText = content[m].toString();
            var receivedAscii = web3.utils.toAscii(thisRowReceivedText);
            cell3.innerHTML = receivedAscii;
            cell3.hidden = false;
        }

        var table = document.getElementById("mytable");
        var rows = table.rows;

        for (var i = 1; i < rows.length; i++) {
            rows[i].onclick = (function(e) {
                var thisRowContent = (this.cells[2].innerHTML);
                document.getElementById("reply").innerHTML = thisRowContent;
                document.getElementById("receiver").value = this.cells[1].innerHTML;
            });
        }
    }

    
    copyAddressToSend = () => {
        var sel = document.getElementById("registeredUsersAddressMenu");
        var copyText = sel.options[sel.selectedIndex];
        document.getElementById("receiver").value = copyText.innerHTML;
        this.setState({selectedAddress:copyText.innerHTML});
    }

    replyToMessage = () => {
        console.log( this.state.replyToAddress);
    }

   render() {
        let {contacts,messages,chatListClass,account} = this.state;
        chatListClass = 'chat_list';
        return (
        <div className="container">
            <h3 className=" text-center">Messaging</h3>
            <div className="messaging">
                <div className="inbox_msg">
                    <div className="inbox_people">
                        <div className="headind_srch">
                            <div className="recent_heading">
                                <h4>Recent</h4>
                            </div>
                            <div className="srch_bar">
                                <div className="stylish-input-group">
                                    <input type="text" className="search-bar"  placeholder="Search" />
                                    <span className="input-group-addon">
                                        <button type="button"> 
                                            <i className="fa fa-search" aria-hidden="true"></i> 
                                        </button>
                                    </span> 
                                </div>
                            </div>
                        </div>
                        <div className="inbox_chat">
                            {contacts.map((contact)=>(
                                <div className="chat_list">
                                    {/*active_chat*/}
                                    <div className="chat_people">
                                        <div className="chat_img"> <img src={userProfilePic} alt={contact.name} /> </div>
                                        <div className="chat_ib">
                                            <h5>{contact.name}<span className="chat_date">Online</span></h5>
                                            <p>{contact.address}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mesgs">
                    <div className="msg_history">
                        { messages.map((message) =>(
                            message.from === account ?
                            
                                <div className="outgoing_msg">
                                    <div className="sent_msg">
                                        <p>{message.message}</p>
                                        <span className="time_date">{message.time}</span> 
                                    </div>
                                </div>
                            :
                                <div className="incoming_msg">
                                    <div className="incoming_msg_img"> <img src={userProfilePic} alt={contacts.name} /> </div>
                                    <div className="received_msg">
                                        <div className="received_withd_msg">
                                            <p>{message.message}</p>
                                            <span className="time_date">{message.time}</span>
                                        </div>
                                    </div>
                                </div>
                        ))}

                    </div>
                    <div className="type_msg">
                        <div className="input_msg_write">
                        <input type="text" className="write_msg" placeholder="Type a message" />
                        <button className="msg_send_btn" type="button"><i className="fa fa-paper-plane-o" aria-hidden="true"></i></button>
                        </div>
                    </div>
                    </div>
                </div>
                
                
                <p className="text-center top_spac"> Design by <a target="_blank" href="https://www.linkedin.com/in/sunil-rajput-nattho-singh/">Sunil Rajput</a></p>
                
                </div></div>

        );
    }
}
 
export default ChatBox;