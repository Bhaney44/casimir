import { Ref, ref } from 'vue'
import { ethers } from 'ethers'
import useIoPay from '@/composables/iopay'
import useLedger from '@/composables/ledger'
import useEthers from '@/composables/ethers'
import { BrowserProviders } from '@/interfaces/BrowserProviders'
import { EthersProvider } from '@/interfaces/EthersProvider'
import { ProviderString } from '@/types/ProviderString'
import {
  enableWalletConnect,
  disableWalletConnect,
  sendWalletConnectTx,
} from '@/utils/walletConnect'
import WalletConnect from '@walletconnect/client'

const connector: Ref<WalletConnect> = ref({}) // TODO: Fix this type error
const walletConnectAddress: Ref<string> = ref('')

const amount = ref<string>('0.0000001')
const toAddress = ref<string>('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
// Test ethereum send to address : 0xD4e5faa8aD7d499Aa03BDDE2a3116E66bc8F8203
// Test iotex send to address: acc://06da5e904240736b1e21ca6dbbd5f619860803af04ff3d54/acme
const { requestEthersAccount } = useEthers()

const defaultProviders = {
  MetaMask: undefined,
  CoinbaseWallet: undefined,
}

const ethersProviderList = ['MetaMask', 'CoinbaseWallet']

export default function useWallet() {
  const { getIoPayAccounts, sendIoPayTransaction } = useIoPay()
  const { bip32Path, getLedgerEthSigner } = useLedger()
  const ethereum: any = window.ethereum
  const availableProviders = ref<BrowserProviders>(
    getBrowserProviders(ethereum)
  )
  const selectedProvider = ref<ProviderString>('')
  const selectedAccount = ref<string>('')
  const setSelectedProvider = (provider: ProviderString) => {
    selectedProvider.value = provider
  }
  const setSelectedAccount = (address: string) => {
    selectedAccount.value = address
  }

  async function connectWallet(provider: ProviderString) {
    try {
      setSelectedProvider(provider)
      selectedAccount.value = 'Not Active'
      if (provider === 'WalletConnect') {
        const walletConnectOptions = enableWalletConnect(
          connector,
          walletConnectAddress
        )
        connector.value = walletConnectOptions.connector
        walletConnectAddress.value = walletConnectOptions.walletConnectAddress
      } else if (ethersProviderList.includes(provider)) {
        const browserExtensionProvider =
          availableProviders.value[provider as keyof BrowserProviders]
        const accounts = await requestEthersAccount(
          browserExtensionProvider as EthersProvider
        )
        const address = accounts[0]
        setSelectedAccount(address)
      } else if (provider === 'IoPay') {
        const accounts = await getIoPayAccounts()
        const { address } = accounts[0]
        setSelectedAccount(address)
      } else if (provider === 'Ledger') {
        const ledgerEth = await getLedgerEthSigner()
        const { address } = await ledgerEth.getAddress(bip32Path)
        console.log(address)
        setSelectedAccount(address)
      } else {
        throw new Error('No provider selected')
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function disconnectWallet(provider: ProviderString) {
    selectedAccount.value = ''
    selectedProvider.value = ''
    if (provider === 'WalletConnect') {
      await disableWalletConnect(connector.value)
    }
  }

  async function sendTransaction(provider: string) {
    try {
      if (provider === 'WalletConnect') {
        await sendWalletConnectTx(
          connector.value,
          walletConnectAddress.value,
          amount.value,
          toAddress.value
        )
      } else if (ethersProviderList.includes(provider)) {
        const browserProvider =
          availableProviders.value[provider as keyof BrowserProviders]
        const web3Provider: ethers.providers.Web3Provider =
          new ethers.providers.Web3Provider(browserProvider as EthersProvider)
        const signer = web3Provider.getSigner()
        const etherAmount = ethers.utils.parseEther(amount.value)
        const tx = {
          to: toAddress.value,
          value: etherAmount,
        }
        signer.sendTransaction(tx).then((txObj) => {
          console.log('successful txHash: ', txObj.hash)
        })
      } else if (selectedProvider.value === 'IoPay') {
        await sendIoPayTransaction(toAddress.value, amount.value)
      } else if (selectedProvider.value === 'Ledger') {
        // npm run dev:ethereum in another process
        // const ledgerEth = await getLedgerEthSigner()
        // Create - { to: ... }
        // Serialize - ethers.utils.serializeTransaction
        // Sign - ledgerEth.signTransaction
        // Send - (new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")).sendTransaction
      } else {
        throw new Error('Provider selected not yet supported')
      }
    } catch (error) {
      console.error(error)
    }
  }

  return {
    selectedProvider,
    selectedAccount,
    toAddress,
    amount,
    connectWallet,
    disconnectWallet,
    sendTransaction,
  }
}

function getBrowserProviders(ethereum: any) {
  if (!ethereum) return defaultProviders
  else if (!ethereum.providerMap) {
    return {
      MetaMask: ethereum.isMetaMask ? ethereum : undefined,
      CoinbaseWallet: ethereum.isCoinbaseWallet ? ethereum : undefined,
    }
  } else {
    return {
      MetaMask: ethereum.providerMap.get('MetaMask'),
      CoinbaseWallet: ethereum.providerMap.get('CoinbaseWallet'),
    }
  }
}
