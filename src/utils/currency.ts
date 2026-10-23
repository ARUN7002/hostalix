/**
 * Hostalix Dual Currency & Multi-Lingual Physician Formatter
 * Supports Dual Billing in Dollar ($ USD) and Yuan (¥ CNY)
 * Two Payment Types: Type 1 ($ USD) & Type 2 (¥ CNY)
 * Exchange Rate: 1.00 USD = 7.25 CNY
 */

export const USD_TO_CNY_RATE = 7.25;

export const CURRENCY_CONFIG = {
  usdToCnyRate: USD_TO_CNY_RATE,
  defaultCurrency: 'USD' as const,
};

export const toYuan = (usdAmount: number): number => {
  return Number((usdAmount * USD_TO_CNY_RATE).toFixed(2));
};

export const toUSD = (yuanAmount: number): number => {
  return Number((yuanAmount / USD_TO_CNY_RATE).toFixed(2));
};

export const formatUSD = (usdAmount: number): string => {
  return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatYuan = (yuanAmount: number): string => {
  return `¥${yuanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDualCurrency = (
  usdAmount: number,
  options?: { compact?: boolean }
): string => {
  const yuan = toYuan(usdAmount);
  if (options?.compact) {
    return `$${Math.round(usdAmount).toLocaleString()} / ¥${Math.round(yuan).toLocaleString()}`;
  }
  return `${formatUSD(usdAmount)} (${formatYuan(yuan)})`;
};

/**
 * Format Doctor Name with English (Primary / Preferred) and Chinese Name
 * Accepts either:
 * - formatDoctorName(doctorObject)
 * - formatDoctorName(firstName, lastName, chineseName)
 * e.g. "Dr. Elena Vance · 万斯医生"
 */
export function formatDoctorName(
  firstNameOrDoc: string | { firstName: string; lastName: string; chineseName?: string },
  lastNameOrOptions?: string | { withPrefix?: boolean },
  chineseName?: string
): string {
  if (typeof firstNameOrDoc === 'object' && firstNameOrDoc !== null) {
    const opts = typeof lastNameOrOptions === 'object' ? lastNameOrOptions : undefined;
    const prefix = opts?.withPrefix === false ? '' : 'Dr. ';
    const englishName = `${prefix}${firstNameOrDoc.firstName} ${firstNameOrDoc.lastName}`;
    return firstNameOrDoc.chineseName ? `${englishName} · ${firstNameOrDoc.chineseName}` : englishName;
  }

  const englishName = `Dr. ${firstNameOrDoc} ${lastNameOrOptions || ''}`.trim();
  return chineseName ? `${englishName} · ${chineseName}` : englishName;
}
