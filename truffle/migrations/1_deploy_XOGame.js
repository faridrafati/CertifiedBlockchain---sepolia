const TicTacToe = artifacts.require("TicTacToe");

module.exports = function (deployer) {
  deployer.deploy(TicTacToe,{value: 1000000000000000});
};
