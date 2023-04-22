/**
 * @module client
 */
import * as crypto from "../crypto"
import Transaction from "../tx"
import HttpRequest from "../utils/request"
import { checkNumber } from "../utils/validateHelper"
import TokenManagement from "../token/"
import Swap from "../swap/"
import Gov from "../gov/"
import Big from "big.js"

const BASENUMBER = Math.pow(10, 8)

export const api = {
  broadcast: "/api/v1/broadcast",
  nodeInfo: "/api/v1/node-info",
  getAccount: "/api/v1/account",
  getMarkets: "/api/v1/markets",
  getSwaps: "/api/v1/atomic-swaps",
  getOpenOrders: "/api/v1/orders/open",
  getDepth: "/api/v1/depth",
  getTransactions: "/api/v1/transactions",
  getTx: "/api/v1/tx"
}

const NETWORK_PREFIX_MAPPING = {
  "testnet": "tbnb",
  "mainnet": "bnb"
}

/**
 * The default signing delegate which uses the local private key.
 * @param  {Transaction} tx      the transaction
 * @param  {Object}      signMsg the canonical sign bytes for the msg
 * @return {Transaction}
 */
export const DefaultSigningDelegate = async function (tx, signMsg) {
  return tx.sign(this.privateKey, signMsg)
}

/**
 * The default broadcast delegate which immediately broadcasts a transaction.
 * @param {Transaction} signedTx the signed transaction
 */
export const DefaultBroadcastDelegate = async function (signedTx) {
  return this.sendTransaction(signedTx)
}

/**
 * The Ledger signing delegate.
 * @param  {LedgerApp}  ledgerApp
 * @param  {preSignCb}  function
 * @param  {postSignCb} function
 * @param  {errCb} function
 * @return {function}
 */
export const LedgerSigningDelegate = (ledgerApp, preSignCb, postSignCb, errCb, hdPath) => async function (
  tx, signMsg
) {
  const signBytes = tx.getSignBytes(signMsg)
  preSignCb && preSignCb(signBytes)
  let pubKeyResp, sigResp
  try {
    pubKeyResp = await ledgerApp.getPublicKey(hdPath)
    sigResp = await ledgerApp.sign(signBytes, hdPath)
    postSignCb && postSignCb(pubKeyResp, sigResp)
  } catch (err) {
    console.warn("LedgerSigningDelegate error", err)
    errCb && errCb(err)
  }
  if (sigResp && sigResp.signature) {
    const pubKey = crypto.getPublicKey(pubKeyResp.pk.toString("hex"))
    return tx.addSignature(pubKey, sigResp.signature)
  }
  return tx
}

/**
 * validate the input number.
 * @param {Array} outputs
 */
const checkOutputs = (outputs) => {
  outputs.forEach(transfer => {
    const coins = transfer.coins || []
    coins.forEach(coin => {
      checkNumber(coin.amount)
      if (!coin.denom) {
        throw new Error("invalid denmon")
      }
    })
  })
}

/**
 * sum corresponding input coin
 * @param {Array} inputs
 * @param {Array} coins
 */
const calInputCoins = (inputs, coins) => {
  coins.forEach((coin) => {
    const existCoin = inputs[0].coins.find(c => c.denom === coin.denom)
    if (existCoin) {
      const existAmount = new Big(existCoin.amount)
      existCoin.amount = Number(existAmount.plus(coin.amount).toString())
    } else {
      inputs[0].coins.push({ ...coin })
    }
  })
}

/**
 * The Binance Chain client.
 */
export class BncClient {
  /**
   * @param {String} server Binance Chain public url
   * @param {Boolean} useAsyncBroadcast use async broadcast mode, faster but less guarantees (default off)
   * @param {Number} source where does this transaction come from (default 0)
   */
  constructor(server, useAsyncBroadcast = false, source = 0) {
    if (!server) {
      throw new Error("Binance chain server should not be null")
    }
    this._httpClient = new HttpRequest(server)
    this._signingDelegate = DefaultSigningDelegate
    this._broadcastDelegate = DefaultBroadcastDelegate
    this._useAsyncBroadcast = useAsyncBroadcast
    this._source = source
    this.tokens = new TokenManagement(this)
    this.swap = new Swap(this)
    this.gov = new Gov(this)
  }

  /**
   * Initialize the client with the chain's ID. Asynchronous.
   * @return {Promise}
   */
  async initChain() {
    if (!this.chainId) {
      const data = await this._httpClient.request("get", api.nodeInfo)
      this.chainId = data.result.node_info && data.result.node_info.network
    }
    return this
  }

