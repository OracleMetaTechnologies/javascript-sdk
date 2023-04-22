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
