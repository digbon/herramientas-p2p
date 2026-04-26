import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = {
  symbol: string;
  type: 'Crypto' | 'Fiat';
  isPrincipal?: boolean;
};

export type PaymentMethod = {
  id: string;
  type: string;
  value: string;
  label: string;
};

export type Account = {
  id: string;
  currency: string;
  tag: string; // e.g. #1, #2, #3
  name: string;
  ownerType: 'Mias' | 'Cliente';
  ownerName: string; // Full name of the owner
  initialBalance: number;
  platformId?: string;
  platformValue?: string; // The ID/Alias/Number in that platform
  details?: string;
  clientContact?: string;
  paymentMethods?: PaymentMethod[];
};

export type PlatformAccount = {
  id: string;
  value: string;
  label?: string;
};

export type Platform = {
  id: string;
  owner?: 'Mias' | 'Cliente';
  type: 'Fiat' | 'Crypto';
  name: string;
  details?: string; // keeping for backward compatibility
  accounts?: PlatformAccount[];
};

export type Movement = {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  currency: string;
  accountId: string;
  amount: number;
  notes?: string;
  date: string;
};

export type Attachment = {
  name: string;
  dataUrl: string;
  type: string;
};

export type Commission = {
  name?: string;
  value: number;
  type: 'fixed' | 'percentage';
};

export type Operation = {
  id: string;
  type: 'Compra' | 'Venta';
  order: 'Maker' | 'Taker';
  sourceCurrency: string;
  sourceAccountId: string;
  sourcePlatformId?: string;
  clientDestAccountId?: string;
  destCurrency: string;
  destAccountId: string;
  destPlatformId?: string;
  clientSourceAccountId?: string;
  counterpartName: string;
  counterpartContact?: string;
  myPlatformId?: string;
  clientPlatformId?: string;
  amountSent: number;
  price: number;
  amountReceived: number;
  commissionsSent: Commission[];
  commissionsReceived: Commission[];
  notes?: string;
  date: string;
  attachments?: Attachment[];
};

export type Transfer = {
  id: string;
  sourceAccountId: string;
  destAccountId: string;
  amount: number;
  commissions: Commission[];
  date: string;
  notes?: string;
};

export type AppState = {
  baseFiat: string;
  baseCrypto: string;
  currencies: Currency[];
  accounts: Account[];
  platforms: Platform[];
  operations: Operation[];
  movements: Movement[];
  transfers: Transfer[];
  setBaseFiat: (fiat: string) => void;
  setBaseCrypto: (crypto: string) => void;
  addCurrency: (currency: Currency) => void;
  removeCurrency: (symbol: string) => void;
  addAccount: (account: Account) => void;
  updateAccountInitialBalance: (id: string, balance: number) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  addPlatform: (platform: Platform) => void;
  updatePlatform: (id: string, updates: Partial<Platform>) => void;
  removePlatform: (id: string) => void;
  addOperation: (operation: Operation) => void;
  addMovement: (movement: Movement) => void;
  addTransfer: (transfer: Transfer) => void;
  resetAll: () => void;
  importData: (data: Partial<AppState>) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      baseFiat: 'BOB',
      baseCrypto: 'USDT',
      currencies: [
        { symbol: 'USDT', type: 'Crypto', isPrincipal: true },
        { symbol: 'BTC', type: 'Crypto' },
        { symbol: 'BOB', type: 'Fiat', isPrincipal: true },
        { symbol: 'USD', type: 'Fiat' },
        { symbol: 'USDC', type: 'Crypto' },
      ],
      accounts: [
        { id: '1', currency: 'USDT', tag: '#1', name: 'Cuenta Principal', ownerType: 'Mias', ownerName: 'Yo', initialBalance: 180, platformId: '3' },
        { id: '2', currency: 'USDT', tag: '#2', name: 'Cuenta Secundaria', ownerType: 'Mias', ownerName: 'Yo', initialBalance: 20, platformId: '3' },
        { id: '3', currency: 'BOB', tag: '#1', name: 'Ahorros BCP', ownerType: 'Mias', ownerName: 'Yo', initialBalance: 950, platformId: '2' },
        { id: '4', currency: 'BTC', tag: '#1', name: 'Binance BTC', ownerType: 'Mias', ownerName: 'Yo', initialBalance: 0.00123, platformId: '3' },
      ],
      platforms: [
        { id: '1', owner: 'Mias', type: 'Fiat', name: 'YapeBolivia', details: '78979555' },
        { id: '2', owner: 'Mias', type: 'Fiat', name: 'BCP' },
        { id: '3', owner: 'Mias', type: 'Crypto', name: 'Binance', details: 'jpbon' },
        { id: '4', owner: 'Cliente', type: 'Crypto', name: 'Bybit' },
      ],
      operations: [],
      movements: [],
      transfers: [],
      setBaseFiat: (fiat) => set({ baseFiat: fiat }),
      setBaseCrypto: (crypto) => set({ baseCrypto: crypto }),
      addCurrency: (currency) => set((state) => ({ currencies: [...state.currencies, currency] })),
      removeCurrency: (symbol) => set((state) => ({ currencies: state.currencies.filter(c => c.symbol !== symbol) })),
      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccountInitialBalance: (id, balance) => set((state) => ({
        accounts: state.accounts.map(a => a.id === id ? { ...a, initialBalance: balance } : a)
      })),
      updateAccount: (id, updates) => set((state) => ({
        accounts: state.accounts.map(a => a.id === id ? { ...a, ...updates } : a)
      })),
      removeAccount: (id) => set((state) => ({ accounts: state.accounts.filter(a => a.id !== id) })),
      addPlatform: (platform) => set((state) => ({ platforms: [...state.platforms, platform] })),
      updatePlatform: (id, updates) => set((state) => ({
        platforms: state.platforms.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      removePlatform: (id) => set((state) => ({ platforms: state.platforms.filter(p => p.id !== id) })),
      addOperation: (operation) => set((state) => ({ operations: [...state.operations, operation] })),
      addMovement: (movement) => set((state) => ({ movements: [...state.movements, movement] })),
      addTransfer: (transfer) => set((state) => ({ transfers: [...state.transfers, transfer] })),
      resetAll: () => set({
        baseFiat: 'BOB',
        baseCrypto: 'USDT',
        currencies: [
          { symbol: 'USDT', type: 'Crypto', isPrincipal: true },
          { symbol: 'BTC', type: 'Crypto' },
          { symbol: 'BOB', type: 'Fiat', isPrincipal: true },
          { symbol: 'USD', type: 'Fiat' },
          { symbol: 'USDC', type: 'Crypto' },
        ],
        accounts: [],
        platforms: [],
        operations: [],
        movements: [],
        transfers: [],
      }),
      importData: (data) => set((state) => ({ ...state, ...data })),
    }),
    {
      name: 'p2p-tools-storage',
    }
  )
);
