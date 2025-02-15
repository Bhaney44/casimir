<template>
  <div>
    <div class="flex">
      <button @click="getCurrentBalance()">
        Get Balance New
      </button>
      <button @click="getUserBalance(selectedAddress)">
        Get Balance Old
      </button>
    </div>
    <div class="network-div w-100 mx-8">
      Choose Network
      <div class="choose-network flex">
        <button
          @click="switchNetwork('5')"
        >
          Switch MetaMask to Goerli Network
        </button>
        <button
          class="iopay-btn"
          @click="switchNetwork('4690')"
        >
          Switch MetaMask to IoTeX Network
        </button>
      </div>
    </div>
    <div>
      <h5>Are you logged in?</h5>
      <div>{{ loggedIn ? 'Yes!' : 'No.' }}</div>
      <h5>Primary Account:</h5>
      <div>{{ primaryAddress ? primaryAddress : 'Please log in first.' }}</div>
      <button @click="setPrimaryWalletAccount()">
        Set Primary Account
      </button>
      <button @click="logout">
        logout
      </button>
    </div>
    <div>
      <button
        class="btn-save-remove-account"
        @click="removeConnectedAccount()"
      >
        Remove Account
      </button>
    </div>
    <div class="staking-container">
      <button @click="getUserPools(selectedAddress)">
        What do I have staked where?
      </button>
      <ul>
        <li
          v-for="(pool, index) in pools"
          :key="index"
        >
          <p>Pool ID: #{{ pool.id }}</p>
          <p>Your Stake: {{ pool.userStake }} ETH</p>
          <p>Your Rewards: {{ pool.userRewards }} ETH</p>
          <p>Total Stake: {{ pool.totalStake }} ETH</p>
          <p>Total Rewards: {{ pool.totalRewards }} ETH</p>
        </li>
      </ul>
      <input
        v-model="amountToStake"
        placeholder="Amount to Stake"
      >
      <button @click="deposit">
        Steak
      </button>
    </div>
    <div class="connect-wallet-container">
      <div class="metamask-div">
        <button @click="connectWallet('MetaMask')">
          {{ metamaskButtonText }}
        </button>
        <p>
          Connected Metamask Account:
          <span> {{ metamaskAccountsResult }} </span>
        </p>
      </div>
      <div class="coinbase-div">
        <button
          class="coinbase-btn"
          @click="connectWallet('CoinbaseWallet')"
        >
          {{ coinbaseButtonText }}
        </button>
        <p>
          Connected Coinbase Account:
          <span> {{ coinbaseAccountsResult }} </span>
        </p>
      </div>
      <div class="phantom-div">
        <button
          class="phantom-btn"
          @click="connectWallet('Phantom')"
        >
          {{ phantomButtonText }}
        </button>
        <p>
          Connected phantom Account:
          <span> {{ phantomAccountsResult }} </span>
        </p>
      </div>
      <div class="ledger-div">
        <button
          class="ledger-btn"
          @click="connectWallet('Ledger', 'BTC')"
        >
          {{ ledgerButtonText }} (Using 'bitcoin' app)
        </button>
        <button
          class="ledger-btn"
          @click="connectWallet('Ledger', 'ETH')"
        >
          {{ ledgerButtonText }} (Using 'ethereum' app)
        </button>
        <p>
          Connected Ledger Account:
          <span> {{ ledgerAccountsResult }} </span>
        </p>
      </div>
      <div class="trezor-div">
        <button
          class="trezor-btn"
          @click="connectWallet('Trezor')"
        >
          {{ trezorButtonText }}
        </button>
        <p>
          Connected Trezor ETH Account:
          <span> {{ trezorAccountsResult }} </span>
        </p>
      </div>
      <div>
        <button
          class="wallet-connect-btn"
          @click="connectWallet('WalletConnect')"
        >
          {{ walletConnectButtonText }}
        </button>
        <p>
          Connected WalletConnect Account:
          <span> {{ walletConnectAccountsResult }} </span>
        </p>
      </div>
    </div>
    <div class="form-container">
      <div class="sign-message-container">
        <input
          v-model="message"
          type="text"
          placeholder="Write a message to sign"
        >
        <button @click="signMessage(message)">
          Sign Message
        </button>
        <p>{{ signedMessage }}</p>
      </div>
      <form @submit.prevent="sendTransaction()">
        <label for="address">Address</label>
        <input
          v-model="toAddress"
          type="text"
          placeholder="To Address"
        >
        <br>
        <label for="amount">Amount</label>
        <input
          v-model="amount"
          type="text"
          placeholder="Amount Ether"
        >
        <button type="submit">
          Send Transaction
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import useWallet from '@/composables/wallet'

