document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const calcList = document.getElementById('calcList');
    const calcTitle = document.getElementById('calcTitle');
    const inputsDiv = document.getElementById('inputs');
    const calculateBtn = document.getElementById('calculateBtn');
    const outputDiv = document.getElementById('output');
    
    let selectedCalc = null;
    
    // Calculator definitions with inputs and calculation functions
    const calculators = {
        stockReturn: {
            title: "Stock Return Calculator",
            inputs: [
                { label: "Buy Price", id: "buyPrice", type: "number" },
                { label: "Sell Price", id: "sellPrice", type: "number" },
                { label: "Dividends", id: "dividends", type: "number" }
            ],
            calculate: (inputs) => {
                const buy = parseFloat(inputs.buyPrice);
                const sell = parseFloat(inputs.sellPrice);
                const div = parseFloat(inputs.dividends);
                if (buy <= 0) return "Error: Buy price must be positive.";
                const returnPct = ((sell + div - buy) / buy) * 100;
                return `Percentage Return: ${returnPct.toFixed(2)}%`;
            }
        },
        futureValue: {
            title: "Future Value of Shares Calculator",
            inputs: [
                { label: "Current Price", id: "currentPrice", type: "number" },
                { label: "Expected Growth Rate (%)", id: "growthRate", type: "number" },
                { label: "Time Horizon (years)", id: "timeHorizon", type: "number" }
            ],
            calculate: (inputs) => {
                const price = parseFloat(inputs.currentPrice);
                const rate = parseFloat(inputs.growthRate) / 100;
                const time = parseFloat(inputs.timeHorizon);
                if (price <= 0 || time <= 0) return "Error: Price and time must be positive.";
                const futureValue = price * Math.pow(1 + rate, time);
                return `Future Value: $${futureValue.toFixed(2)}`;
            }
        },
        averageBuy: {
            title: "Average Buy Price Calculator",
            inputs: [
                { label: "Total Cost", id: "totalCost", type: "number" },
                { label: "Total Shares", id: "totalShares", type: "number" }
            ],
            calculate: (inputs) => {
                const cost = parseFloat(inputs.totalCost);
                const shares = parseFloat(inputs.totalShares);
                if (shares <= 0) return "Error: Shares must be positive.";
                const avgPrice = cost / shares;
                return `Average Buy Price: $${avgPrice.toFixed(2)}`;
            }
        },
        holdingPeriod: {
            title: "Holding Period Return Calculator",
            inputs: [
                { label: "Initial Investment", id: "initial", type: "number" },
                { label: "Final Value", id: "final", type: "number" },
                { label: "Dividends Received", id: "dividends", type: "number" },
                { label: "Holding Period (years)", id: "period", type: "number" }
            ],
            calculate: (inputs) => {
                const init = parseFloat(inputs.initial);
                const fin = parseFloat(inputs.final);
                const div = parseFloat(inputs.dividends);
                const period = parseFloat(inputs.period);
                if (init <= 0 || period <= 0) return "Error: Initial investment and period must be positive.";
                const totalReturn = (fin + div - init) / init;
                const annualized = Math.pow(1 + totalReturn, 1 / period) - 1;
                return `Holding Period Return: ${(totalReturn * 100).toFixed(2)}%, Annualized: ${(annualized * 100).toFixed(2)}%`;
            }
        },
        reverseReturn: {
            title: "Reverse Return (Required Return) Calculator",
            inputs: [
                { label: "Current Price", id: "currentPrice", type: "number" },
                { label: "Target Price", id: "targetPrice", type: "number" },
                { label: "Time Horizon (years)", id: "timeHorizon", type: "number" }
            ],
            calculate: (inputs) => {
                const current = parseFloat(inputs.currentPrice);
                const target = parseFloat(inputs.targetPrice);
                const time = parseFloat(inputs.timeHorizon);
                if (current <= 0 || time <= 0) return "Error: Current price and time must be positive.";
                const requiredReturn = Math.pow(target / current, 1 / time) - 1;
                return `Required Annual Return: ${(requiredReturn * 100).toFixed(2)}%`;
            }
        },
        positionSize: {
            title: "Position Size Calculator",
            inputs: [
                { label: "Risk per Trade ($)", id: "risk", type: "number" },
                { label: "Stop-Loss Distance ($)", id: "stopLoss", type: "number" },
                { label: "Current Price", id: "price", type: "number" }
            ],
            calculate: (inputs) => {
                const risk = parseFloat(inputs.risk);
                const stop = parseFloat(inputs.stopLoss);
                const price = parseFloat(inputs.price);
                if (stop <= 0 || price <= 0) return "Error: Stop-loss and price must be positive.";
                const shares = risk / stop;
                return `Position Size: ${shares.toFixed(0)} shares (Max Cost: $${(shares * price).toFixed(2)})`;
            }
        },
        portfolioWeight: {
            title: "Portfolio Weight Calculator",
            inputs: [
                { label: "Stock Value in Portfolio ($)", id: "stockValue", type: "number" },
                { label: "Total Portfolio Value ($)", id: "totalValue", type: "number" }
            ],
            calculate: (inputs) => {
                const stock = parseFloat(inputs.stockValue);
                const total = parseFloat(inputs.totalValue);
                if (total <= 0) return "Error: Total portfolio value must be positive.";
                const weight = (stock / total) * 100;
                return `Portfolio Weight: ${weight.toFixed(2)}%`;
            }
        },
        breakeven: {
            title: "Breakeven Price Calculator",
            inputs: [
                { label: "Buy Price", id: "buyPrice", type: "number" },
                { label: "Brokerage Fees ($)", id: "fees", type: "number" },
                { label: "Taxes ($)", id: "taxes", type: "number" }
            ],
            calculate: (inputs) => {
                const buy = parseFloat(inputs.buyPrice);
                const fees = parseFloat(inputs.fees);
                const taxes = parseFloat(inputs.taxes);
                if (buy <= 0) return "Error: Buy price must be positive.";
                const breakeven = buy + fees + taxes;
                return `Breakeven Price: $${breakeven.toFixed(2)}`;
            }
        },
        margin: {
            title: "Margin / Leverage Calculator",
            inputs: [
                { label: "Total Value of Trade ($)", id: "totalValue", type: "number" },
                { label: "Margin Requirement (%)", id: "marginPct", type: "number" },
                { label: "Price per Share ($)", id: "price", type: "number" }
            ],
            calculate: (inputs) => {
                const total = parseFloat(inputs.totalValue);
                const margin = parseFloat(inputs.marginPct) / 100;
                const price = parseFloat(inputs.price);
                if (margin <= 0 || price <= 0) return "Error: Margin and price must be positive.";
                const requiredCapital = total * margin;
                const maxShares = total / price;
                return `Required Capital: $${requiredCapital.toFixed(2)}, Max Shares: ${maxShares.toFixed(0)}`;
            }
        },
        stopLoss: {
            title: "Stop-Loss / Take-Profit Calculator",
            inputs: [
                { label: "Entry Price ($)", id: "entryPrice", type: "number" },
                { label: "Stop-Loss (%)", id: "stopPct", type: "number" },
                { label: "Take-Profit (%)", id: "takePct", type: "number" }
            ],
            calculate: (inputs) => {
                const entry = parseFloat(inputs.entryPrice);
                const stop = parseFloat(inputs.stopPct) / 100;
                const take = parseFloat(inputs.takePct) / 100;
                if (entry <= 0) return "Error: Entry price must be positive.";
                const stopPrice = entry * (1 - stop);
                const takePrice = entry * (1 + take);
                return `Stop-Loss Price: $${stopPrice.toFixed(2)}, Take-Profit Price: $${takePrice.toFixed(2)}`;
            }
        },
        peRatio: {
            title: "PE Ratio & Implied Value Calculator",
            inputs: [
                { label: "Earnings per Share (EPS)", id: "eps", type: "number" },
                { label: "Expected PE Ratio", id: "pe", type: "number" }
            ],
            calculate: (inputs) => {
                const eps = parseFloat(inputs.eps);
                const pe = parseFloat(inputs.pe);
                if (eps <= 0 || pe <= 0) return "Error: EPS and PE must be positive.";
                const impliedValue = eps * pe;
                return `Implied Value per Share: $${impliedValue.toFixed(2)}`;
            }
        },
        dividendYield: {
            title: "Dividend Yield & Future Dividend Calculator",
            inputs: [
                { label: "Current Dividend per Share", id: "currentDiv", type: "number" },
                { label: "Current Price", id: "price", type: "number" },
                { label: "Expected Growth Rate (%)", id: "growth", type: "number" },
                { label: "Years Ahead", id: "years", type: "number" }
            ],
            calculate: (inputs) => {
                const div = parseFloat(inputs.currentDiv);
                const price = parseFloat(inputs.price);
                const growth = parseFloat(inputs.growth) / 100;
                const years = parseFloat(inputs.years);
                if (price <= 0) return "Error: Price must be positive.";
                const yieldPct = (div / price) * 100;
                const futureDiv = div * Math.pow(1 + growth, years);
                return `Current Yield: ${yieldPct.toFixed(2)}%, Future Dividend: $${futureDiv.toFixed(2)}`;
            }
        },
        earningsGrowth: {
            title: "Earnings Growth Impact Calculator",
            inputs: [
                { label: "Current EPS", id: "currentEps", type: "number" },
                { label: "Growth Rate (%)", id: "growth", type: "number" },
                { label: "Years Ahead", id: "years", type: "number" },
                { label: "Current PE Ratio", id: "pe", type: "number" }
            ],
            calculate: (inputs) => {
                const eps = parseFloat(inputs.currentEps);
                const growth = parseFloat(inputs.growth) / 100;
                const years = parseFloat(inputs.years);
                const pe = parseFloat(inputs.pe);
                if (eps <= 0 || pe <= 0) return "Error: EPS and PE must be positive.";
                const futureEps = eps * Math.pow(1 + growth, years);
                const futurePrice = futureEps * pe;
                return `Future EPS: $${futureEps.toFixed(2)}, Future Price: $${futurePrice.toFixed(2)}`;
            }
        },
        dilution: {
            title: "Dilution Impact Calculator",
            inputs: [
                { label: "Current Shares Outstanding", id: "currentShares", type: "number" },
                { label: "New Shares Issued", id: "newShares", type: "number" },
                { label: "Current Share Value ($)", id: "currentValue", type: "number" }
            ],
            calculate: (inputs) => {
                const current = parseFloat(inputs.currentShares);
                const newShares = parseFloat(inputs.newShares);
                const value = parseFloat(inputs.currentValue);
                if (current <= 0 || value <= 0) return "Error: Current shares and value must be positive.";
                const newValue = (current * value) / (current + newShares);
                return `New Share Value: $${newValue.toFixed(2)}`;
            }
        },
        intrinsicValue: {
            title: "Intrinsic Value Calculator (Simplified DCF)",
            inputs: [
                { label: "Projected Cash Flow ($)", id: "cashFlow", type: "number" },
                { label: "Discount Rate (%)", id: "discount", type: "number" },
                { label: "Growth Rate (%)", id: "growth", type: "number" },
                { label: "Years", id: "years", type: "number" }
            ],
            calculate: (inputs) => {
                const cf = parseFloat(inputs.cashFlow);
                const discount = parseFloat(inputs.discount) / 100;
                const growth = parseFloat(inputs.growth) / 100;
                const years = parseFloat(inputs.years);
                if (discount <= 0) return "Error: Discount rate must be positive.";
                let value = 0;
                for (let i = 1; i <= years; i++) {
                    value += cf * Math.pow(1 + growth, i - 1) / Math.pow(1 + discount, i);
                }
                return `Intrinsic Value: $${value.toFixed(2)}`;
            }
        },
        beta: {
            title: "Beta & Volatility Calculator",
            inputs: [
                { label: "Stock Returns (%)", id: "stockReturns", type: "text" }, // Comma-separated
                { label: "Market Returns (%)", id: "marketReturns", type: "text" }
            ],
            calculate: (inputs) => {
                const stock = inputs.stockReturns.split(',').map(Number);
                const market = inputs.marketReturns.split(',').map(Number);
                if (stock.length !== market.length || stock.length < 2) return "Error: Provide equal, comma-separated returns.";
                const cov = covariance(stock, market);
                const varMarket = variance(market);
                const beta = cov / varMarket;
                const vol = Math.sqrt(variance(stock)) * 100;
                return `Beta: ${beta.toFixed(2)}, Volatility: ${vol.toFixed(2)}%`;
            }
        },
        var: {
            title: "Value-at-Risk (VaR) Calculator",
            inputs: [
                { label: "Investment Amount ($)", id: "amount", type: "number" },
                { label: "Volatility (%)", id: "vol", type: "number" },
                { label: "Confidence Level (%)", id: "confidence", type: "number" },
                { label: "Time Horizon (days)", id: "time", type: "number" }
            ],
            calculate: (inputs) => {
                const amount = parseFloat(inputs.amount);
                const vol = parseFloat(inputs.vol) / 100;
                const conf = parseFloat(inputs.confidence) / 100;
                const time = parseFloat(inputs.time);
                if (amount <= 0 || vol <= 0) return "Error: Amount and volatility must be positive.";
                const z = 1.645; // Approx for 95% confidence
                const varAmount = amount * vol * Math.sqrt(time) * z;
                return `VaR: $${varAmount.toFixed(2)}`;
            }
        },
        sensitivity: {
            title: "Sensitivity Calculator",
            inputs: [
                { label: "Base Value ($)", id: "base", type: "number" },
                { label: "Change in Rate (%)", id: "change", type: "number" },
                { label: "Elasticity", id: "elasticity", type: "number" }
            ],
            calculate: (inputs) => {
                const base = parseFloat(inputs.base);
                const change = parseFloat(inputs.change) / 100;
                const elast = parseFloat(inputs.elasticity);
                const newValue = base * (1 + change * elast);
                return `New Value: $${newValue.toFixed(2)}`;
            }
        },
        correlation: {
            title: "Correlation / Covariance Calculator",
            inputs: [
                { label: "Stock A Returns (%)", id: "returnsA", type: "text" },
                { label: "Stock B Returns (%)", id: "returnsB", type: "text" }
            ],
            calculate: (inputs) => {
                const a = inputs.returnsA.split(',').map(Number);
                const b = inputs.returnsB.split(',').map(Number);
                if (a.length !== b.length || a.length < 2) return "Error: Provide equal, comma-separated returns.";
                const cov = covariance(a, b);
                const corr = cov / (Math.sqrt(variance(a)) * Math.sqrt(variance(b)));
                return `Covariance: ${cov.toFixed(4)}, Correlation: ${corr.toFixed(2)}`;
            }
        },
        scenario: {
            title: "Scenario/Stress Test Calculator",
            inputs: [
                { label: "Base Price ($)", id: "basePrice", type: "number" },
                { label: "Best Case Change (%)", id: "best", type: "number" },
                { label: "Worst Case Change (%)", id: "worst", type: "number" }
            ],
            calculate: (inputs) => {
                const base = parseFloat(inputs.basePrice);
                const best = parseFloat(inputs.best) / 100;
                const worst = parseFloat(inputs.worst) / 100;
                const bestPrice = base * (1 + best);
                const worstPrice = base * (1 + worst);
                return `Best Case: $${bestPrice.toFixed(2)}, Worst Case: $${worstPrice.toFixed(2)}`;
            }
        },
        trailingStop:
