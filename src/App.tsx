import React, { useState } from 'react';

interface BreakdownRow {
  periodLabel: string;
  details: string;
}

interface CalcSummary {
  principal: number;
  rate: number;
  years: number;
  months: number;
  days: number;
  calculationDays: number;
  breakdown: BreakdownRow[];
  netAmount: number;
  totalInterest: number;
}

export default function App() {
  const [principalStr, setPrincipalStr] = useState<string>('');
  const [rateStr, setRateStr] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [summary, setSummary] = useState<CalcSummary | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(principalStr);
    const r = parseFloat(rateStr);

    if (isNaN(p) || isNaN(r) || !fromDate || !toDate) return;

    // Strict 30-day borrowing rule
    const [startYear, startMonth, startDay] = fromDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = toDate.split('-').map(Number);

    let ey = endYear;
    let em = endMonth;
    let ed = endDay;

    const sy = startYear;
    const sm = startMonth;
    const sd = startDay;

    if (ed < sd) {
      ed += 30;
      em -= 1;
    }
    const days = ed - sd;

    if (em < sm) {
      em += 12;
      ey -= 1;
    }
    const months = em - sm;
    const years = ey - sy;

    const calculationDays = (years * 365) + (months * 30) + days;

    const breakdown: BreakdownRow[] = [];
    let currentPA = p;

    for (let i = 1; i <= years; i++) {
      const ia = (currentPA * r * 365) / 3000;
      breakdown.push({
        periodLabel: `${i} Breakdown`,
        details: `PA: ${Math.round(currentPA)} + IA: ${Math.round(ia)}`,
      });
      currentPA += ia;
    }

    const remDays = months * 30 + days;
    if (remDays > 0 || years === 0) {
      const ia = (currentPA * r * remDays) / 3000;
      breakdown.push({
        periodLabel: `${years + 1} Breakdown`,
        details: `PA: ${Math.round(currentPA)} + IA: ${Math.round(ia)}`,
      });
      currentPA += ia;
    }

    const netAmount = Math.round(currentPA);
    const totalInterest = Math.max(0, netAmount - p);

    setSummary({
      principal: p,
      rate: r,
      years,
      months,
      days,
      calculationDays,
      breakdown,
      netAmount,
      totalInterest,
    });
  };

  const principalPercent = summary
    ? Math.min(100, Math.max(0, Math.round((summary.principal / summary.netAmount) * 100)))
    : 100;

  return (
    <div className="calc-container">
      <div className="ambient-glow"></div>
      
      <div className="calc-card">
        {/* Header */}
        <div className="calc-header">
          <div className="gold-badge">
            <span>✨</span> Gold Interest
          </div>
          <h1 className="calc-title">Gold Loan Calculator</h1>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleCalculate}>
          <div className="form-group">
            <label className="form-label">ENTER AMOUNT</label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                value={principalStr}
                onChange={(e) => setPrincipalStr(e.target.value)}
                className="styled-input has-prefix"
                placeholder="Enter Amount"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ENTER RATE</label>
            <div className="input-wrapper">
              <input
                type="number"
                step="any"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                className="styled-input has-suffix"
                placeholder="Enter Rate"
                required
              />
              <span className="input-suffix">% </span>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="styled-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="styled-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit">
            CALCULATE
          </button>
        </form>

        {/* Results Section */}
        {summary && (
          <div className="results-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Duration</div>
                <div className="metric-val">{summary.years}y {summary.months}m {summary.days}d</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total Days</div>
                <div className="metric-val">{summary.calculationDays} Days</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total Interest</div>
                <div className="metric-val" style={{ color: '#d97706' }}>
                  ₹{summary.totalInterest.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="ratio-container">
              <div className="ratio-header">
                <span style={{ color: '#2563eb' }}>Principal ({principalPercent}%)</span>
                <span style={{ color: '#d97706' }}>Interest ({100 - principalPercent}%)</span>
              </div>
              <div className="ratio-bar">
                <div className="ratio-principal" style={{ width: `${principalPercent}%` }}></div>
                <div className="ratio-interest" style={{ width: `${100 - principalPercent}%` }}></div>
              </div>
            </div>

            <div className="breakdown-list">
              {summary.breakdown.map((row, idx) => (
                <div key={idx} className="breakdown-item">
                  <span className="breakdown-tag">{row.periodLabel}</span>
                  <span className="breakdown-formula">{row.details}</span>
                </div>
              ))}
            </div>

            <div className="net-hero">
              <div>
                <div className="net-label">Net Amount</div>
                <div className="net-sub">Total Payable Amount</div>
              </div>
              <div className="net-value">₹{summary.netAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}