import { Operation, Commission } from '../store';

export type AccountingMethod = 'AVG' | 'FIFO' | 'LOFO' | 'HIFO';

export interface Lot {
    originalAmount: number;
    remainingAmount: number;
    costInBase: number;
    date: Date;
    unitPrice: number;
}

export interface DailyAccountingData {
    profitBase: number; 
    volumeBase: number; 
    volumeAsset: number; 
    commsBase: number;
}

export function calculateProfitability(
    operations: Operation[], 
    baseCurrency: string, 
    accountingMethod: AccountingMethod
) {
    const inventory: Record<string, Lot[]> = {};

    const dailyData: Record<string, DailyAccountingData> = {};
    let totalCommsBase = 0;
    let totalVolumeBase = 0;

    const sortedOps = [...operations].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedOps.forEach(op => {
        if (op.sourceCurrency !== baseCurrency && op.destCurrency !== baseCurrency) return;

        const isSellingBase = op.sourceCurrency === baseCurrency;
        const dateKey = op.date.split('T')[0] || op.date.substring(0, 10);
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = { profitBase: 0, volumeBase: 0, volumeAsset: 0, commsBase: 0 };
        }

        const baseAmount = isSellingBase ? op.amountInvested : op.amountReceived;
        const assetAmount = isSellingBase ? op.amountReceived : op.amountInvested;
        const assetCurrency = isSellingBase ? op.destCurrency : op.sourceCurrency;

        const commsInBase = op.commissions.reduce((acc, c) => acc + (c.type === 'fixed' ? c.value : baseAmount * (c.value/100)), 0);
        
        dailyData[dateKey].commsBase += commsInBase;
        dailyData[dateKey].volumeBase += baseAmount;
        dailyData[dateKey].volumeAsset += assetAmount;
        
        totalCommsBase += commsInBase;
        totalVolumeBase += baseAmount;

        if (!inventory[assetCurrency]) {
            inventory[assetCurrency] = [];
        }

        if (isSellingBase) {
            // BUYING ASSET: adding a lot
            const newLot: Lot = {
                originalAmount: assetAmount,
                remainingAmount: assetAmount,
                costInBase: baseAmount,
                unitPrice: baseAmount / assetAmount,
                date: new Date(op.date)
            };

            if (accountingMethod === 'AVG') {
                const currentLots = inventory[assetCurrency];
                const totalRemaining = currentLots.reduce((acc, l) => acc + l.remainingAmount, 0);
                const totalCost = currentLots.reduce((acc, l) => acc + (l.remainingAmount * l.unitPrice), 0);
                
                const newTotalAmount = totalRemaining + assetAmount;
                const newTotalCost = totalCost + baseAmount;
                
                inventory[assetCurrency] = [{
                    originalAmount: newTotalAmount,
                    remainingAmount: newTotalAmount,
                    costInBase: newTotalCost,
                    unitPrice: newTotalAmount > 0 ? newTotalCost / newTotalAmount : 0,
                    date: new Date(op.date)
                }];
            } else {
                inventory[assetCurrency].push(newLot);
            }
            
            // Subtract buy commissions from daily profit
            dailyData[dateKey].profitBase -= commsInBase;

        } else {
            // SELLING ASSET
            let amountToConsume = assetAmount;
            let cogs = 0; 

            let lots = inventory[assetCurrency];
            if (accountingMethod === 'LOFO') {
                lots.sort((a,b) => a.unitPrice - b.unitPrice);
            } else if (accountingMethod === 'HIFO') {
                lots.sort((a,b) => b.unitPrice - a.unitPrice);
            } else if (accountingMethod === 'FIFO') {
                lots.sort((a,b) => a.date.getTime() - b.date.getTime());
            }

            for (let i = 0; i < lots.length && amountToConsume > 0; i++) {
                const lot = lots[i];
                if (lot.remainingAmount <= 0) continue;

                if (lot.remainingAmount <= amountToConsume) {
                    cogs += lot.remainingAmount * lot.unitPrice;
                    amountToConsume -= lot.remainingAmount;
                    lot.remainingAmount = 0;
                    lot.costInBase = 0;
                } else {
                    cogs += amountToConsume * lot.unitPrice;
                    lot.remainingAmount -= amountToConsume;
                    lot.costInBase -= amountToConsume * lot.unitPrice;
                    amountToConsume = 0;
                }
            }

            inventory[assetCurrency] = lots.filter(l => l.remainingAmount > 0);
            if (accountingMethod !== 'FIFO' && accountingMethod !== 'AVG') {
               inventory[assetCurrency].sort((a,b) => a.date.getTime() - b.date.getTime());
            }

            const grossProfit = baseAmount - cogs;
            
            const netProfit = grossProfit - commsInBase;
            dailyData[dateKey].profitBase += netProfit;
        }
    });

    return { inventory, dailyData, totalCommsBase, totalVolumeBase };
}
