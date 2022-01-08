let dashcore = require('@dashevo/dashcore-lib');
const got = require('got');
var sender = 'yTYZjnTuepHbVAcoWq4g7f5teXru4KSJMa'
var receiver = 'yNpEzKCvS2Vn3WYhXeG11it5wEWMButDvq'
var senderPrivatekey = 'ce479af60e74653d9b8f0f09ec00dbd5ec0b60b8e4d0463d392e0dac60cf77f3'
let token = '8PGdgeEbzxm7SvMWdM4MBIJU5lvnL2w7'

let utxo_url = `https://api.chainrider.io/v1/dash/testnet/addr/${receiver}/utxo?token=${token}`
let testNetUrl1 = "https://api.chainrider.io/v1/dash/testnet/addr/yTYZjnTuepHbVAcoWq4g7f5teXru4KSJMa/utxo?token=8PGdgeEbzxm7SvMWdM4MBIJU5lvnL2w7"
let testNetUrl2 = "https://api.chainrider.io/v1/dash/testnet/addr/yNpEzKCvS2Vn3WYhXeG11it5wEWMButDvq/utxo?token=8PGdgeEbzxm7SvMWdM4MBIJU5lvnL2w7"
let send_amount = 20000

let headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'json': true
}

get_sender_unspent_transactions()

async function get_sender_unspent_transactions() {
    try {
        //Get the transactions with the given sender
        const transactionsResponse = await got(utxo_url);

        var utxos = JSON.parse(transactionsResponse.body);

        //Find transactions where satoshis available (unspent) should be greater than the send_amount (20000) + the fee
	  for (let utxo of utxos) {
		if (utxo.satoshis > 20000) {
		  console.log("Found transaction with greater than 20000 satoshis unspent.")
		  send_transaction(utxo);
		  break;
		}
	  }
        
    } catch (error) {
        console.log(error.message);
    }
}

async function send_transaction(utxo) {

    // Create a transaction using the {dashcore} library
      try {
        var transaction = new dashcore.Transaction() 
        .from(utxo)          // Feed information about what unspent outputs one can use
        .to(receiver, send_amount)  // Add an output with the given amount of satoshis
        .change(sender)      // Set up a change address where the rest of the funds will go
        .sign(senderPrivatekey) // Sign all the inputs it can

        var rawtx = transaction.serialize();
        console.log(rawtx);
      
        // Use the ChainRider testneturl and token to send the raw transaction
        (async () => {
          const {body} = await got.post('https://api.chainrider.io/v1/dash/testnet/tx/send', {json: {token:token,rawtx:rawtx}, responseType: 'json', headers:headers});      
          console.log(body.txid);
      })();

    } catch (error) {
      console.log(error.message);
  }
}