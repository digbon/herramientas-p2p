import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PaymentMethod } from '../store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPMName(pm: PaymentMethod, allPMs: PaymentMethod[]) {
  const filteredPMs = allPMs.filter(p => p.ownerType === pm.ownerType);
  const sorted = [...filteredPMs].sort((a, b) => a.orderNumber - b.orderNumber);
  
  // orderNumber cronológico global (recalculado basado en creación)
  let globalOrder = 0;
  for (const p of sorted) {
    globalOrder++;
    if (p.id === pm.id) break;
  }
  
  let currencyOrder = 0;
  for (const p of sorted) {
    if (p.currency === pm.currency) {
      currencyOrder++;
      if (p.id === pm.id) break;
    }
  }

  let platformOrder = 0;
  for (const p of sorted) {
    if (p.platformChannel.toLowerCase() === pm.platformChannel.toLowerCase()) {
      platformOrder++;
      if (p.id === pm.id) break;
    }
  }

  return `#${globalOrder} - (${pm.currency}-#${currencyOrder}) - (${pm.platformChannel}-#${platformOrder})`;
}