const message = ref('')
const signedMessage = ref('')

const metamaskButtonText = ref<string>('Connect Metamask')
const metamaskAccountsResult = ref<string>('Address Not Active')
const coinbaseButtonText = ref<string>('Connect Coinbase')
const coinbaseAccountsResult = ref<string>('Address Not Active')
const phantomButtonText = ref<string>('Connect Phantom')
const phantomAccountsResult = ref<string>('Address Not Active')
const ledgerButtonText = ref<string>('Connect Ledger')
const ledgerAccountsResult = ref<string>('Address Not Active')
const trezorButtonText = ref<string>('Connect Trezor')
const trezorAccountsResult = ref<string>('Address Not Active')
const walletConnectButtonText = ref<string>('Connect WalletConnect')
const walletConnectAccountsResult = ref<string>('Address Not Active')

const {
  loggedIn,
  selectedProvider,
  selectedAddress,
  primaryAddress,
  toAddress,
  amount,
  amountToStake,
  pools,
  connectWallet,
  logout,
  setPrimaryWalletAccount,
  sendTransaction,
  signMessage,
  deposit,
  getUserPools,
  getUserBalance,
  getCurrentBalance,
  removeConnectedAccount,
  switchNetwork
} = useWallet()

watchEffect(() => {
  if (selectedProvider.value === 'MetaMask') {
    metamaskButtonText.value = 'MetaMask Connected'
    metamaskAccountsResult.value = selectedAddress.value
    coinbaseButtonText.value = 'Connect Coinbase'
    coinbaseAccountsResult.value = 'Not Active'
    phantomButtonText.value = 'Connect Phantom'
    phantomAccountsResult.value = 'Not Active'
    ledgerButtonText.value = 'Connect Ledger'
    ledgerAccountsResult.value = 'Not Active'
    walletConnectButtonText.value = 'Connect WalletConnect'
    walletConnectAccountsResult.value = 'Not Active'
  } else if (selectedProvider.value === 'CoinbaseWallet') {
    metamaskButtonText.value = 'Connect Metamask'
    coinbaseButtonText.value = 'Coinbase Connected'
    metamaskAccountsResult.value = 'Not Active'
    coinbaseAccountsResult.value = selectedAddress.value
    phantomButtonText.value = 'Connect Phantom'
    phantomAccountsResult.value = 'Not Active'
    ledgerButtonText.value = 'Connect Ledger'
    ledgerAccountsResult.value = 'Not Active'
    walletConnectButtonText.value = 'Connect WalletConnect'
    walletConnectAccountsResult.value = 'Not Active'
  } else if (selectedProvider.value === 'IoPay') {
    metamaskButtonText.value = 'Connect MetaMask'
    coinbaseButtonText.value = 'Connect Coinbase'
    metamaskAccountsResult.value = 'Not Active'
    coinbaseAccountsResult.value = 'Not Active'
    phantomButtonText.value = 'Connect Phantom'
    phantomAccountsResult.value = 'Not Active'
    ledgerButtonText.value = 'Connect Ledger'
    ledgerAccountsResult.value = 'Not Active'
    walletConnectButtonText.value = 'Connect WalletConnect'
    walletConnectAccountsResult.value = 'Not Active'
  } else if (selectedProvider.value === 'Phantom') {
    metamaskButtonText.value = 'Connect MetaMask'
    coinbaseButtonText.value = 'Connect Coinbase'
    phantomButtonText.value = 'Connected'
    metamaskAccountsResult.value = 'Not Active'
    coinbaseAccountsResult.value = 'Not Active'
    phantomAccountsResult.value = selectedAddress.value || 'Not Active'
    ledgerButtonText.value = 'Connect Ledger'
    ledgerAccountsResult.value = 'Not Active'
    walletConnectButtonText.value = 'Connect WalletConnect'
    walletConnectAccountsResult.value = 'Not Active'
  } else if (selectedProvider.value === 'Ledger') {
    metamaskButtonText.value = 'Connect MetaMask'
    coinbaseButtonText.value = 'Connect Coinbase'
    phantomButtonText.value = 'Connected'
    metamaskAccountsResult.value = 'Not Active'
    coinbaseAccountsResult.value = 'Not Active'
    phantomAccountsResult.value = 'Not Active'
    ledgerButtonText.value = 'Connected!'
    ledgerAccountsResult.value = selectedAddress.value
    walletConnectButtonText.value = 'Connect WalletConnect'
    walletConnectAccountsResult.value = 'Not Active'
  } else if (selectedProvider.value === 'WalletConnect') {
    metamaskButtonText.value = 'Connect MetaMask'
    coinbaseButtonText.value = 'Connect Coinbase'
    phantomButtonText.value = 'Connected'
    metamaskAccountsResult.value = 'Not Active'
    coinbaseAccountsResult.value = 'Not Active'
    phantomAccountsResult.value = 'Not Active'
    ledgerButtonText.value = 'Connect Ledger'
    ledgerAccountsResult.value = 'Not Active'
    walletConnectButtonText.value = 'Connected!'
    walletConnectAccountsResult.value = selectedAddress.value
  } else if (selectedProvider.value === 'Trezor') {
    metamaskButtonText.value = 'Connect MetaMask'
    metamaskAccountsResult.value = 'Not Active'
    coinbaseButtonText.value = 'Connect Coinbase'
    coinbaseAccountsResult.value = 'Not Active'
    phantomButtonText.value = 'Connected'
    phantomAccountsResult.value = 'Not Active'
    ledgerButtonText.value = 'Connect Ledger'
    ledgerAccountsResult.value = 'Not Active'
    walletConnectButtonText.value = 'Connect WalletConnect'
    walletConnectAccountsResult.value = 'Not Active'
    trezorButtonText.value = 'Connected!'
    trezorAccountsResult.value = selectedAddress.value
  }
})
</script>

