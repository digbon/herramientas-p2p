import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = {
  symbol: string;
  type: 'Crypto' | 'Fiat';
  isPrincipal?: boolean;
};

export type Account = {
  id: string;
  currency: string;
  name: string;
  initialBalance: number;
};

export type Platform = {
  id: string;
  owner: 'Mias' | 'Cliente';
  type: 'Fiat' | 'Crypto';
  name: string;
  details?: string;
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

export type Operation = {
  id: string;
  type: 'Compra' | 'Venta';
  order: 'Maker' | 'Taker';
  sourceCurrency: string;
  sourceAccountId: string;
  destCurrency: string;
  destAccountId: string;
  counterpartName: string;
  counterpartContact?: string;
  myPlatformId?: string;
  clientPlatformId?: string;
  amountSent: number;
  price: number;
  amountReceived: number;
  commission: number;
  notes?: string;
  date: string;
  attachments?: Attachment[];
};

type AppState = {
  baseFiat: string;
  baseCrypto: string;
  currencies: Currency[];
  accounts: Account[];
  platforms: Platform[];
  operations: Operation[];
  movements: Movement[];
  setBaseFiat: (fiat: string) => void;
  setBaseCrypto: (crypto: string) => void;
  addCurrency: (currency: Currency) => void;
  removeCurrency: (symbol: string) => void;
  addAccount: (account: Account) => void;
  updateAccountInitialBalance: (id: string, balance: number) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  addPlatform: (platform: Platform) => void;
  removePlatform: (id: string) => void;
  addOperation: (operation: Operation) => void;
  addMovement: (movement: Movement) => void;
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
        { id: '1', currency: 'USDT', name: 'Cuenta 1', initialBalance: 180 },
        { id: '2', currency: 'USDT', name: 'Cuenta 2', initialBalance: 20 },
        { id: '3', currency: 'BOB', name: 'Cuenta 1', initialBalance: 950 },
        { id: '4', currency: 'BTC', name: 'Cuenta 1', initialBalance: 0.00123 },
      ],
      platforms: [
        { id: '1', owner: 'Mias', type: 'Fiat', name: 'YapeBolivia', details: '78979555' },
        { id: '2', owner: 'Mias', type: 'Fiat', name: 'BCP' },
        { id: '3', owner: 'Mias', type: 'Crypto', name: 'Binance', details: 'jpbon' },
        { id: '4', owner: 'Cliente', type: 'Crypto', name: 'Bybit' },
      ],
      operations: [],
      movements: [],
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
      removePlatform: (id) => set((state) => ({ platforms: state.platforms.filter(p => p.id !== id) })),
      addOperation: (operation) => set((state) => ({ operations: [...state.operations, operation] })),
      addMovement: (movement) => set((state) => ({ movements: [...state.movements, movement] })),
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
      }),
      importData: (data) => set((state) => ({ ...state, ...data })),
    }),
    {
      name: 'p2p-tools-storage',
    }
  )
);
