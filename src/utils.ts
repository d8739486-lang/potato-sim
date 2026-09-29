export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  
  const suffixes = [
    "", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "d", 
    "U", "D", "T", "Qt", "Qd", "Sd", "St", "O", "N", "v"
  ];
  let suffixNum = Math.floor(Math.log10(num) / 3);
  
  if (suffixNum >= suffixes.length) {
    return num.toExponential(1);
  }
  
  let shortValue = num / Math.pow(1000, suffixNum);
  shortValue = Math.floor(shortValue * 10) / 10;
  
  // Format with up to 1 decimal place, but remove trailing zeros
  let formatted = shortValue.toFixed(1);
  if (formatted.endsWith('.0')) {
    formatted = formatted.slice(0, -2);
  }
  
  return formatted + suffixes[suffixNum];
}

export function getRebirthCost(r: number): number {
  if (r === 0) return 1_000_000;       // 1 лям
  if (r === 1) return 5_000_000;       // 5 лямов
  if (r === 2) return 10_000_000;      // 10 лямов
  if (r === 3) return 15_000_000;      // 15 лямов
  if (r === 4) return 30_000_000;      // 30 лямов
  return 50_000_000 + (r - 5) * 5_000_000; // 50M + 5M за каждый последующий
}

export function getRebirthReward(r: number): number {
  const rewards = [10, 50, 500, 2500, 10000];
  if (r < 5) return rewards[r];
  return 10000 + (r - 4) * 5000;
}

export function getRebirthStartingBalance(r: number): number {
  const balances = [1500, 2500, 4500, 5500, 10000];
  if (r < 5) return balances[r];
  return 10000 + (r - 4) * 5000;
}
