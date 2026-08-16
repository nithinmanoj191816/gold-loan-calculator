export interface YearlyBreakdown {
  yearNumber: number;
  startAmount: number;
  days: number;
  formula: string;
  interest: number;
  endAmount: number;
}

export interface RemainingPeriod {
  startAmount: number;
  months: number;
  days: number;
  calculationDays: number;
  formula: string;
  interest: number;
}

export interface CalculationResult {
  principal: number;
  monthlyRate: number;
  startDate: string;
  endDate: string;
  years: number;
  months: number;
  days: number;
  totalCalculationDays: number;
  yearlyBreakdown: YearlyBreakdown[];
  remainingPeriod: RemainingPeriod;
  totalInterest: number;
  finalAmount: number;
}

export function formatRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateInterest(
  principal: number,
  monthlyRate: number,
  startDateStr: string,
  endDateStr: string
): CalculationResult | { error: string } {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: 'Please select valid start and end dates.' };
  }

  if (end < start) {
    return { error: 'End date cannot be earlier than start date.' };
  }

  // Calculate elapsed calendar duration
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthEnd = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthEnd;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearlyBreakdown: YearlyBreakdown[] = [];
  let currentPrincipal = principal;

  // Progressive compounding: 1 Year = 365 calculation days
  for (let i = 1; i <= years; i++) {
    const interest = (currentPrincipal * monthlyRate * 365) / 3000;
    const endAmount = currentPrincipal + interest;

    yearlyBreakdown.push({
      yearNumber: i,
      startAmount: currentPrincipal,
      days: 365,
      formula: `(${currentPrincipal.toFixed(2)} × ${monthlyRate}% × 365) / 3000`,
      interest,
      endAmount,
    });

    currentPrincipal = endAmount;
  }

  // Remaining period: 1 Month = 30 calculation days
  const remainingDays = months * 30 + days;
  const remainingInterest = (currentPrincipal * monthlyRate * remainingDays) / 3000;

  const remainingPeriod: RemainingPeriod = {
    startAmount: currentPrincipal,
    months,
    days,
    calculationDays: remainingDays,
    formula: `(${currentPrincipal.toFixed(2)} × ${monthlyRate}% × ${remainingDays}) / 3000`,
    interest: remainingInterest,
  };

  const finalAmount = currentPrincipal + remainingInterest;
  const totalInterest = finalAmount - principal;
  const totalCalculationDays = years * 365 + remainingDays;

  return {
    principal,
    monthlyRate,
    startDate: startDateStr,
    endDate: endDateStr,
    years,
    months,
    days,
    totalCalculationDays,
    yearlyBreakdown,
    remainingPeriod,
    totalInterest,
    finalAmount,
  };
}