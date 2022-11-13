"use strict";
const React = require('react');
const { Text, Box, useInput, Newline } = require("ink");
const TextInput = require("ink-text-input").default;

const App = ({name = 'Stranger'}) => {
	const dummyInputData = []
	const {useEffect, useState} = React;
	const [currentName, setCurrentName] = useState('stranger');
	const [inputFields, setInputFields] = useState({});
	const [currentInput, setCurrentInput] = useState('');
	const [error, setError] = useState('');

	useInput((input, key) => {
		if(key.return) {
			updateDataInState(currentInput)
		}

	});


	const getData = (name) => {
		name = name || currentName;
		return inputFields[name];
	}
	const createNewNameData = (obj) => {
		const{ name, balance = 0, owedMoney=0, owedFrom= ''} = obj;
		 return {
			[name] : {
				inputData: [{
					inputType: 'login',
					inputText: `login ${name}`,
					outputText: `Hello, ${name}! \nYour balance is ${balance}`
				}],
				balance:balance,
				owedMoney: owedMoney,
				owedTo: '',
				owedFrom: owedFrom,
			}
		}
		}


	const  updateDataInState = (inputStr) => {
		setError('')
		let getDataFromState;
			if(inputStr.includes('login')) {
				const name = inputStr.split(' ')[1]
				if(!name) {
					return ;
				}
				const getDataFromState = getData(name)

				if(!getDataFromState) {
					const createdData = createNewNameData({name}) ;
					setInputFields({...inputFields, ...createdData})


				} else {
					const {owedMoney, owedFrom,
						inputData = []} = getDataFromState
					getDataFromState.inputData = [
						{
							inputType: 'login',
							inputText: inputStr,
							outputText: `Hello, ${name}! \nYour balance is ${getDataFromState.balance}\nOwed ${owedMoney} from ${owedFrom}`
						}]
					setInputFields({...inputFields, ...getDataFromState})
				}
				setCurrentName(name)
				setCurrentInput('')
				return 1;
			}
			else if(inputStr.includes('logout')) {
				getDataFromState =  getData()
				const {inputData = []} = getDataFromState;
				const updatedData = [...inputData,
					{
						inputType: 'logout',
						inputText: inputStr,
						outputText: `Goodbye, ${currentName}!`
					}]
				if(!getDataFromState) {
					return
				}
				getDataFromState.inputData = updatedData;
				setInputFields({...inputFields, ...getDataFromState})
				setCurrentInput('')
				return 1;
			}
			else if(inputStr.includes('deposit')) {
				const depositAmount = Number(inputStr.split(' ')[1])
				getDataFromState = getData()
				getDataFromState.balance += depositAmount;
				const {inputData = []} = getDataFromState;
				const updatedData = [...inputData,
					{
						inputType: 'deposit',
						inputText: inputStr,
						outputText: `Your balance is ${getDataFromState.balance}`
					}]
				if(!getDataFromState) {
					return
				}
				getDataFromState.inputData = updatedData;

				setInputFields({...inputFields, ...getDataFromState})
				setCurrentInput('')
				return 1;
			}
			else if(inputStr.includes('transfer')) {
				const transfereeName = inputStr.split(' ')[1]
				const transferAmt = Number(inputStr.split(' ')[2]);
				getDataFromState = getData()
				let getDataFromStateForTransfer = getData(transfereeName)
				const netBalance = getDataFromState.balance -transferAmt;
				let outputText;
				if(netBalance <0) {
					getDataFromState.balance = 0;
					getDataFromState.owedMoney = Math.abs(netBalance);
					getDataFromState.owedTo = transfereeName;
					outputText = `Transferred $${transferAmt} to ${transfereeName}\nyour balance is $0\nOwed ${-netBalance} to ${transfereeName}`
				} else {
					getDataFromState.balance = netBalance;
					outputText = `Transferred $${transferAmt} to ${transfereeName}\nyour balance is $${netBalance}`
				}
				const {inputData = []} = getDataFromState;
				const updatedData = [...inputData,
					{
						inputType: 'transfer',
						inputText: inputStr,
						outputText: outputText
					}]
				getDataFromState.inputData = updatedData
				if(!getDataFromStateForTransfer) {

					getDataFromStateForTransfer = createNewNameData(
						{
							name:transfereeName,
							balance:transferAmt,
							...(netBalance <0 ? {owedMoney : Math.abs(netBalance),
								owedFrom: currentName} : {})
						}) ;

				} else {
					getDataFromStateForTransfer.balance += transferAmt
					if(netBalance < 0) {
						getDataFromStateForTransfer.owedMoney = Math.abs(netBalance)
						getDataFromStateForTransfer.owedFrom = currentName
					}
				}
				setInputFields({...inputFields, ...getDataFromStateForTransfer,
				...getDataFromStateForTransfer})
				setCurrentInput('')
				return 1;
			} else {
				setCurrentInput('')
				setError('Invalid input, Enter again')
			}
	}

	const currentData = getData();
	return (
		<Box flexDirection={'column'}>
			<Box flexDirection={'column'}>
			{currentData?.inputData?.map((field, index)=> {
				return(
					<Box flexDirection={'column'}
						 key={index}>
						<Text>
							{field.inputText}
						</Text>
						<Text>
							{field.outputText}
						</Text>
						<Newline />
					</Box>
				)
			})}
			</Box>
			<Box flexDirection={'column'}>
				{error ? <Text>{error}</Text>: null}
				<TextInput
					placeholder={''}
					value={currentInput}
					onChange={setCurrentInput}
				/>
			</Box>
		</Box>
	)
};

module.exports = App;
