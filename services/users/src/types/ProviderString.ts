import { BrowserProviders } from '@/interfaces/BrowserProviders'
export type ProviderString =
  | keyof BrowserProviders
  | 'IoPay'
  | 'Ledger'
  | 'Trezor'
  | 'WalletConnect'
  |  'Phantom'
  | ''
