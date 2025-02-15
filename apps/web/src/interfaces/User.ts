import { ProviderString } from '@/types/ProviderString'
import { Pool } from './Pool'

export interface User {
    id: string
    accounts: Record<ProviderString, string[]>
    primaryAccount: string
    balance?: string
    stake?: string
    rewards?: string
    pools?: Pool[]
    address: string
}