  /**
   * Sets the client network (testnet or mainnet).
   * @param {String} network Indicate testnet or mainnet
   */
  chooseNetwork(network) {
    this.addressPrefix = NETWORK_PREFIX_MAPPING[network] || "tbnb"
    this.network = NETWORK_PREFIX_MAPPING[network] ? network : "testnet"
  }

  /**
   * Sets the client's private key for calls made by this client. Asynchronous.
   * @param {string} privateKey the private key hexstring
   * @param {boolean} localOnly set this to true if you will supply an account_number yourself via `setAccountNumber`. Warning: You must do that if you set this to true!
   * @return {Promise}
   */
  async setPrivateKey(privateKey, localOnly = false) {
    if (privateKey !== this.privateKey) {
      const address = crypto.getAddressFromPrivateKey(privateKey, this.addressPrefix)
      if (!address) throw new Error(`address is falsy: ${address}. invalid private key?`)
      if (address === this.address) return this // safety
      this.privateKey = privateKey
      this.address = address
      if (!localOnly) {
        // _setPkPromise is used in _sendTransaction for non-await calls
        try {
          const promise = this._setPkPromise = this._httpClient.request("get", `${api.getAccount}/${address}`)
          const data = await promise
          this.account_number = data.result.account_number
        } catch (e) {
          throw new Error(`unable to query the address on the blockchain. try sending it some funds first: ${address}`)
        }
      }
    }
    return this
  }

  /**
   * Sets the client's account number.
   * @param {boolean} accountNumber
   */
  setAccountNumber(accountNumber) {
    this.account_number = accountNumber
  }

  /**
   * Use async broadcast mode. Broadcasts faster with less guarantees (default off)
   * @param {Boolean} useAsyncBroadcast
   * @return {BncClient} this instance (for chaining)
   */
  useAsyncBroadcast(useAsyncBroadcast = true) {
    this._useAsyncBroadcast = useAsyncBroadcast
    return this
  }

  /**
   * Sets the signing delegate (for wallet integrations).
   * @param {function} delegate
   * @return {BncClient} this instance (for chaining)
   */
  setSigningDelegate(delegate) {
    if (typeof delegate !== "function") throw new Error("signing delegate must be a function")
    this._signingDelegate = delegate
    return this
  }

  /**
   * Sets the broadcast delegate (for wallet integrations).
   * @param {function} delegate
   * @return {BncClient} this instance (for chaining)
   */
  setBroadcastDelegate(delegate) {
    if (typeof delegate !== "function") throw new Error("broadcast delegate must be a function")
    this._broadcastDelegate = delegate
    return this
  }

   /**
   * Applies the default signing delegate.
   * @return {BncClient} this instance (for chaining)
   */
  useDefaultSigningDelegate() {
    this._signingDelegate = DefaultSigningDelegate
    return this
  }
  
  /**
   * Transfer tokens from one address to another.
   * @param {String} fromAddress
   * @param {String} toAddress
   * @param {Number} amount
   * @param {String} asset
   * @param {String} memo optional memo
   * @param {Number} sequence optional sequence
   * @return {Promise} resolves with response (success or fail)
   */
  async transfer(fromAddress, toAddress, amount, asset, memo = "", sequence = null) {
    const accCode = crypto.decodeAddress(fromAddress)
    const toAccCode = crypto.decodeAddress(toAddress)

    amount = new Big(amount)
    amount = Number(amount.mul(BASENUMBER).toString())

    checkNumber(amount, "amount")

    const coin = {
      denom: asset,
      amount: amount,
    }

    const msg = {
      inputs: [{
        address: accCode,
        coins: [coin]
      }],
      outputs: [{
        address: toAccCode,
        coins: [coin]
      }],
      msgType: "MsgSend"
    }

   const signMsg = {
      inputs: [{
        address: fromAddress,
        coins: [{
          amount: amount,
          denom: asset
        }]
      }],
      outputs: [{
        address: toAddress,
        coins: [{
          amount: amount,
          denom: asset
        }]
      }]
    }

    const signedTx = await this._prepareTransaction(msg, signMsg, fromAddress, sequence, memo)
    return this._broadcastDelegate(signedTx)
  }

