import { AppState, PaymentMethod } from '../store';

export const getAccountBalance = (paymentMethodId: string, state: { 
  paymentMethods: PaymentMethod[], 
  movements: any[], 
  operations: any[],
  transfers?: any[]
}) => {
  const pm = state.paymentMethods.find(p => p.id === paymentMethodId);
  if (!pm) return 0;
  
  let balance = pm.initialBalance || 0;
  
  // Apply movements (Deposits/Withdrawals)
  state.movements.forEach(m => {
    if (m.paymentMethodId === paymentMethodId || m.accountId === paymentMethodId) {
       if (m.type === 'Deposit') balance += m.amount;
       if (m.type === 'Withdrawal') balance -= m.amount;
    }
  });

  // Apply operations
  state.operations.forEach(op => {
     // Check Source
     if (op.sourceMyPaymentMethodId === paymentMethodId) balance -= op.amountInvested;
     if (op.sourceClientPaymentMethodId === paymentMethodId) balance += op.amountInvested;
     // Check Destination
     if (op.destMyPaymentMethodId === paymentMethodId) balance += op.amountReceived;
     if (op.destClientPaymentMethodId === paymentMethodId) balance -= op.amountReceived;
     
     // Legacy support
     if (op.sourcePaymentMethodId === paymentMethodId) balance -= (op.amountSent || op.amountInvested);
     if (op.destPaymentMethodId === paymentMethodId) balance += (op.amountReceived);
  });

  // Apply transfers
  if (state.transfers) {
    state.transfers.forEach(t => {
      if (t.sourcePaymentMethodId === paymentMethodId || t.sourceAccountId === paymentMethodId) {
        // Source loses amount + commissions
        let totalMinus = t.amount;
        (t.commissions || []).forEach((c: any) => {
          if (c.type === 'percentage') {
            totalMinus += (t.amount * c.value) / 100;
          } else {
            totalMinus += c.value;
          }
        });
        balance -= totalMinus;
      }
      if (t.destPaymentMethodId === paymentMethodId || t.destAccountId === paymentMethodId) {
        // Destination gains amount
        balance += t.amount;
      }
    });
  }

  return balance;
};