<style scoped>
.btn-save-remove-account {
  background-color: plum;
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  border: 1px solid lightblue;
}

input {
  border: 1px solid lightblue;
  border-radius: 4px;
}

button {
  background: #f36f38;
  border: none;
  border-radius: 3px;
  color: #fff;
  cursor: pointer;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 15px;
  text-transform: uppercase;
  transition: all 0.3s ease-in-out;
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 750px;
}

.coinbase-btn {
  background-color: blue;
}

.iopay-btn {
  background-color: rgb(0, 218, 180);
}

.ledger-btn {
  background-color: rgb(0, 0, 0);
}

.trezor-btn {
  background-color: rgb(34, 99, 55);
}

.phantom-btn {
  background-color: purple;
}

.connect-wallet-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 5rem;
  border: 1px solid lightblue;
  padding: 2rem;
  width: 50%;
  /* center in middle of screen */
  margin-left: auto;
  margin-right: auto;
}

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 5rem;
  border: 1px solid lightblue;
  padding: 2rem;
  width: 50%;
  /* center in middle of screen */
  margin-left: auto;
  margin-right: auto;
}

form {
  display: flex;
  flex-direction: column;
}

input {
  width: 500px;
  padding: 1rem;
}

.wallet-connect-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  font-size: 16px;
  height: 44px;
  /* width: 50%; */
  transition: all 0.15s ease-in-out 0s;
  background-color: rgb(64, 153, 255);
  border: none;
  color: rgb(255, 255, 255);
  box-shadow: rgb(50 50 93 / 11%) 0px 4px 6px 0px,
    rgb(0 0 0 / 8%) 0px 1px 3px 0px, rgb(0 0 0 / 6%) 0px 0px 1px 0px inset;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  will-change: transform;
}

.network-div {
  /* Centered, chunky buttons, 500width */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid lightblue;
  padding: 2rem;
  width: 50%;
  /* center in middle of screen */
  margin-left: auto;
  margin-right: auto;
  
}
</style>
