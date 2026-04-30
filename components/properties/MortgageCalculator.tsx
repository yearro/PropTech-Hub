'use client';

import React, { useState, useMemo, useEffect } from 'react';
// @ts-ignore
import fx from 'money';
import { SUPPORTED_CURRENCIES, getCurrencyByCode, formatCurrency as formatPrice } from '@/config/currencies';

// Initialize money.js rates
// Base: USD
fx.base = "USD";
fx.rates = {
  "USD": 1,
  "MXN": 20.45, // Example rate
  "EUR": 0.96,  // Example rate
};

interface MortgageCalculatorProps {
  propertyPrice: number;
  propertyCurrency?: string;
  dict: any;
  lang: string;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ propertyPrice, propertyCurrency = 'USD', dict, lang }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(lang === 'es' ? 'MXN' : 'USD');
  
  // Default values: 80% loan, 20 years, 11.28% interest (Internal values always in property's original currency)
  const [loanAmount, setLoanAmount] = useState(propertyPrice * 0.8);
  const [termYears, setTermYears] = useState(20);
  const [interestRate, setInterestRate] = useState(11.28);

  // Formatting helpers
  const formatCurrency = (value: number, currency: string) => {
    return formatPrice(value, currency, lang);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Mortgage Calculation (Result in original currency)
  const baseMonthlyPayment = useMemo(() => {
    const P = loanAmount;
    const i = interestRate / 100 / 12;
    const n = termYears * 12;

    if (i === 0) return P / n;

    const payment = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return payment;
  }, [loanAmount, termYears, interestRate]);

  // Converted result
  const convertedMonthlyPayment = useMemo(() => {
    return Math.round(fx.convert(baseMonthlyPayment, { from: propertyCurrency, to: selectedCurrency }));
  }, [baseMonthlyPayment, selectedCurrency, propertyCurrency]);

  // Handle loan amount slider (5% to 90%)
  const handleLoanSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseInt(e.target.value);
    setLoanAmount((propertyPrice * percentage) / 100);
  };

  // Handle loan amount input
  const handleLoanInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = value === '' ? 0 : parseInt(value);
    setLoanAmount(numValue);
  };

  const handleLoanInputBlur = () => {
    const minLoan = propertyPrice * 0.05;
    const maxLoan = propertyPrice * 0.90;
    if (loanAmount < minLoan) setLoanAmount(minLoan);
    if (loanAmount > maxLoan) setLoanAmount(maxLoan);
  };

  const loanPercentage = Math.round((loanAmount / propertyPrice) * 100);
  const downPayment = propertyPrice - loanAmount;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-mosque/5 overflow-hidden transition-all duration-500`}>
      {/* Collapsed Header / Summary */}
      <div className={`p-6 flex flex-col sm:flex-row items-center justify-between gap-6 ${isExpanded ? 'bg-mosque/5 border-b border-mosque/10' : 'bg-mosque/5'}`}>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-full text-mosque shadow-sm flex items-center justify-center">
            <span className="material-icons">calculate</span>
          </div>
          <div>
            <h3 className="font-semibold text-nordic-dark">{dict.property_details.estimated_payment}</h3>
            <p className="text-sm text-nordic-dark/60">
              {dict.property_details.starting_from} <strong className="text-mosque">{formatCurrency(convertedMonthlyPayment, selectedCurrency)}{selectedCurrency === 'USD' ? dict.common.per_month : ` ${selectedCurrency}${dict.common.per_month}`}</strong> {dict.property_details.with_down.replace('20%', `${100 - loanPercentage}%`)}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="whitespace-nowrap px-6 py-2.5 bg-white border border-nordic-dark/10 rounded-lg text-sm font-semibold hover:border-mosque transition-all text-nordic-dark shadow-sm active:scale-95"
        >
          {isExpanded ? dict.admin.properties.cancel : dict.property_details.calculate_mortgage}
        </button>
      </div>

      {/* Expanded Parameters */}
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 p-8' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Loan Amount Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-nordic-dark/70">{dict.property_details.loan_amount}</label>
              <span className="text-xs font-bold text-mosque bg-mosque/10 px-2 py-1 rounded">{loanPercentage}%</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nordic-dark/40">
                {getCurrencyByCode(propertyCurrency).symbol}
              </span>
              <input 
                type="text"
                value={loanAmount.toLocaleString()}
                onChange={handleLoanInputChange}
                onBlur={handleLoanInputBlur}
                className="w-full pl-8 pr-4 py-3 bg-background-light border border-mosque/10 rounded-xl text-lg font-semibold text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque/20 focus:border-mosque transition-all"
              />
            </div>
            <input 
              type="range"
              min="5"
              max="90"
              step="1"
              value={loanPercentage}
              onChange={handleLoanSliderChange}
              className="w-full h-2 bg-mosque/10 rounded-lg appearance-none cursor-pointer accent-mosque"
            />
            <div className="flex justify-between text-[10px] uppercase tracking-tighter text-nordic-dark/40 font-bold">
              <span>5%</span>
              <span>90%</span>
            </div>
            <div className="pt-2 flex justify-between items-center text-sm">
              <span className="text-nordic-dark/50">{dict.property_details.down_payment}</span>
              <span className="font-semibold text-nordic-dark">{formatCurrency(downPayment, propertyCurrency)}</span>
            </div>
          </div>

          {/* Right Column: Term & Interest & Currency */}
          <div className="space-y-6">
            {/* Term Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-nordic-dark/70">{dict.property_details.term}</label>
              <div className="relative">
                <select 
                  value={termYears}
                  onChange={(e) => setTermYears(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-background-light border border-mosque/10 rounded-xl text-nordic-dark font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-mosque/20 focus:border-mosque transition-all cursor-pointer text-sm"
                >
                  {[5, 10, 15, 20, 25, 30].map(year => (
                    <option key={year} value={year}>{year} {dict.property_details.years}</option>
                  ))}
                </select>
                <span className="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-nordic-dark/30 pointer-events-none text-xl">expand_more</span>
              </div>
            </div>

            {/* Interest Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-nordic-dark/70">{dict.property_details.interest_rate}</label>
                <span className="text-sm font-bold text-mosque">{formatPercent(interestRate)}</span>
              </div>
              <input 
                type="range"
                min="9"
                max="20"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-mosque/10 rounded-lg appearance-none cursor-pointer accent-mosque"
              />
            </div>

            {/* Currency Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-nordic-dark/70">{dict.property_details.currency}</label>
              <div className="flex p-1 bg-background-light rounded-xl border border-mosque/10 overflow-x-auto gap-1">
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => setSelectedCurrency(curr.code)}
                    className={`flex-1 py-1.5 px-3 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${
                      selectedCurrency === curr.code 
                        ? 'bg-mosque text-white shadow-sm' 
                        : 'text-nordic-dark/40 hover:text-nordic-dark/70 hover:bg-mosque/5'
                    }`}
                  >
                    {curr.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Footer */}
        <div className="mt-10 pt-8 border-t border-mosque/10 flex flex-col items-center">
          <span className="text-sm text-nordic-dark/50 mb-1 uppercase tracking-widest font-bold">{dict.property_details.monthly_payment}</span>
          <div className="text-4xl font-black text-nordic-dark tracking-tight">
            {formatCurrency(convertedMonthlyPayment, selectedCurrency)}
            <span className="text-lg font-normal text-nordic-dark/40 ml-1">
              {selectedCurrency}
              {dict.common.per_month}
            </span>
          </div>
          <p className="mt-4 text-[10px] text-nordic-dark/30 text-center max-w-md">
            * Conversions are estimated based on current market data. Real-time rates may vary at the time of your application.
          </p>
        </div>
      </div>
    </div>
  );
};
