import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = {
  symbol: string;
  type: 'Crypto' | 'Fiat';
  isPrincipal?: boolean;
};

export type InfoRecord = {
  id: string;
  date: string;
  content: string;
};

export type PaymentMethod = {
  id: string;
  orderNumber: number; // #1, 2, 3...
  platformChannel: string; // Plataforma/Canal
  ownerName: string; // Nombre completo del propietario
  platformUserId: string; // ID de usuario de la plataforma
  currency: string;
  initialBalance: number;
  ownerType: 'Mias' | 'Cliente'; // Assuming we still need to know whose it is
  additionalInfo: InfoRecord[];
};

export type Movement = {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  currency: string;
  paymentMethodId: string;
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
  destCurrency: string;
  amountInvested: number;
  price: number;
  amountReceived: number;

  commissions: Commission[];

  p2pPlatform: string;

  sourceMyPaymentMethodId?: string;
  destMyPaymentMethodId?: string;

  clientName: string;
  clientIdPlatform: string;
  sourceClientPaymentMethodId?: string;
  destClientPaymentMethodId?: string;

  notes?: string;
  date: string;
  attachments?: Attachment[];
};

export type Transfer = {
  id: string;
  sourcePaymentMethodId: string;
  destPaymentMethodId: string;
  amount: number;
  commissions: Commission[];
  date: string;
  notes?: string;
};

export type AppState = {
  baseFiat: string;
  baseCrypto: string;
  currencies: Currency[];
  paymentMethods: PaymentMethod[];
  operations: Operation[];
  movements: Movement[];
  transfers: Transfer[];
  setBaseFiat: (fiat: string) => void;
  setBaseCrypto: (crypto: string) => void;
  addCurrency: (currency: Currency) => void;
  removeCurrency: (symbol: string) => void;
  addPaymentMethod: (pm: PaymentMethod) => string;
  addPaymentMethodInfo: (pmId: string, info: InfoRecord) => void;
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
      paymentMethods: [
        // Migrate or seed initial
      ],
      operations: [],
      movements: [],
      transfers: [],
      setBaseFiat: (fiat) => set({ baseFiat: fiat }),
      setBaseCrypto: (crypto) => set({ baseCrypto: crypto }),
      addCurrency: (currency) => set((state) => ({ currencies: [...state.currencies, currency] })),
      removeCurrency: (symbol) => set((state) => ({ currencies: state.currencies.filter(c => c.symbol !== symbol) })),
      addPaymentMethod: (pm) => {
        let savedId = pm.id || Date.now().toString();
        set((state) => {
          const globalOrder = state.paymentMethods.filter(p => p.ownerType === pm.ownerType).length + 1;
          const newPM = { ...pm, id: savedId, orderNumber: pm.orderNumber || globalOrder };
          return { paymentMethods: [...state.paymentMethods, newPM] };
        });
        return savedId;
      },
      addPaymentMethodInfo: (pmId, info) => set((state) => ({
        paymentMethods: state.paymentMethods.map(pm => pm.id === pmId ? { ...pm, additionalInfo: [...pm.additionalInfo, info] } : pm)
      })),
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
        paymentMethods: [],
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