  /**
   * Create and sign a multi send tx
   * @param {String} fromAddress
   * @param {Array} outputs
   * @example
   * const outputs = [
   * {
   *   "to": "tbnb1p4kpnj5qz5spsaf0d2555h6ctngse0me5q57qe",
   *   "coins": [{
   *     "denom": "BNB",
   *     "amount": 10
   *   },{
    *     "denom": "BTC",
    *     "amount": 10
    *   }]
   * },
   * {
   *   "to": "tbnb1scjj8chhhp7lngdeflltzex22yaf9ep59ls4gk",
   *   "coins": [{
   *     "denom": "BTC",
   *     "amount": 10
   *   },{
    *     "denom": "BNB",
    *     "amount": 10
    *   }]
   * }]
   * @param {String} memo optional memo
   * @param {Number} sequence optional sequence
   * @return {Promise} resolves with response (success or fail)
   */
  async multiSend(fromAddress, outputs, memo = "", sequence = null) {
    if (!fromAddress) {
      throw new Error("fromAddress should not be falsy")
    }
    
    if (!Array.isArray(outputs)) {
      throw new Error("outputs should be array")
    }

    checkOutputs(outputs)

    //sort denom by alphbet and init amount
    outputs.forEach(item => {
      item.coins = item.coins.sort((a, b) => a.denom.localeCompare(b.denom))
      item.coins.forEach(coin => {
        const amount = new Big(coin.amount)
        coin.amount = Number(amount.mul(BASENUMBER).toString())
      })
    })

    const fromAddrCode = crypto.decodeAddress(fromAddress)
    const inputs = [{ address: fromAddrCode, coins: [] }]
    const transfers = []

    outputs.forEach((item) => {
      const toAddcCode = crypto.decodeAddress(item.to)
      calInputCoins(inputs, item.coins)
      transfers.push({ address: toAddcCode, coins: item.coins })
    })

    const msg = {
      inputs,
      outputs: transfers,
      msgType: "MsgSend"
    }

    const signInputs = [{ address: fromAddress, coins: [] }]
    const signOutputs = []

    outputs.forEach((item, index) => {
      signOutputs.push({ address: item.to, coins: [] })
      item.coins.forEach(c => {
        signOutputs[index].coins.push(c)
      })
      calInputCoins(signInputs, item.coins)
    })

    const signMsg = {
      inputs: signInputs,
      outputs: signOutputs
    }

    const signedTx = await this._prepareTransaction(msg, signMsg, fromAddress, sequence, memo)
    return this._broadcastDelegate(signedTx)
  }

  /**
   * Cancel an order.
   * @param {String} fromAddress
   * @param {String} symbol the market pair
   * @param {String} refid the order ID of the order to cancel
   * @param {Number} sequence optional sequence
   * @return {Promise} resolves with response (success or fail)
   */
  async cancelOrder(fromAddress, symbol, refid, sequence = null) {
    const accCode = crypto.decodeAddress(fromAddress)

    const msg = {
      sender: accCode,
      symbol: symbol,
      refid: refid,
      msgType: "CancelOrderMsg"
    }

    const signMsg = {
      refid: refid,
      sender: fromAddress,
      symbol: symbol
    }

    const signedTx = await this._prepareTransaction(msg, signMsg, fromAddress, sequence, "")
    return this._broadcastDelegate(signedTx)
  }

  /**
   * Place an order.
   * @param {String} address
   * @param {String} symbol the market pair
   * @param {Number} side (1-Buy, 2-Sell)
   * @param {Number} price
   * @param {Number} quantity
   * @param {Number} sequence optional sequence
   * @param {Number} timeinforce (1-GTC(Good Till Expire), 3-IOC(Immediate or Cancel))
   * @return {Promise} resolves with response (success or fail)
   */
  async placeOrder(address = this.address, symbol, side, price, quantity, sequence = null, timeinforce = 1) {
    if (!address) {
      throw new Error("address should not be falsy")
    }
    if (!symbol) {
      throw new Error("symbol should not be falsy")
    }
    if (side !== 1 && side !== 2) {
      throw new Error("side can only be 1 or 2")
    }
    if (timeinforce !== 1 && timeinforce !== 3) {
      throw new Error("timeinforce can only be 1 or 3")
    }

    const accCode = crypto.decodeAddress(address)

    if (sequence !== 0 && !sequence) {
      const data = await this._httpClient.request("get", `${api.getAccount}/${address}`)
      sequence = data.result && data.result.sequence
    }

    const bigPrice = new Big(price)
    const bigQuantity = new Big(quantity)

    const placeOrderMsg = {
      sender: accCode,
      id: `${accCode.toString("hex")}-${sequence + 1}`.toUpperCase(),
      symbol: symbol,
      ordertype: 2,
      side,
      price: parseFloat(bigPrice.mul(BASENUMBER).toString(), 10),
      quantity: parseFloat(bigQuantity.mul(BASENUMBER).toString(), 10),
      timeinforce: timeinforce,
      msgType: "NewOrderMsg",
    }
    
