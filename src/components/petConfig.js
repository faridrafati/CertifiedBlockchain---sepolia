export const PET_CONTRACT_ADDRESS = '0x3e2f28AF811465aDD84345429b0Bd6Cf082DD73A'; //'0xFFA27b01c0509bf57D92C49689e0Da0C778aE4EA';
export const PET_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_petId",
				"type": "uint256"
			}
		],
		"name": "adopt",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "adoptors",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAdoptors",
		"outputs": [
			{
				"internalType": "address[16]",
				"name": "",
				"type": "address[16]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]