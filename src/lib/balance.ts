import { AppState } from '../store';

export const getAccountBalance = (accountId: string, state: { 
  accounts: any[], 
  movements: any[], 
  operations: any[] 
}) => {
  const account = state.accounts.find(a => a.id === accountId);
  if (!account) return 0;
  
  let balance = account.initialBalance || 0;
  
  // Apply movements (Deposits/Withdrawals)
  state.movements.forEach(m => {
    if (m.accountId === accountId) {
       if (m.type === 'Deposit') balance += m.amount;
       if (m.type === 'Withdrawal') balance -= m.amount;
    }
  });

  // Apply operations
  state.operations.forEach(op => {
     // Check My Account Source
     if (op.sourceMyAccountId === accountId) balance -= op.amountSent;
     // Check Client Account Source
     if (op.sourceClientAccountId === accountId) balance -= op.amountSent;
     // Check My Account Destination
     if (op.destMyAccountId === accountId) balance += op.amountReceived;
     // Check Client Account Destination
     if (op.destClientAccountId === accountId) balance += op.amountReceived;
     
     // Legacy support
     if (op.sourceAccountId === accountId) balance -= op.amountSent;
     if (op.destAccountId === accountId) balance += op.amountReceived;
     if (op.clientSourceAccountId === accountId) balance -= op.amountSent;
     if (op.clientDestAccountId === accountId) balance += op.amountReceived;
  });

  // Apply transfers
  if ('transfers' in state) {
    (state.transfers as any[]).forEach(t => {
      if (t.sourceAccountId === accountId) {
        // Source loses amount + commissions
        let totalMinus = t.amount;
        t.commissions.forEach((c: any) => {
          if (c.type === 'percentage') {
            totalMinus += (t.amount * c.value) / 100;
          } else {
            totalMinus += c.value;
          }
        });
        balance -= totalMinus;
      }
      if (t.destAccountId === accountId) {
        // Destination gains amount
        balance += t.amount;
      }
    });
  }

  return balance;
};
