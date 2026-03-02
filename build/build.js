const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DATA = path.join(__dirname, 'data');
const TEMPLATES = path.join(__dirname, 'templates');
const DOMAIN = 'https://loanbatao.com';
const YEAR = new Date().getFullYear();
const GOOGLE_VERIFICATION = '';

// ─── Loan type metadata ─────────────────────────────────────────────────────
const LOAN_TYPES = {
  'home-loan':             { label: 'Home Loan',             defaultTenure: 20, defaultUnit: 'years', slug: 'home-loan', typicalFOIR: 0.50 },
  'car-loan':              { label: 'Car Loan',              defaultTenure: 5,  defaultUnit: 'years', slug: 'car-loan', typicalFOIR: 0.55 },
  'personal-loan':         { label: 'Personal Loan',         defaultTenure: 3,  defaultUnit: 'years', slug: 'personal-loan', typicalFOIR: 0.45 },
  'education-loan':        { label: 'Education Loan',        defaultTenure: 7,  defaultUnit: 'years', slug: 'education-loan', typicalFOIR: 0.50 },
  'business-loan':         { label: 'Business Loan',         defaultTenure: 5,  defaultUnit: 'years', slug: 'business-loan', typicalFOIR: 0.40 },
  'gold-loan':             { label: 'Gold Loan',             defaultTenure: 1,  defaultUnit: 'years', slug: 'gold-loan', typicalFOIR: 0.60 },
  'bike-loan':             { label: 'Bike Loan',             defaultTenure: 3,  defaultUnit: 'years', slug: 'bike-loan', typicalFOIR: 0.55 },
  'loan-against-property': { label: 'Loan Against Property', defaultTenure: 10, defaultUnit: 'years', slug: 'loan-against-property', typicalFOIR: 0.50 },
};

const LOAN_DOCS = {
  'home-loan': ['PAN Card', 'Aadhaar Card', 'Salary Slips (last 3 months)', 'Bank Statements (last 6 months)', 'Form 16 / ITR (last 2 years)', 'Property Documents', 'Sale Agreement / Allotment Letter', 'Approved Building Plan'],
  'car-loan': ['PAN Card', 'Aadhaar Card', 'Salary Slips (last 3 months)', 'Bank Statements (last 6 months)', 'Form 16 / ITR', 'Proforma Invoice / Quotation from Dealer', 'Driving License'],
  'personal-loan': ['PAN Card', 'Aadhaar Card', 'Salary Slips (last 3 months)', 'Bank Statements (last 6 months)', 'Form 16 / ITR', 'Employment Proof / Offer Letter'],
  'education-loan': ['PAN Card', 'Aadhaar Card', 'Admission Letter from Institute', 'Fee Structure', 'Mark Sheets (10th, 12th, Graduation)', 'Income Proof of Co-applicant', 'Bank Statements of Co-applicant', 'Collateral Documents (if applicable)'],
  'business-loan': ['PAN Card', 'Aadhaar Card', 'Business Registration / GST Certificate', 'ITR (last 3 years)', 'Bank Statements (last 12 months)', 'Profit & Loss Statement', 'Balance Sheet', 'Business Plan (if new)'],
  'gold-loan': ['PAN Card', 'Aadhaar Card', 'Gold Ornaments for Pledge', 'Passport Size Photographs'],
  'bike-loan': ['PAN Card', 'Aadhaar Card', 'Salary Slips (last 3 months)', 'Bank Statements (last 3 months)', 'Proforma Invoice from Dealer', 'Driving License'],
  'loan-against-property': ['PAN Card', 'Aadhaar Card', 'Salary Slips (last 3 months) / ITR (last 3 years)', 'Bank Statements (last 6 months)', 'Property Documents (Title Deed, Sale Deed)', 'Property Valuation Report', 'NOC from Housing Society', 'Encumbrance Certificate'],
};

const LOAN_TIPS = {
  'home-loan': ['Maintain a CIBIL score of 750+ for the best interest rates', 'Keep your total EMIs below 50% of gross income', 'Add a co-applicant to increase your eligible loan amount', 'Clear existing small loans before applying', 'Choose a longer tenure to qualify for a higher amount'],
  'car-loan': ['A higher down payment reduces your loan amount and EMI burden', 'New car loans get better rates than used car loans', 'Compare dealer financing vs bank loans before deciding', 'Keep your loan tenure under 5 years to save on interest', 'A good CIBIL score (750+) helps you negotiate better rates'],
  'personal-loan': ['Personal loans have higher interest rates so keep tenure short', 'Borrow only what you need since the rates are high', 'Compare multiple banks as rates vary significantly', 'Avoid multiple loan applications in a short period', 'Consider pre-approved offers from your existing bank'],
  'education-loan': ['Apply for the loan before the course starts for smoother processing', 'Government bank loans often have lower rates', 'Loans up to Rs.7.5 Lakh usually do not require collateral', 'Interest paid on education loans is tax deductible under Section 80E', 'Some banks offer a moratorium period during the study period'],
  'business-loan': ['Maintain proper books of accounts for at least 3 years', 'A well-prepared business plan increases approval chances', 'Collateral can help you get a lower interest rate', 'Government schemes like MUDRA offer loans at subsidized rates', 'Keep your business credit score separate and healthy'],
  'gold-loan': ['Gold loans are among the fastest to process with minimal documentation', 'You can repay just the interest and pay principal at the end', 'Higher purity gold (22K+) gets better valuation', 'Compare per-gram rates across lenders', 'Keep the loan tenure short to minimize interest cost'],
  'bike-loan': ['A higher down payment reduces your EMI burden', 'Choose the shortest tenure you can afford', 'Check for festive season offers from dealers and banks', 'Ensure you have adequate two-wheeler insurance', 'Pre-approved offers from your bank may have better rates'],
  'loan-against-property': ['Residential properties typically get higher loan-to-value ratios', 'Clear title and proper documentation speed up approval', 'LAP rates are lower than personal loans so use them for larger needs', 'Avoid overleveraging your property', 'Compare LTV ratios across banks as they vary significantly'],
};

const LOAN_STEPS = {
  'home-loan': ['Check your eligibility using the calculator above', 'Compare interest rates across banks', 'Gather required documents (income proof, property documents)', 'Submit application online or visit nearest branch', 'Bank verifies documents and checks credit score', 'Property valuation and legal verification', 'Sanction letter issued with approved amount and terms', 'Sign loan agreement and disbursement begins'],
  'car-loan': ['Check your eligibility and decide the car model', 'Get a proforma invoice from the dealer', 'Compare loan offers from banks and the dealer', 'Submit application with required documents', 'Bank verifies documents and credit score', 'Loan sanction and agreement signing', 'Disbursement directly to the dealer', 'Register the vehicle with bank as hypothecation holder'],
  'personal-loan': ['Check your eligibility using the calculator', 'Compare interest rates from multiple banks', 'Submit online application with documents', 'Bank verifies your credit score and income', 'Loan approval and e-agreement signing', 'Amount disbursed to your bank account'],
  'education-loan': ['Get admission confirmation from the institution', 'Check eligibility and compare bank offers', 'Submit application with academic and income documents', 'Bank verifies documents and institution accreditation', 'Loan sanction with moratorium period details', 'Disbursement directly to the educational institution'],
  'business-loan': ['Prepare a detailed business plan or project report', 'Check eligibility and compare offers', 'Submit application with business and financial documents', 'Bank evaluates business viability and credit history', 'Collateral valuation (if applicable)', 'Sanction and agreement signing', 'Loan disbursement to business account'],
  'gold-loan': ['Visit the nearest branch with your gold ornaments', 'Gold is appraised and valued by the bank', 'Loan amount offered based on gold value and LTV ratio', 'Submit minimal KYC documents', 'Agreement signing and disbursement (often same day)', 'Gold is stored securely by the bank until repayment'],
  'bike-loan': ['Choose your bike and get a proforma invoice', 'Check eligibility and compare loan offers', 'Submit application with income and ID documents', 'Bank verifies and approves the loan', 'Disbursement to dealer account', 'Register the vehicle with bank as hypothecation holder'],
  'loan-against-property': ['Check eligibility and get your property valued', 'Compare offers from multiple banks', 'Submit application with property and income documents', 'Bank conducts legal and technical verification of property', 'Property valuation by bank-approved assessor', 'Loan sanction with approved LTV ratio', 'Agreement signing and mortgage registration', 'Disbursement to your bank account'],
};

// ─── Amount presets per loan type ────────────────────────────────────────────
const AMOUNTS = {
  'home-loan':             [1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000, 7500000, 8000000, 9000000, 10000000, 15000000, 20000000],
  'car-loan':              [300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1200000, 1500000, 2000000],
  'personal-loan':         [100000, 200000, 300000, 400000, 500000, 700000, 1000000, 1500000, 2000000, 2500000],
  'education-loan':        [500000, 700000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000],
  'business-loan':         [500000, 1000000, 1500000, 2000000, 2500000, 3000000, 5000000, 10000000],
  'gold-loan':             [100000, 200000, 300000, 500000, 700000, 1000000],
  'bike-loan':             [50000, 75000, 100000, 150000, 200000, 250000, 300000],
  'loan-against-property': [1000000, 2000000, 3000000, 5000000, 7500000, 10000000, 15000000, 20000000],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatINR(num) {
  return new Intl.NumberFormat('en-IN').format(Math.round(num));
}

function formatINRShort(num) {
  num = Math.round(num);
  if (num >= 10000000) return '\u20B9' + (num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 2) + ' Cr';
  if (num >= 100000) return '\u20B9' + (num / 100000).toFixed(num % 100000 === 0 ? 0 : 2) + ' L';
  if (num >= 1000) return '\u20B9' + (num / 1000).toFixed(0) + 'K';
  return '\u20B9' + formatINR(num);
}

function amountSlug(num) {
  if (num >= 10000000) {
    const cr = num / 10000000;
    return cr === Math.floor(cr) ? cr + '-crore' : cr.toFixed(1).replace('.', '-') + '-crore';
  }
  if (num >= 100000) {
    const l = num / 100000;
    return l === Math.floor(l) ? l + '-lakh' : l.toFixed(1).replace('.', '-') + '-lakh';
  }
  if (num >= 1000) return (num / 1000) + 'k';
  return num.toString();
}

function amountLabel(num) {
  if (num >= 10000000) {
    const cr = num / 10000000;
    return '\u20B9' + (cr === Math.floor(cr) ? cr : cr.toFixed(1)) + ' Crore';
  }
  if (num >= 100000) {
    const l = num / 100000;
    return '\u20B9' + (l === Math.floor(l) ? l : l.toFixed(1)) + ' Lakh';
  }
  if (num >= 1000) return '\u20B9' + (num / 1000) + 'K';
  return '\u20B9' + formatINR(num);
}

function calculateEMI(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate === 0) return Math.round(principal / months);
  const r = annualRate / 12 / 100;
  return Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
}

function emiToPrincipal(emi, annualRate, months) {
  if (months <= 0 || emi <= 0) return 0;
  if (annualRate === 0) return emi * months;
  const r = annualRate / 12 / 100;
  const factor = Math.pow(1 + r, months);
  return Math.round(emi * (factor - 1) / (r * factor));
}

function calculateMaxLoan(monthlyIncome, existingEMIs, foir, annualRate, tenureMonths) {
  const maxEMI = (monthlyIncome * foir) - existingEMIs;
  if (maxEMI <= 0) return 0;
  return emiToPrincipal(maxEMI, annualRate, tenureMonths);
}

function requiredIncome(loanAmount, annualRate, tenureMonths, foir, existingEMIs) {
  const emi = calculateEMI(loanAmount, annualRate, tenureMonths);
  return Math.ceil((emi + (existingEMIs || 0)) / foir);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Load data ───────────────────────────────────────────────────────────────
const banks = JSON.parse(fs.readFileSync(path.join(DATA, 'banks.json'), 'utf8'));
const layoutTemplate = fs.readFileSync(path.join(TEMPLATES, 'layout.html'), 'utf8');
const affiliateData = JSON.parse(fs.readFileSync(path.join(DATA, 'affiliates.json'), 'utf8'));
const affiliateTemplate = fs.readFileSync(path.join(TEMPLATES, 'affiliate.html'), 'utf8');

// ─── Client-side Calculator JS ───────────────────────────────────────────────
const CALCULATOR_JS = `
let currentUnit = 'years';

function formatCurrency(num) {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
}

function formatCurrencyShort(num) {
    num = Math.round(num);
    if (num >= 10000000) return '\\u20B9' + (num / 10000000).toFixed(2) + ' Cr';
    if (num >= 100000) return '\\u20B9' + (num / 100000).toFixed(2) + ' L';
    return '\\u20B9' + formatCurrency(num);
}

function getRawNumber(id) {
    return parseInt(document.getElementById(id).value.replace(/[^0-9]/g, '')) || 0;
}

function formatAmountInput(id) {
    var input = document.getElementById(id);
    var raw = input.value.replace(/[^0-9]/g, '');
    if (raw) input.value = new Intl.NumberFormat('en-IN').format(parseInt(raw));
    calculate();
}

function calculateEMI(principal, annualRate, months) {
    if (principal <= 0 || months <= 0) return 0;
    if (annualRate === 0) return Math.round(principal / months);
    var r = annualRate / 12 / 100;
    return Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
}

function emiToPrincipal(emi, annualRate, months) {
    if (months <= 0 || emi <= 0) return 0;
    if (annualRate === 0) return emi * months;
    var r = annualRate / 12 / 100;
    var factor = Math.pow(1 + r, months);
    return Math.round(emi * (factor - 1) / (r * factor));
}

function drawPieChart(existingEMIs, newEMI, remaining) {
    var canvas = document.getElementById('pieChart');
    if (!canvas) return;
    var container = canvas.parentElement;
    var size = container.offsetWidth;
    canvas.width = size * 2; canvas.height = size * 2;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    var cx = size / 2, cy = size / 2, outerR = size / 2 - 4, innerR = outerR * 0.62;
    var total = existingEMIs + newEMI + remaining;
    if (total <= 0) return;
    var segments = [
        { value: existingEMIs, color: '#f97316' },
        { value: newEMI, color: '#10b981' },
        { value: remaining, color: '#374151' }
    ];
    var startAngle = -Math.PI / 2, gap = 0.03;
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].value <= 0) continue;
        var sweep = (segments[i].value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle + gap / 2, startAngle + sweep - gap / 2);
        ctx.arc(cx, cy, innerR, startAngle + sweep - gap / 2, startAngle + gap / 2, true);
        ctx.closePath();
        ctx.fillStyle = segments[i].color;
        ctx.fill();
        startAngle += sweep;
    }
}

function calculate() {
    var income = getRawNumber('monthlyIncome');
    var existingEMIs = getRawNumber('existingEMIs');
    var rate = parseFloat(document.getElementById('interestRate').value) || 0;
    var tenureVal = parseInt(document.getElementById('tenure').value) || 0;
    var foir = parseFloat(document.getElementById('foirInput') ? document.getElementById('foirInput').value : PREFILL_FOIR) || 0.50;
    var months = currentUnit === 'years' ? tenureVal * 12 : tenureVal;
    if (income <= 0 || months <= 0) return;

    var maxEMI = Math.round(income * foir) - existingEMIs;
    if (maxEMI <= 0) {
        document.getElementById('maxLoanValue').textContent = '\\u20B9 0';
        document.getElementById('emiValue').textContent = '\\u20B9 0';
        document.getElementById('interestValue').textContent = '\\u20B9 0';
        document.getElementById('totalValue').textContent = '\\u20B9 0';
        return;
    }

    var maxLoan = emiToPrincipal(maxEMI, rate, months);
    var emi = calculateEMI(maxLoan, rate, months);
    var totalPayment = emi * months;
    var totalInterest = totalPayment - maxLoan;
    var remaining = income - existingEMIs - emi;

    document.getElementById('maxLoanValue').textContent = '\\u20B9 ' + formatCurrency(maxLoan);
    document.getElementById('emiValue').textContent = '\\u20B9 ' + formatCurrency(emi);
    document.getElementById('interestValue').textContent = formatCurrencyShort(totalInterest);
    document.getElementById('totalValue').textContent = formatCurrencyShort(totalPayment);

    drawPieChart(existingEMIs, emi, Math.max(0, remaining));

    document.getElementById('chartTotal').textContent = '\\u20B9 ' + formatCurrency(income);
    document.getElementById('legendExisting').textContent = '\\u20B9 ' + formatCurrency(existingEMIs);
    document.getElementById('legendNewEMI').textContent = '\\u20B9 ' + formatCurrency(emi);
    document.getElementById('legendRemaining').textContent = '\\u20B9 ' + formatCurrency(Math.max(0, remaining));
    var existPct = income > 0 ? Math.round(existingEMIs / income * 100) : 0;
    var emiPct = income > 0 ? Math.round(emi / income * 100) : 0;
    document.getElementById('legendExistingPct').textContent = existPct + '%';
    document.getElementById('legendNewEMIPct').textContent = emiPct + '%';
    document.getElementById('legendRemainingPct').textContent = Math.max(0, 100 - existPct - emiPct) + '%';
}

// Init
document.getElementById('monthlyIncome').addEventListener('input', function() { formatAmountInput('monthlyIncome'); });
document.getElementById('existingEMIs').addEventListener('input', function() { formatAmountInput('existingEMIs'); });
document.getElementById('interestRate').addEventListener('input', calculate);
document.getElementById('tenure').addEventListener('input', calculate);

document.getElementById('tenureToggle').addEventListener('click', function(e) {
    var btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    this.querySelectorAll('.toggle-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentUnit = btn.dataset.unit;
    calculate();
});

document.querySelector('.btn-calculate').addEventListener('click', function() {
    if (window.innerWidth < 900) document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });
});

// Prefill and calculate
document.getElementById('monthlyIncome').value = new Intl.NumberFormat('en-IN').format(PREFILL_INCOME);
document.getElementById('existingEMIs').value = PREFILL_EXISTING > 0 ? new Intl.NumberFormat('en-IN').format(PREFILL_EXISTING) : '0';
document.getElementById('interestRate').value = PREFILL_RATE;
document.getElementById('tenure').value = PREFILL_TENURE;
currentUnit = PREFILL_UNIT;
document.querySelectorAll('#tenureToggle .toggle-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.unit === PREFILL_UNIT);
});
calculate();
`;

// ─── Page content generators ─────────────────────────────────────────────────

function calculatorHTML() {
  return `
<div class="calc-section">
    <div class="form-panel-wrapper">
        <div class="panel">
            <div class="panel-title"><div class="num">1</div> Your Details</div>
            <div class="section-label">Income Details</div>
            <div class="form-group">
                <label>Monthly Income (\u20B9)</label>
                <div class="input-with-unit">
                    <span class="unit">\u20B9</span>
                    <input type="text" id="monthlyIncome" inputmode="numeric" placeholder="50,000">
                </div>
            </div>
            <div class="form-group">
                <label>Existing EMIs / Monthly Obligations (\u20B9)</label>
                <div class="input-with-unit">
                    <span class="unit">\u20B9</span>
                    <input type="text" id="existingEMIs" inputmode="numeric" placeholder="0">
                </div>
            </div>
            <div class="section-label">Loan Parameters</div>
            <div class="form-row">
                <div class="form-group">
                    <label>Interest Rate (% per annum)</label>
                    <div class="input-with-unit">
                        <input type="number" id="interestRate" class="input-rate" step="0.1" min="0" max="50" placeholder="8.5">
                        <span class="unit unit-right">%</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Loan Tenure</label>
                    <div class="tenure-row">
                        <input type="number" id="tenure" min="1" max="50" placeholder="20">
                        <div class="tenure-toggle" id="tenureToggle">
                            <button class="toggle-btn active" data-unit="years">Yr</button>
                            <button class="toggle-btn" data-unit="months">Mo</button>
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn-calculate" onclick="calculate()">Check Eligibility &rarr;</button>
        </div>
    </div>
    <div id="resultsPanel">
        <div class="panel">
            <div class="panel-title"><div class="num">2</div> Eligibility Results</div>
            <div class="result-cards">
                <div class="result-card highlight">
                    <div class="label">Maximum Eligible Loan</div>
                    <div class="value" id="maxLoanValue">\u20B9 0</div>
                </div>
                <div class="result-card">
                    <div class="label">Monthly EMI</div>
                    <div class="value" id="emiValue">\u20B9 0</div>
                </div>
                <div class="result-card">
                    <div class="label">Total Interest</div>
                    <div class="value" id="interestValue">\u20B9 0</div>
                </div>
                <div class="result-card">
                    <div class="label">Total Payment</div>
                    <div class="value" id="totalValue">\u20B9 0</div>
                </div>
            </div>
            <div class="chart-section">
                <div class="chart-container">
                    <canvas id="pieChart"></canvas>
                    <div class="chart-center">
                        <div class="total-label">Monthly Income</div>
                        <div class="total-value" id="chartTotal">\u20B9 0</div>
                    </div>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-dot" style="background:#f97316"></div>
                        <div class="legend-info">
                            <div class="legend-label">Existing EMIs</div>
                            <div class="legend-value" id="legendExisting">\u20B9 0</div>
                        </div>
                        <div class="legend-percent" id="legendExistingPct">0%</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background:#10b981"></div>
                        <div class="legend-info">
                            <div class="legend-label">New Loan EMI</div>
                            <div class="legend-value" id="legendNewEMI">\u20B9 0</div>
                        </div>
                        <div class="legend-percent" id="legendNewEMIPct">0%</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background:#374151"></div>
                        <div class="legend-info">
                            <div class="legend-label">Remaining Income</div>
                            <div class="legend-value" id="legendRemaining">\u20B9 0</div>
                        </div>
                        <div class="legend-percent" id="legendRemainingPct">0%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

function detailsGridHTML(loan, bank) {
  const items = [
    { label: 'Interest Rate', value: loan.rateRange + '% p.a.', accent: true },
    { label: 'Max Tenure', value: loan.maxTenure + ' Years' },
    { label: 'Max Amount', value: formatINRShort(loan.maxAmount) },
    { label: 'Processing Fee', value: loan.processingFee },
    { label: 'Prepayment', value: loan.prepayment },
    { label: 'Min Income', value: loan.minIncome ? '\u20B9' + formatINR(loan.minIncome) + '/month' : 'Varies' },
  ];
  return '<div class="details-grid">' + items.map(i =>
    `<div class="detail-item"><div class="d-label">${i.label}</div><div class="d-value${i.accent ? ' accent' : ''}">${i.value}</div></div>`
  ).join('') + '</div>';
}

function documentsListHTML(docs) {
  if (!docs || !docs.length) return '';
  return '<ul class="documents-list">' + docs.map(d => `<li>${escapeHtml(d)}</li>`).join('') + '</ul>';
}

function stepsListHTML(steps) {
  if (!steps || !steps.length) return '';
  return '<ol class="steps-list">' + steps.map(s => `<li>${escapeHtml(s)}</li>`).join('') + '</ol>';
}

function tipsListHTML(tips) {
  if (!tips || !tips.length) return '';
  return '<ul class="tips-list">' + tips.map(t => `<li>${escapeHtml(t)}</li>`).join('') + '</ul>';
}

function eligibilityComparisonHTML(loanType, banksList) {
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * (lt.defaultUnit === 'years' ? 12 : 1);
  const rows = banksList
    .filter(b => b.loans[loanType])
    .map(b => {
      const loan = b.loans[loanType];
      const foir = loan.foir || lt.typicalFOIR;
      const maxLoan50k = calculateMaxLoan(50000, 0, foir, loan.rate, months);
      const maxLoan1L = calculateMaxLoan(100000, 0, foir, loan.rate, months);
      return { bank: b, loan, foir, maxLoan50k, maxLoan1L };
    })
    .sort((a, b) => a.loan.rate - b.loan.rate);

  if (!rows.length) return '';
  const bestRate = rows[0].loan.rate;

  return `<div style="overflow-x:auto"><table class="comparison-table">
<thead><tr><th>Bank</th><th>Rate</th><th>Max Amount</th><th>Eligible (50K Income)</th><th>Eligible (1L Income)</th><th>Processing Fee</th></tr></thead>
<tbody>${rows.map(r => {
    const isBest = r.loan.rate === bestRate;
    return `<tr${isBest ? ' class="best-row"' : ''}><td><a href="/${r.bank.slug}-${loanType}">${r.bank.name}</a></td><td class="emi-col">${r.loan.rateRange}%</td><td>${formatINRShort(r.loan.maxAmount)}</td><td>\u20B9${formatINR(r.maxLoan50k)}</td><td>\u20B9${formatINR(r.maxLoan1L)}</td><td>${r.loan.processingFee}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function bankLoanComparisonHTML(bank, loanType, amounts) {
  const loan = bank.loans[loanType];
  if (!loan) return '';
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * (lt.defaultUnit === 'years' ? 12 : 1);
  const foir = loan.foir || lt.typicalFOIR;

  return `<div style="overflow-x:auto"><table class="comparison-table">
<thead><tr><th>Loan Amount</th><th>Monthly EMI</th><th>Total Interest</th><th>Min Income Required</th></tr></thead>
<tbody>${amounts.filter(a => a <= loan.maxAmount).slice(0, 8).map(amount => {
    const emi = calculateEMI(amount, loan.rate, months);
    const totalInterest = (emi * months) - amount;
    const reqIncome = requiredIncome(amount, loan.rate, months, foir, 0);
    return `<tr><td class="amt-col"><a href="/${bank.slug}-${loanType}-for-${amountSlug(amount)}">${amountLabel(amount)}</a></td><td class="emi-col">\u20B9${formatINR(emi)}</td><td>\u20B9${formatINR(totalInterest)}</td><td>\u20B9${formatINR(reqIncome)}/mo</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function amountBankComparisonHTML(loanType, amount, banksList) {
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * (lt.defaultUnit === 'years' ? 12 : 1);
  const rows = banksList
    .filter(b => b.loans[loanType] && amount <= b.loans[loanType].maxAmount)
    .map(b => {
      const loan = b.loans[loanType];
      const foir = loan.foir || lt.typicalFOIR;
      const emi = calculateEMI(amount, loan.rate, months);
      const reqIncome = requiredIncome(amount, loan.rate, months, foir, 0);
      return { bank: b, loan, emi, reqIncome };
    })
    .sort((a, b) => a.reqIncome - b.reqIncome);

  if (!rows.length) return '';
  return `<div style="overflow-x:auto"><table class="comparison-table">
<thead><tr><th>Bank</th><th>Rate</th><th>Monthly EMI</th><th>Min Income Required</th><th>Processing Fee</th></tr></thead>
<tbody>${rows.map(r =>
    `<tr><td><a href="/${r.bank.slug}-${loanType}-for-${amountSlug(amount)}">${r.bank.name}</a></td><td class="emi-col">${r.loan.rateRange}%</td><td>\u20B9${formatINR(r.emi)}</td><td>\u20B9${formatINR(r.reqIncome)}/mo</td><td>${r.loan.processingFee}</td></tr>`
  ).join('')}</tbody></table></div>`;
}

// ─── FAQ generators ──────────────────────────────────────────────────────────

function loanIndexFAQs(loanType) {
  const lt = LOAN_TYPES[loanType];
  const banksOffering = banks.filter(b => b.loans[loanType]);
  const rates = banksOffering.map(b => b.loans[loanType].rate).sort((a, b) => a - b);
  const lowestBank = banksOffering.find(b => b.loans[loanType].rate === rates[0]);
  return [
    { q: `What is ${lt.label} eligibility?`, a: `${lt.label} eligibility is the maximum loan amount a bank will approve for you based on your income, existing obligations, credit score, age, and employment type. Banks use a metric called FOIR (Fixed Obligation to Income Ratio) to determine how much EMI you can afford.` },
    { q: `Which bank has the lowest ${lt.label.toLowerCase()} interest rate in ${YEAR}?`, a: `${lowestBank ? lowestBank.name : 'Various banks'} currently offers the lowest ${lt.label.toLowerCase()} interest rate starting from ${rates[0]}% p.a. in ${YEAR}. Rates vary based on your credit score and profile.` },
    { q: `How is ${lt.label.toLowerCase()} eligibility calculated?`, a: `Eligibility is calculated using the FOIR method. Banks typically allow ${Math.round(lt.typicalFOIR * 100)}% of your gross monthly income for all EMI payments. After deducting existing EMIs, the remaining amount determines your maximum new EMI, which is then converted to the maximum loan amount using the interest rate and tenure.` },
    { q: `What documents are required for a ${lt.label.toLowerCase()}?`, a: `Common documents include ${LOAN_DOCS[loanType].slice(0, 4).join(', ')}, and more. Exact requirements vary by bank and your employment type.` },
    { q: `How can I increase my ${lt.label.toLowerCase()} eligibility?`, a: `You can increase your eligibility by: clearing existing loans, adding a co-applicant, improving your credit score to 750+, choosing a longer tenure, and showing higher income with proper documentation.` },
  ];
}

function bankIndexFAQs(bank) {
  const loanTypes = Object.keys(bank.loans);
  const lowestLoan = loanTypes.reduce((min, lt) => bank.loans[lt].rate < (bank.loans[min] || { rate: 999 }).rate ? lt : min, loanTypes[0]);
  return [
    { q: `What loans does ${bank.name} offer?`, a: `${bank.name} offers ${loanTypes.map(lt => LOAN_TYPES[lt].label).join(', ')}. Each comes with competitive interest rates and flexible tenure options.` },
    { q: `What is the lowest interest rate at ${bank.name}?`, a: `${bank.name}'s lowest interest rate is ${bank.loans[lowestLoan].rate}% p.a. for ${LOAN_TYPES[lowestLoan].label} in ${YEAR}. Actual rates depend on your credit profile.` },
    { q: `What is the minimum income required for a loan from ${bank.name}?`, a: `Minimum income requirements vary by loan type. For example, ${bank.loans[lowestLoan].minIncome ? 'the minimum income for ' + LOAN_TYPES[lowestLoan].label + ' is \u20B9' + formatINR(bank.loans[lowestLoan].minIncome) + ' per month' : 'contact the bank for specific requirements'}.` },
    { q: `Does ${bank.name} charge prepayment penalties?`, a: `Prepayment policies vary by loan type. For ${LOAN_TYPES[lowestLoan].label}: ${bank.loans[lowestLoan].prepayment}. Check specific loan types for detailed policies.` },
    { q: `How do I apply for a loan at ${bank.name}?`, a: `You can apply online through ${bank.name}'s website, visit the nearest branch, or use their mobile banking app. Ensure you have all required documents ready for faster processing.` },
  ];
}

function bankLoanFAQs(bank, loanType, loan) {
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * 12;
  const emiFor50L = calculateEMI(5000000, loan.rate, months);
  return [
    { q: `What is ${bank.name} ${lt.label.toLowerCase()} interest rate in ${YEAR}?`, a: `${bank.name} ${lt.label} interest rate ranges from ${loan.rateRange}% p.a. in ${YEAR}. The actual rate depends on your credit score, income, and loan amount.` },
    { q: `What is the maximum ${lt.label.toLowerCase()} amount from ${bank.name}?`, a: `${bank.name} offers a maximum ${lt.label.toLowerCase()} of ${formatINRShort(loan.maxAmount)} with a tenure of up to ${loan.maxTenure} years.` },
    { q: `What is the processing fee for ${bank.name} ${lt.label.toLowerCase()}?`, a: `The processing fee for ${bank.name} ${lt.label} is ${loan.processingFee}.` },
    { q: `What is the ${bank.name} ${lt.label.toLowerCase()} prepayment policy?`, a: `${bank.name} ${lt.label} prepayment policy: ${loan.prepayment}.` },
    { q: `What income is needed for a ${bank.name} ${lt.label.toLowerCase()}?`, a: `The minimum monthly income required is ${loan.minIncome ? '\u20B9' + formatINR(loan.minIncome) : 'determined by the bank based on your profile'}. Use the calculator above to check your exact eligibility based on your income.` },
  ];
}

function loanAmountFAQs(loanType, amount) {
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * 12;
  const banksOffering = banks.filter(b => b.loans[loanType] && amount <= b.loans[loanType].maxAmount);
  const rates = banksOffering.map(b => b.loans[loanType].rate).sort((a, b) => a - b);
  const lowestRate = rates[0] || 8.5;
  const emi = calculateEMI(amount, lowestRate, months);
  const reqInc = requiredIncome(amount, lowestRate, months, lt.typicalFOIR, 0);
  return [
    { q: `What is the EMI for ${amountLabel(amount)} ${lt.label.toLowerCase()}?`, a: `The EMI for ${amountLabel(amount)} ${lt.label.toLowerCase()} at ${lowestRate}% for ${lt.defaultTenure} years is approximately \u20B9${formatINR(emi)} per month.` },
    { q: `What income is needed for a ${amountLabel(amount)} ${lt.label.toLowerCase()}?`, a: `You need a minimum monthly income of approximately \u20B9${formatINR(reqInc)} for a ${amountLabel(amount)} ${lt.label.toLowerCase()} at ${lowestRate}% interest rate (assuming no existing EMIs and ${Math.round(lt.typicalFOIR * 100)}% FOIR).` },
    { q: `Which bank offers the lowest rate for ${amountLabel(amount)} ${lt.label.toLowerCase()}?`, a: `The lowest interest rate for ${amountLabel(amount)} ${lt.label.toLowerCase()} starts from ${lowestRate}% p.a. in ${YEAR}. Compare all banks above.` },
    { q: `Can I get a ${amountLabel(amount)} ${lt.label.toLowerCase()} with ${'\u20B9'}30,000 salary?`, a: `With a \u20B930,000 monthly salary and no existing EMIs, your maximum ${lt.label.toLowerCase()} eligibility at ${lowestRate}% for ${lt.defaultTenure} years is approximately ${formatINRShort(calculateMaxLoan(30000, 0, lt.typicalFOIR, lowestRate, months))}.` },
    { q: `What is the total interest on a ${amountLabel(amount)} ${lt.label.toLowerCase()}?`, a: `The total interest on ${amountLabel(amount)} ${lt.label.toLowerCase()} at ${lowestRate}% for ${lt.defaultTenure} years is approximately ${formatINRShort(emi * months - amount)}.` },
  ];
}

function bankLoanAmountFAQs(bank, loanType, loan, amount) {
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * 12;
  const emi = calculateEMI(amount, loan.rate, months);
  const foir = loan.foir || lt.typicalFOIR;
  const reqInc = requiredIncome(amount, loan.rate, months, foir, 0);
  const totalInterest = (emi * months) - amount;
  return [
    { q: `What is ${bank.name} ${lt.label.toLowerCase()} EMI for ${amountLabel(amount)}?`, a: `${bank.name} ${lt.label} EMI for ${amountLabel(amount)} at ${loan.rate}% for ${lt.defaultTenure} years is \u20B9${formatINR(emi)} per month.` },
    { q: `What income do I need for ${amountLabel(amount)} ${lt.label.toLowerCase()} from ${bank.name}?`, a: `You need a minimum monthly income of \u20B9${formatINR(reqInc)} for a ${amountLabel(amount)} ${lt.label.toLowerCase()} from ${bank.name} (at ${loan.rate}% rate, assuming no existing EMIs).` },
    { q: `What is the total interest on ${amountLabel(amount)} ${lt.label.toLowerCase()} from ${bank.name}?`, a: `The total interest payable on ${amountLabel(amount)} ${lt.label.toLowerCase()} from ${bank.name} at ${loan.rate}% for ${lt.defaultTenure} years is \u20B9${formatINR(totalInterest)}.` },
    { q: `What is ${bank.name}'s processing fee for ${amountLabel(amount)} ${lt.label.toLowerCase()}?`, a: `${bank.name} charges a processing fee of ${loan.processingFee} for ${lt.label}.` },
    { q: `Can I prepay my ${bank.name} ${lt.label.toLowerCase()}?`, a: `${bank.name} ${lt.label} prepayment policy: ${loan.prepayment}.` },
  ];
}

// ─── FAQ & Breadcrumb HTML / Schema ──────────────────────────────────────────

function faqHTML(faqs) {
  return `<div class="faq-section"><h2>Frequently Asked Questions</h2>${faqs.map(f =>
    `<div class="faq-item"><h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p></div>`
  ).join('')}</div>`;
}

function faqSchemaJSON(faqs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  });
}

function breadcrumbHTML(items) {
  return `<nav class="breadcrumb">${items.map((item, i) =>
    i < items.length - 1
      ? `<a href="${item.url}">${escapeHtml(item.name)}</a><span>›</span>`
      : escapeHtml(item.name)
  ).join('')}</nav>`;
}

function breadcrumbSchemaJSON(items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: i < items.length - 1 ? DOMAIN + item.url : undefined
    }))
  });
}

function linksGridHTML(title, links) {
  if (!links.length) return '';
  return `<div class="links-section"><h2>${escapeHtml(title)}</h2><div class="links-grid">${links.map(l =>
    `<a href="${l.url}">${escapeHtml(l.label)}${l.sub ? `<span class="link-sub">${escapeHtml(l.sub)}</span>` : ''}</a>`
  ).join('')}</div></div>`;
}

// ─── Page builder ────────────────────────────────────────────────────────────

function buildPage(opts) {
  const faqSchema = opts.faqs ? faqSchemaJSON(opts.faqs) : '';
  const bcSchema = opts.breadcrumbs ? breadcrumbSchemaJSON(opts.breadcrumbs) : '';
  const jsonLd = [faqSchema, bcSchema].filter(Boolean).map(s => `<script type="application/ld+json">${s}</script>`).join('\n    ');

  let html = layoutTemplate
    .replace(/\{\{PAGE_TITLE\}\}/g, escapeHtml(opts.title))
    .replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(opts.description))
    .replace(/\{\{META_KEYWORDS\}\}/g, escapeHtml(opts.keywords || ''))
    .replace(/\{\{CANONICAL_PATH\}\}/g, opts.canonical)
    .replace(/\{\{GOOGLE_VERIFICATION\}\}/g, GOOGLE_VERIFICATION ? `<meta name="google-site-verification" content="${GOOGLE_VERIFICATION}">` : '')
    .replace(/\{\{JSON_LD\}\}/g, jsonLd)
    .replace(/\{\{BREADCRUMB\}\}/g, opts.breadcrumbs ? breadcrumbHTML(opts.breadcrumbs) : '')
    .replace(/\{\{CONTENT\}\}/g, opts.content)
    .replace(/\{\{FAQ_SECTION\}\}/g, opts.faqs ? faqHTML(opts.faqs) : '')
    .replace(/\{\{LINKS_SECTION\}\}/g, opts.links || '')
    .replace(/\{\{CALCULATOR_JS\}\}/g, opts.calcJS || '');

  return html;
}

// ─── Page generators ─────────────────────────────────────────────────────────

function generateLoanIndexPage(loanType) {
  const lt = LOAN_TYPES[loanType];
  const banksOffering = banks.filter(b => b.loans[loanType]);
  const rates = banksOffering.map(b => b.loans[loanType].rate).sort((a, b) => a - b);
  const avgRate = rates.length ? +(rates.reduce((s, r) => s + r, 0) / rates.length).toFixed(2) : 8.5;
  const months = lt.defaultTenure * (lt.defaultUnit === 'years' ? 12 : 1);

  const content = `
<div class="page-hero">
    <h1><span class="hl">${lt.label}</span> Eligibility Calculator</h1>
    <p>Check your ${lt.label.toLowerCase()} eligibility from ${banksOffering.length}+ banks. Compare rates from ${rates[0]}% p.a. Free online calculator.</p>
</div>
${calculatorHTML()}
<div class="info-section">
    <h2>${lt.label} Eligibility Criteria ${YEAR}</h2>
    <p>${lt.label} eligibility depends on your monthly income, existing obligations, credit score, age, and employment type. Banks use FOIR (Fixed Obligation to Income Ratio) of around ${Math.round(lt.typicalFOIR * 100)}% to determine your maximum EMI capacity.</p>
    ${eligibilityComparisonHTML(loanType, banks)}
    <h2>Documents Required for ${lt.label}</h2>
    ${documentsListHTML(LOAN_DOCS[loanType])}
    <h2>${lt.label} Eligibility Tips</h2>
    ${tipsListHTML(LOAN_TIPS[loanType])}
    <h2>How to Apply for ${lt.label}</h2>
    ${stepsListHTML(LOAN_STEPS[loanType])}
</div>`;

  const linkSections = [
    linksGridHTML(`${lt.label} from Banks`, banksOffering.slice(0, 15).map(b => ({
      url: `/${b.slug}-${loanType}`,
      label: `${b.name} ${lt.label}`,
      sub: `From ${b.loans[loanType].rateRange}%`
    }))),
    linksGridHTML(`${lt.label} by Amount`, AMOUNTS[loanType].map(a => ({
      url: `/${loanType}-for-${amountSlug(a)}`,
      label: `${amountLabel(a)} ${lt.label}`,
    }))),
    linksGridHTML('Other Loan Types', Object.entries(LOAN_TYPES).filter(([k]) => k !== loanType).map(([k, v]) => ({
      url: `/${k}-eligibility`,
      label: `${v.label} Eligibility`,
    }))),
  ].join('');

  const prefillJS = `var PREFILL_INCOME = 50000;\nvar PREFILL_EXISTING = 0;\nvar PREFILL_RATE = ${avgRate};\nvar PREFILL_TENURE = ${lt.defaultTenure};\nvar PREFILL_UNIT = '${lt.defaultUnit}';\nvar PREFILL_FOIR = ${lt.typicalFOIR};\n`;

  const slug = `${loanType}-eligibility`;
  return {
    slug,
    html: buildPage({
      title: `${lt.label} Eligibility Calculator ${YEAR} | Check All Banks | Loan Batao`,
      description: `Check ${lt.label.toLowerCase()} eligibility from ${banksOffering.length}+ banks. Compare rates from ${rates[0]}% p.a. Find max loan amount based on your income. Free online calculator.`,
      keywords: `${lt.label.toLowerCase()} eligibility, ${lt.label.toLowerCase()} eligibility calculator, ${lt.label.toLowerCase()} eligibility check, ${lt.label.toLowerCase()} calculator ${YEAR}`,
      canonical: slug,
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: `${lt.label} Eligibility` }],
      content,
      faqs: loanIndexFAQs(loanType),
      links: linkSections,
      calcJS: prefillJS + CALCULATOR_JS,
    })
  };
}

function generateBankIndexPage(bank) {
  const loanTypes = Object.keys(bank.loans).filter(lt => LOAN_TYPES[lt]);
  const content = `
<div class="page-hero">
    <h1><span class="hl">${bank.name}</span> Loan Eligibility ${YEAR}</h1>
    <p>Check loan eligibility from ${bank.fullName}. Compare interest rates, documents, and eligibility for all ${loanTypes.length} loan types.</p>
</div>
${calculatorHTML()}
<div class="info-section">
    <h2>${bank.name} Loan Interest Rates & Eligibility ${YEAR}</h2>
    <div style="overflow-x:auto"><table class="comparison-table">
    <thead><tr><th>Loan Type</th><th>Interest Rate</th><th>Max Amount</th><th>Max Tenure</th><th>Processing Fee</th></tr></thead>
    <tbody>${loanTypes.map(lt => {
      const loan = bank.loans[lt];
      return `<tr><td><a href="/${bank.slug}-${lt}">${LOAN_TYPES[lt].label}</a></td><td class="emi-col">${loan.rateRange}%</td><td>${formatINRShort(loan.maxAmount)}</td><td>${loan.maxTenure} years</td><td>${loan.processingFee}</td></tr>`;
    }).join('')}</tbody></table></div>
</div>`;

  const firstLoan = bank.loans[loanTypes[0]];
  const lt0 = LOAN_TYPES[loanTypes[0]];
  const prefillJS = `var PREFILL_INCOME = 50000;\nvar PREFILL_EXISTING = 0;\nvar PREFILL_RATE = ${firstLoan.rate};\nvar PREFILL_TENURE = ${lt0.defaultTenure};\nvar PREFILL_UNIT = '${lt0.defaultUnit}';\nvar PREFILL_FOIR = ${firstLoan.foir || lt0.typicalFOIR};\n`;

  const linkSections = [
    linksGridHTML(`${bank.name} Loan Calculators`, loanTypes.map(lt => ({
      url: `/${bank.slug}-${lt}`,
      label: `${bank.name} ${LOAN_TYPES[lt].label}`,
      sub: `From ${bank.loans[lt].rateRange}%`
    }))),
    linksGridHTML('Other Banks', banks.filter(b => b.slug !== bank.slug).slice(0, 12).map(b => ({
      url: `/${b.slug}-loans`,
      label: `${b.name} Loans`,
    }))),
  ].join('');

  const slug = `${bank.slug}-loans`;
  return {
    slug,
    html: buildPage({
      title: `${bank.name} Loan Eligibility ${YEAR} | All Loans | Loan Batao`,
      description: `Check ${bank.name} loan eligibility for ${loanTypes.map(lt => LOAN_TYPES[lt].label).join(', ')}. Compare rates, amounts, and processing fees.`,
      keywords: `${bank.name} loans, ${bank.name} loan eligibility, ${bank.name} interest rate ${YEAR}`,
      canonical: slug,
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: `${bank.name} Loans` }],
      content,
      faqs: bankIndexFAQs(bank),
      links: linkSections,
      calcJS: prefillJS + CALCULATOR_JS,
    })
  };
}

function generateBankLoanPage(bank, loanType) {
  const loan = bank.loans[loanType];
  if (!loan) return null;
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * 12;
  const foir = loan.foir || lt.typicalFOIR;
  const amounts = AMOUNTS[loanType] || [];

  const content = `
<div class="page-hero">
    <h1><span class="hl">${bank.name}</span> ${lt.label} Eligibility ${YEAR}</h1>
    <p>Check your ${bank.name} ${lt.label.toLowerCase()} eligibility. Rate: ${loan.rateRange}% p.a. Max amount: ${formatINRShort(loan.maxAmount)}.</p>
</div>
${calculatorHTML()}
<div class="info-section">
    <h2>${bank.name} ${lt.label} Details ${YEAR}</h2>
    ${detailsGridHTML(loan, bank)}
    <p>${bank.fullName} offers ${lt.label.toLowerCase()} at an interest rate of ${loan.rateRange}% p.a. with a maximum tenure of ${loan.maxTenure} years. The maximum loan amount is ${formatINRShort(loan.maxAmount)}${loan.minIncome ? ' with a minimum monthly income requirement of \u20B9' + formatINR(loan.minIncome) : ''}.</p>
    <h2>${bank.name} ${lt.label} - EMI & Income Table</h2>
    ${bankLoanComparisonHTML(bank, loanType, amounts)}
    <h2>Documents Required for ${bank.name} ${lt.label}</h2>
    ${documentsListHTML(loan.documents || LOAN_DOCS[loanType])}
    ${loan.features ? `<h2>${bank.name} ${lt.label} Features</h2><ul class="tips-list">${loan.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
</div>`;

  const prefillJS = `var PREFILL_INCOME = 50000;\nvar PREFILL_EXISTING = 0;\nvar PREFILL_RATE = ${loan.rate};\nvar PREFILL_TENURE = ${lt.defaultTenure};\nvar PREFILL_UNIT = '${lt.defaultUnit}';\nvar PREFILL_FOIR = ${foir};\n`;

  const linkSections = [
    linksGridHTML(`${bank.name} ${lt.label} by Amount`, amounts.filter(a => a <= loan.maxAmount).slice(0, 10).map(a => ({
      url: `/${bank.slug}-${loanType}-for-${amountSlug(a)}`,
      label: `${amountLabel(a)}`,
      sub: `EMI \u20B9${formatINR(calculateEMI(a, loan.rate, months))}/mo`
    }))),
    linksGridHTML(`${lt.label} from Other Banks`, banks.filter(b => b.slug !== bank.slug && b.loans[loanType]).slice(0, 12).map(b => ({
      url: `/${b.slug}-${loanType}`,
      label: `${b.name} ${lt.label}`,
      sub: `From ${b.loans[loanType].rateRange}%`
    }))),
    linksGridHTML(`Other ${bank.name} Loans`, Object.keys(bank.loans).filter(k => k !== loanType && LOAN_TYPES[k]).map(k => ({
      url: `/${bank.slug}-${k}`,
      label: `${bank.name} ${LOAN_TYPES[k].label}`,
      sub: `From ${bank.loans[k].rateRange}%`
    }))),
  ].join('');

  const slug = `${bank.slug}-${loanType}`;
  return {
    slug,
    html: buildPage({
      title: `${bank.name} ${lt.label} Eligibility ${YEAR} | Loan Batao`,
      description: `Check ${bank.name} ${lt.label.toLowerCase()} eligibility. Rate: ${loan.rateRange}% p.a. Max amount: ${formatINRShort(loan.maxAmount)}. ${loan.minIncome ? 'Min income: \u20B9' + formatINR(loan.minIncome) + '/month.' : ''} Calculate instantly.`,
      keywords: `${bank.name} ${lt.label.toLowerCase()}, ${bank.name} ${lt.label.toLowerCase()} eligibility, ${bank.name} ${lt.label.toLowerCase()} interest rate`,
      canonical: slug,
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: `${lt.label} Eligibility`, url: `/${loanType}-eligibility` }, { name: bank.name, url: `/${bank.slug}-loans` }, { name: `${bank.name} ${lt.label}` }],
      content,
      faqs: bankLoanFAQs(bank, loanType, loan),
      links: linkSections,
      calcJS: prefillJS + CALCULATOR_JS,
    })
  };
}

function generateLoanAmountPage(loanType, amount) {
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * 12;
  const banksOffering = banks.filter(b => b.loans[loanType] && amount <= b.loans[loanType].maxAmount);
  const rates = banksOffering.map(b => b.loans[loanType].rate).sort((a, b) => a - b);
  const lowestRate = rates[0] || 8.5;
  const emi = calculateEMI(amount, lowestRate, months);
  const reqInc = requiredIncome(amount, lowestRate, months, lt.typicalFOIR, 0);

  const content = `
<div class="page-hero">
    <h1><span class="hl">${amountLabel(amount)}</span> ${lt.label} Eligibility</h1>
    <p>Check minimum income required for a ${amountLabel(amount)} ${lt.label.toLowerCase()}. EMI starts \u20B9${formatINR(emi)}/month. Compare ${banksOffering.length}+ banks.</p>
</div>
${calculatorHTML()}
<div class="info-section">
    <h2>${amountLabel(amount)} ${lt.label} - Income Required ${YEAR}</h2>
    <p>To get a ${amountLabel(amount)} ${lt.label.toLowerCase()}, you need a minimum monthly income of approximately \u20B9${formatINR(reqInc)} (at the lowest rate of ${lowestRate}% for ${lt.defaultTenure} years, assuming no existing EMIs).</p>
    ${amountBankComparisonHTML(loanType, amount, banks)}
</div>`;

  const prefillJS = `var PREFILL_INCOME = ${Math.max(reqInc, 50000)};\nvar PREFILL_EXISTING = 0;\nvar PREFILL_RATE = ${lowestRate};\nvar PREFILL_TENURE = ${lt.defaultTenure};\nvar PREFILL_UNIT = '${lt.defaultUnit}';\nvar PREFILL_FOIR = ${lt.typicalFOIR};\n`;

  const linkSections = [
    linksGridHTML(`${amountLabel(amount)} ${lt.label} from Banks`, banksOffering.slice(0, 15).map(b => ({
      url: `/${b.slug}-${loanType}-for-${amountSlug(amount)}`,
      label: `${b.name}`,
      sub: `From ${b.loans[loanType].rateRange}%`
    }))),
    linksGridHTML(`Other ${lt.label} Amounts`, AMOUNTS[loanType].filter(a => a !== amount).map(a => ({
      url: `/${loanType}-for-${amountSlug(a)}`,
      label: `${amountLabel(a)} ${lt.label}`,
    }))),
  ].join('');

  const slug = `${loanType}-for-${amountSlug(amount)}`;
  return {
    slug,
    html: buildPage({
      title: `${amountLabel(amount)} ${lt.label} Eligibility | Income Required | Loan Batao`,
      description: `Need a ${amountLabel(amount)} ${lt.label.toLowerCase()}? Min income: \u20B9${formatINR(reqInc)}/month. EMI: \u20B9${formatINR(emi)}/month at ${lowestRate}%. Compare ${banksOffering.length}+ banks.`,
      keywords: `${amountLabel(amount)} ${lt.label.toLowerCase()}, ${amountLabel(amount)} ${lt.label.toLowerCase()} eligibility, ${amountLabel(amount)} ${lt.label.toLowerCase()} income required`,
      canonical: slug,
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: `${lt.label} Eligibility`, url: `/${loanType}-eligibility` }, { name: amountLabel(amount) }],
      content,
      faqs: loanAmountFAQs(loanType, amount),
      links: linkSections,
      calcJS: prefillJS + CALCULATOR_JS,
    })
  };
}

function generateBankLoanAmountPage(bank, loanType, amount) {
  const loan = bank.loans[loanType];
  if (!loan || amount > loan.maxAmount) return null;
  const lt = LOAN_TYPES[loanType];
  const months = lt.defaultTenure * 12;
  const foir = loan.foir || lt.typicalFOIR;
  const emi = calculateEMI(amount, loan.rate, months);
  const totalInterest = (emi * months) - amount;
  const totalPayment = emi * months;
  const reqInc = requiredIncome(amount, loan.rate, months, foir, 0);

  const content = `
<div class="page-hero">
    <h1><span class="hl">${bank.name}</span> ${lt.label} for ${amountLabel(amount)}</h1>
    <p>EMI: \u20B9${formatINR(emi)}/month at ${loan.rate}%. Min income: \u20B9${formatINR(reqInc)}/month.</p>
</div>
${calculatorHTML()}
<div class="info-section">
    <h2>${bank.name} ${lt.label} for ${amountLabel(amount)} - Key Details</h2>
    <div class="details-grid">
        <div class="detail-item"><div class="d-label">Interest Rate</div><div class="d-value accent">${loan.rate}% p.a.</div></div>
        <div class="detail-item"><div class="d-label">Monthly EMI</div><div class="d-value">\u20B9${formatINR(emi)}</div></div>
        <div class="detail-item"><div class="d-label">Total Interest</div><div class="d-value">\u20B9${formatINR(totalInterest)}</div></div>
        <div class="detail-item"><div class="d-label">Total Payment</div><div class="d-value">\u20B9${formatINR(totalPayment)}</div></div>
        <div class="detail-item"><div class="d-label">Min Income Required</div><div class="d-value accent">\u20B9${formatINR(reqInc)}/mo</div></div>
        <div class="detail-item"><div class="d-label">Processing Fee</div><div class="d-value">${loan.processingFee}</div></div>
    </div>
    <p>A ${amountLabel(amount)} ${lt.label.toLowerCase()} from ${bank.name} at ${loan.rate}% interest for ${lt.defaultTenure} years will cost you \u20B9${formatINR(emi)} per month as EMI. You will pay a total interest of \u20B9${formatINR(totalInterest)} over the loan tenure. The minimum monthly income needed is \u20B9${formatINR(reqInc)} (assuming no existing EMIs).</p>
</div>`;

  const prefillJS = `var PREFILL_INCOME = ${Math.max(reqInc, 50000)};\nvar PREFILL_EXISTING = 0;\nvar PREFILL_RATE = ${loan.rate};\nvar PREFILL_TENURE = ${lt.defaultTenure};\nvar PREFILL_UNIT = '${lt.defaultUnit}';\nvar PREFILL_FOIR = ${foir};\n`;

  const linkSections = [
    linksGridHTML(`${amountLabel(amount)} ${lt.label} from Other Banks`, banks.filter(b => b.slug !== bank.slug && b.loans[loanType] && amount <= b.loans[loanType].maxAmount).slice(0, 10).map(b => ({
      url: `/${b.slug}-${loanType}-for-${amountSlug(amount)}`,
      label: `${b.name}`,
      sub: `From ${b.loans[loanType].rateRange}%`
    }))),
    linksGridHTML(`Other ${bank.name} ${lt.label} Amounts`, AMOUNTS[loanType].filter(a => a !== amount && a <= loan.maxAmount).slice(0, 8).map(a => ({
      url: `/${bank.slug}-${loanType}-for-${amountSlug(a)}`,
      label: amountLabel(a),
      sub: `EMI \u20B9${formatINR(calculateEMI(a, loan.rate, months))}/mo`
    }))),
  ].join('');

  const slug = `${bank.slug}-${loanType}-for-${amountSlug(amount)}`;
  return {
    slug,
    html: buildPage({
      title: `${bank.name} ${lt.label} for ${amountLabel(amount)} (${YEAR}) | Loan Batao`,
      description: `${bank.name} ${lt.label.toLowerCase()} for ${amountLabel(amount)}: EMI \u20B9${formatINR(emi)}/month at ${loan.rate}%. Min income: \u20B9${formatINR(reqInc)}/month. Processing fee: ${loan.processingFee}.`,
      keywords: `${bank.name} ${lt.label.toLowerCase()} ${amountLabel(amount)}, ${bank.name} ${lt.label.toLowerCase()} EMI for ${amountLabel(amount)}`,
      canonical: slug,
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: `${lt.label} Eligibility`, url: `/${loanType}-eligibility` }, { name: bank.name, url: `/${bank.slug}-${loanType}` }, { name: amountLabel(amount) }],
      content,
      faqs: bankLoanAmountFAQs(bank, loanType, loan, amount),
      links: linkSections,
      calcJS: prefillJS + CALCULATOR_JS,
    })
  };
}

// ─── Affiliate page builder ──────────────────────────────────────────────────

function buildAffiliatePage(opts) {
  const { title, description, keywords, canonicalPath, breadcrumb, breadcrumbItems, content, faqSection, linksSection, disclaimer, jsonLd } = opts;

  let allJsonLd = '';
  if (jsonLd) allJsonLd += `<script type="application/ld+json">\n${jsonLd}\n</script>\n`;
  if (breadcrumbItems) allJsonLd += `    <script type="application/ld+json">\n${breadcrumbSchemaJSON(breadcrumbItems)}\n</script>`;

  const verificationTag = GOOGLE_VERIFICATION ? `<meta name="google-site-verification" content="${GOOGLE_VERIFICATION}">` : '';

  let html = affiliateTemplate
    .replace(/\{\{PAGE_TITLE\}\}/g, title)
    .replace(/\{\{META_DESCRIPTION\}\}/g, description)
    .replace(/\{\{META_KEYWORDS\}\}/g, keywords || '')
    .replace(/\{\{CANONICAL_PATH\}\}/g, canonicalPath)
    .replace('{{JSON_LD}}', allJsonLd)
    .replace('{{GOOGLE_VERIFICATION}}', verificationTag)
    .replace('{{BREADCRUMB}}', breadcrumb || '')
    .replace('{{CONTENT}}', content)
    .replace('{{FAQ_SECTION}}', faqSection || '')
    .replace('{{LINKS_SECTION}}', linksSection || '')
    .replace('{{DISCLAIMER}}', disclaimer || '');

  return html;
}

function renderGuideContent(blocks) {
  return blocks.map(block => {
    switch (block.type) {
      case 'h2':
        return `<h2>${escapeHtml(block.text)}</h2>`;
      case 'h3':
        return `<h3>${escapeHtml(block.text)}</h3>`;
      case 'p':
        return `<p>${escapeHtml(block.text)}</p>`;
      case 'ul':
        return `<ul>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      case 'ol':
        return `<ol>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
      case 'table':
        return `<div class="table-container" style="margin:16px 0 24px;"><table class="comparison-table"><thead><tr>${block.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'score-cards':
        return `<div class="score-range-grid">
        <div class="score-card excellent"><div class="score-range">750 – 900</div><div class="score-label">Excellent</div><div class="score-impact">Best rates &amp; instant approval</div></div>
        <div class="score-card good"><div class="score-range">700 – 749</div><div class="score-label">Good</div><div class="score-impact">Standard rates, easy approval</div></div>
        <div class="score-card fair"><div class="score-range">600 – 699</div><div class="score-label">Fair</div><div class="score-impact">Higher rates, limited options</div></div>
        <div class="score-card poor"><div class="score-range">300 – 599</div><div class="score-label">Poor</div><div class="score-impact">Difficult to get approval</div></div>
    </div>`;
      default:
        return '';
    }
  }).join('\n    ');
}

function generateAffiliatePage(pageData) {
  const { slug, title, description, keywords, heroTitle, heroSub, loanType, sortBy, topPicks, editorNotes, badges, ctaText, faqs, contentType } = pageData;

  // --- Guide content pages (no bank comparison tables) ---
  if (contentType === 'guide') {
    const guideBlocks = pageData.guideContent || [];
    const ctaLabel = pageData.ctaLabel || 'Check Eligibility';
    const ctaUrl = pageData.ctaUrl || '/';

    const content = `
<section class="page-hero">
    <h1><span class="hl">${escapeHtml(heroTitle)}</span></h1>
    <p>${escapeHtml(heroSub)}</p>
    <div class="updated">Updated: ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</div>
</section>

<!-- Ad: Below Hero -->
<div style="max-width:800px;margin:0 auto 24px;padding:0 24px;text-align:center;">
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8235932614579966" data-ad-slot="auto" data-ad-format="horizontal" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<section class="info-section">
    ${renderGuideContent(guideBlocks)}
</section>

<section class="calc-cta">
    <div class="calc-cta-box">
        <h3>${escapeHtml(ctaLabel)}</h3>
        <p>Use our free calculator to check your eligibility based on your income, existing EMIs, and credit profile.</p>
        <a href="${ctaUrl}" class="calc-cta-btn">${escapeHtml(ctaLabel)} \u2192</a>
    </div>
</section>`;

    // --- Internal links ---
    const otherAffiliateLinks = affiliateData.pages
      .filter(p => p.slug !== slug)
      .map(p => ({
        url: `/${p.slug}`,
        label: p.heroTitle,
        sub: p.loanType ? (LOAN_TYPES[p.loanType] ? LOAN_TYPES[p.loanType].label : '') : 'Guide',
      }));

    const loanTypeLinks = Object.keys(LOAN_TYPES).map(lt2 => ({
      url: `/${lt2}-eligibility`,
      label: `${LOAN_TYPES[lt2].label} Eligibility`,
    }));

    const links =
      linksGridHTML('More Guides & Comparisons', otherAffiliateLinks) +
      linksGridHTML('Eligibility Calculators', loanTypeLinks);

    // --- FAQ ---
    const faqItems = faqs.map(f => `
    <div class="faq-item">
        <h3>${escapeHtml(f.q)}</h3>
        <p>${escapeHtml(f.a)}</p>
    </div>`).join('');

    const faqSection = `
<section class="faq-section">
    <h2>Frequently Asked Questions</h2>
    ${faqItems}
</section>`;

    // --- Disclaimer ---
    const disclaimer = `
<div class="disclaimer">
    <div class="disclaimer-box">
        <strong>Disclaimer:</strong> The information provided on this page is for general guidance only. Eligibility criteria, interest rates, and policies vary across banks and may change without notice. We recommend verifying details directly with the respective bank or NBFC. We may earn a referral commission when you apply through links on this page, at no extra cost to you. Last updated: ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}.
    </div>
</div>`;

    // --- Breadcrumbs ---
    const bcItems = [
      { name: 'Home', url: '/' },
      { name: heroTitle },
    ];

    const html = buildAffiliatePage({
      title,
      description,
      keywords,
      canonicalPath: slug,
      breadcrumb: breadcrumbHTML(bcItems),
      breadcrumbItems: bcItems,
      content,
      faqSection,
      linksSection: links,
      disclaimer,
      jsonLd: faqSchemaJSON(faqs),
    });

    return { slug, html };
  }

  // --- Standard affiliate/comparison pages ---
  const lt = LOAN_TYPES[loanType];

  // Get banks with this loan type, sorted appropriately
  const banksWithLoan = banks
    .filter(b => b.loans[loanType])
    .sort((a, b) => {
      const loanA = a.loans[loanType];
      const loanB = b.loans[loanType];
      if (sortBy === 'minIncome') return (loanA.minIncome || 999999) - (loanB.minIncome || 999999);
      if (sortBy === 'minCreditScore') return (loanA.minCreditScore || 999) - (loanB.minCreditScore || 999);
      return loanA.rate - loanB.rate; // default: sort by rate
    });

  // --- Top 3 Picks ---
  const topBanks = topPicks
    .map(s => banks.find(b => b.slug === s))
    .filter(b => b && b.loans[loanType]);

  const defaultAmt = AMOUNTS[loanType][Math.floor(AMOUNTS[loanType].length / 2)];
  const months = lt.defaultTenure * (lt.defaultUnit === 'years' ? 12 : 1);

  const picksHTML = topBanks.map((bank, i) => {
    const loan = bank.loans[loanType];
    const badgeText = badges[bank.slug] || '';
    const note = editorNotes[bank.slug] || '';
    const emi = calculateEMI(defaultAmt, loan.rate, months);
    const foir = loan.foir || lt.typicalFOIR;
    const maxLoan50k = calculateMaxLoan(50000, 0, foir, loan.rate, months);

    return `
    <div class="pick-card${i === 0 ? ' featured' : ''}">
        ${badgeText ? `<div class="pick-badge">${escapeHtml(badgeText)}</div>` : ''}
        <div class="pick-rank">#${i + 1} Pick</div>
        <div class="pick-name">${escapeHtml(bank.fullName)}</div>
        <div class="pick-rate">${loan.rateRange}% <small>p.a.</small></div>
        <p class="pick-note">${escapeHtml(note)}</p>
        <ul class="pick-features">
            <li>Min Income: \u20B9${formatINR(loan.minIncome || 0)}/month</li>
            <li>Min CIBIL: ${loan.minCreditScore || 'N/A'}</li>
            <li>Max Tenure: ${loan.maxTenure} years</li>
            <li>Processing Fee: ${escapeHtml(loan.processingFee)}</li>
            <li>Eligibility on \u20B950K salary: ${formatINRShort(maxLoan50k)}</li>
        </ul>
        <a href="/${bank.slug}-${loanType}" class="pick-cta">${escapeHtml(ctaText)} \u2192</a>
    </div>`;
  }).join('');

  // --- Full Comparison Table (with eligibility-focused columns) ---
  const tableRows = banksWithLoan.map(bank => {
    const loan = bank.loans[loanType];
    const foir = loan.foir || lt.typicalFOIR;
    const maxLoan50k = calculateMaxLoan(50000, 0, foir, loan.rate, months);
    return `<tr>
        <td class="bank-name"><a href="/${bank.slug}-${loanType}" style="color:var(--text);text-decoration:none;">${escapeHtml(bank.name)}</a></td>
        <td class="rate-col">${loan.rateRange}%</td>
        <td>\u20B9${formatINR(loan.minIncome || 0)}/mo</td>
        <td>${loan.minCreditScore || 'N/A'}</td>
        <td>${formatINRShort(maxLoan50k)}</td>
        <td>${escapeHtml(loan.processingFee)}</td>
        <td class="cta-col"><a href="/${bank.slug}-${loanType}" class="table-cta">${escapeHtml(ctaText)} \u2192</a></td>
    </tr>`;
  }).join('');

  // --- Content varies by page type ---
  let extraContent = '';

  if (contentType === 'cibil-guide') {
    // Special content for CIBIL score page
    extraContent = `
<section class="info-section">
    <h2>Understanding Your CIBIL Score</h2>
    <p>Your CIBIL score (credit score) is a 3-digit number between 300 and 900 that represents your creditworthiness. Banks and NBFCs use this score to evaluate your loan and credit card applications.</p>

    <div class="score-range-grid">
        <div class="score-card excellent">
            <div class="score-range">750 - 900</div>
            <div class="score-label">Excellent</div>
            <div class="score-impact">Best rates & instant approval</div>
        </div>
        <div class="score-card good">
            <div class="score-range">700 - 749</div>
            <div class="score-label">Good</div>
            <div class="score-impact">Standard rates, easy approval</div>
        </div>
        <div class="score-card fair">
            <div class="score-range">600 - 699</div>
            <div class="score-label">Fair</div>
            <div class="score-impact">Higher rates, limited options</div>
        </div>
        <div class="score-card poor">
            <div class="score-range">300 - 599</div>
            <div class="score-label">Poor</div>
            <div class="score-impact">Difficult to get approval</div>
        </div>
    </div>

    <h3>Minimum CIBIL Score by Loan Type</h3>
    <p>Different loan types have different minimum credit score requirements. Here is a general guideline:</p>
    <ul>
        <li><strong>Home Loan:</strong> 675+ (some banks accept 650)</li>
        <li><strong>Personal Loan:</strong> 700+ (NBFCs may accept 600+)</li>
        <li><strong>Car Loan:</strong> 675+ (dealer financing may be more flexible)</li>
        <li><strong>Education Loan:</strong> 625+ (co-applicant score matters more)</li>
        <li><strong>Business Loan:</strong> 675+ (higher for unsecured loans)</li>
        <li><strong>Gold Loan:</strong> 575+ (minimal credit score focus)</li>
        <li><strong>Loan Against Property:</strong> 650+ (secured, so slightly relaxed)</li>
    </ul>

    <h3>How to Check CIBIL Score for Free</h3>
    <ol>
        <li><strong>Official CIBIL Website:</strong> Visit myscore.cibil.com for 1 free credit report per year</li>
        <li><strong>Bank Apps:</strong> SBI YONO, HDFC Bank, ICICI iMobile, and Axis Bank apps offer free score checks for account holders</li>
        <li><strong>Third-Party Platforms:</strong> Paytm, PhonePe, BankBazaar, and Paisabazaar provide free credit score monitoring</li>
        <li><strong>RBI Mandate:</strong> Under RBI guidelines, all credit bureaus must provide one free credit report per year</li>
    </ol>

    <h3>Tips to Improve Your CIBIL Score</h3>
    <ul>
        <li>Pay all EMIs and credit card bills on or before the due date</li>
        <li>Keep credit card utilization below 30% of your credit limit</li>
        <li>Avoid applying for multiple loans or credit cards in a short period</li>
        <li>Maintain a healthy mix of secured (home/car loan) and unsecured (personal loan/credit card) credit</li>
        <li>Review your CIBIL report regularly and dispute any errors</li>
        <li>Do not close old credit cards as they contribute to credit history length</li>
        <li>Clear any overdue or settled accounts by paying the full amount</li>
    </ul>
</section>`;
  } else if (contentType === 'documents-guide') {
    // Special content for documents checklist page
    const homeLoanDocs = LOAN_DOCS['home-loan'] || [];
    extraContent = `
<section class="info-section">
    <h2>Home Loan Documents Checklist</h2>
    <p>Having all documents ready before applying speeds up the approval process significantly. Here is the complete checklist organized by category.</p>

    <h3>Identity & Address Proof</h3>
    <ul class="documents-list">
        <li>PAN Card (mandatory for all applicants)</li>
        <li>Aadhaar Card (serves as both ID and address proof)</li>
        <li>Passport / Voter ID / Driving License (additional ID proof)</li>
        <li>Passport-size photographs (2-4 copies)</li>
    </ul>

    <h3>Income Documents (Salaried Applicants)</h3>
    <ul class="documents-list">
        <li>Salary Slips (last 3 months)</li>
        <li>Bank Statements (last 6 months showing salary credits)</li>
        <li>Form 16 / ITR (last 2 years)</li>
        <li>Employment Proof / Offer Letter / Appointment Letter</li>
        <li>Bonus / Incentive Letters (if claiming variable pay)</li>
    </ul>

    <h3>Income Documents (Self-Employed Applicants)</h3>
    <ul class="documents-list">
        <li>ITR with Computation of Income (last 3 years)</li>
        <li>Balance Sheet & Profit and Loss Statement (last 3 years, audited)</li>
        <li>Business Registration Certificate / GST Registration</li>
        <li>Bank Statements (last 12 months)</li>
        <li>Business Proof (Partnership Deed / MOA / AOA)</li>
    </ul>

    <h3>Property Documents</h3>
    <ul class="documents-list">
        <li>Sale Agreement / Allotment Letter</li>
        <li>Title Deed / Conveyance Deed</li>
        <li>Approved Building Plan from Municipal Authority</li>
        <li>Occupancy Certificate (for ready properties)</li>
        <li>Encumbrance Certificate (last 13-30 years)</li>
        <li>Property Tax Receipts</li>
        <li>NOC from Housing Society (for resale)</li>
        <li>Builder-Buyer Agreement (for under-construction)</li>
    </ul>

    <h3>Additional Documents (If Applicable)</h3>
    <ul class="documents-list">
        <li>Existing Loan Statements (for balance transfer)</li>
        <li>Co-applicant Documents (same set of ID, address, and income proof)</li>
        <li>Power of Attorney (if applicable)</li>
        <li>NRI Documents: NRE/NRO Bank Statements, Passport with Visa, Employment Contract Abroad</li>
    </ul>

    <h3>Bank-Wise Document Requirements</h3>
    <p>While the core documents remain similar across banks, some have specific additional requirements:</p>
</section>`;
  }

  const content = `
<section class="page-hero">
    <h1><span class="hl">${escapeHtml(heroTitle)}</span> in India ${YEAR}</h1>
    <p>${escapeHtml(heroSub)}</p>
    <div class="updated">Updated: ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</div>
</section>

<!-- Ad: Below Hero -->
<div style="max-width:1200px;margin:0 auto 24px;padding:0 24px;text-align:center;">
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8235932614579966" data-ad-slot="auto" data-ad-format="horizontal" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<section class="top-picks">
    <h2 class="top-picks-title">Our Top Picks</h2>
    <div class="picks-grid">
        ${picksHTML}
    </div>
</section>

<section class="comparison-section">
    <h2>All ${escapeHtml(lt.label)} Options \u2014 Full Comparison</h2>
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px;">Sorted by ${sortBy === 'minIncome' ? 'minimum income requirement' : sortBy === 'minCreditScore' ? 'minimum credit score' : 'interest rate'} (lowest first). Eligibility based on \u20B950,000 monthly income.</p>
    <div class="table-container">
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Bank</th>
                    <th>Interest Rate</th>
                    <th>Min Income</th>
                    <th>Min CIBIL</th>
                    <th>Eligible (\u20B950K)</th>
                    <th>Processing Fee</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </div>
</section>

${extraContent}

<section class="calc-cta">
    <div class="calc-cta-box">
        <h3>Check Your ${escapeHtml(lt.label)} Eligibility</h3>
        <p>Know your exact eligible loan amount based on your income, existing EMIs, and credit profile.</p>
        <a href="/${loanType}-eligibility" class="calc-cta-btn">Open Eligibility Calculator \u2192</a>
    </div>
</section>`;

  // --- Internal links ---
  const otherAffiliateLinks = affiliateData.pages
    .filter(p => p.slug !== slug)
    .map(p => ({
      url: `/${p.slug}`,
      label: p.heroTitle,
      sub: p.loanType === loanType ? '' : (LOAN_TYPES[p.loanType] ? LOAN_TYPES[p.loanType].label : ''),
    }));

  const loanTypeLinks = Object.keys(LOAN_TYPES).map(lt2 => ({
    url: `/${lt2}-eligibility`,
    label: `${LOAN_TYPES[lt2].label} Eligibility`,
  }));

  const links =
    linksGridHTML('More Comparisons', otherAffiliateLinks) +
    linksGridHTML('Eligibility Calculators', loanTypeLinks);

  // --- FAQ ---
  const faqItems = faqs.map(f => `
    <div class="faq-item">
        <h3>${escapeHtml(f.q)}</h3>
        <p>${escapeHtml(f.a)}</p>
    </div>`).join('');

  const faqSection = `
<section class="faq-section">
    <h2>Frequently Asked Questions</h2>
    ${faqItems}
</section>`;

  // --- Disclaimer ---
  const disclaimer = `
<div class="disclaimer">
    <div class="disclaimer-box">
        <strong>Disclaimer:</strong> Interest rates, eligibility criteria, and loan details shown on this page are sourced from official bank websites and are for reference only. Actual rates and eligibility may vary based on your credit profile, income, loan amount, and bank's internal policies. We may earn a referral commission when you apply through links on this page, at no extra cost to you. This does not affect our rankings or recommendations. Last verified: ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}.
    </div>
</div>`;

  // --- Breadcrumbs (Loan Batao uses {url, name} format) ---
  const bcItems = [
    { name: 'Home', url: '/' },
    { name: heroTitle },
  ];

  const html = buildAffiliatePage({
    title,
    description,
    keywords,
    canonicalPath: slug,
    breadcrumb: breadcrumbHTML(bcItems),
    breadcrumbItems: bcItems,
    content,
    faqSection,
    linksSection: links,
    disclaimer,
    jsonLd: faqSchemaJSON(faqs),
  });

  return { slug, html };
}

// ─── Sitemap & robots ────────────────────────────────────────────────────────

function generateSitemap(allPages) {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    { loc: '', priority: '1.0', changefreq: 'weekly' },
    { loc: 'privacy', priority: '0.3', changefreq: 'yearly' },
    ...allPages.map(p => ({
      loc: p,
      priority: p.includes('-for-') ? '0.6' : (p.includes('-eligibility') ? '0.9' : '0.8'),
      changefreq: 'monthly'
    }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u =>
    `  <url>\n    <loc>${DOMAIN}/${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  ).join('\n')}\n</urlset>`;
}

function generateRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`;
}

// ─── BUILD ───────────────────────────────────────────────────────────────────

console.log('Building Loan Batao...');
console.log(`Banks: ${banks.length} | Loan Types: ${Object.keys(LOAN_TYPES).length}`);

// Clean dist
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
ensureDir(DIST);

// Copy static files
['index.html', 'privacy.html', 'ads.txt'].forEach(file => {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(DIST, file));
});

const allPages = [];
let pageCount = 0;

// 1. Loan type index pages
console.log('Generating loan type index pages...');
for (const loanType of Object.keys(LOAN_TYPES)) {
  const page = generateLoanIndexPage(loanType);
  fs.writeFileSync(path.join(DIST, page.slug + '.html'), page.html);
  allPages.push(page.slug);
  pageCount++;
}
console.log(`  ✓ ${pageCount} loan index pages`);

// 2. Bank index pages
const bankStart = pageCount;
console.log('Generating bank index pages...');
for (const bank of banks) {
  const page = generateBankIndexPage(bank);
  fs.writeFileSync(path.join(DIST, page.slug + '.html'), page.html);
  allPages.push(page.slug);
  pageCount++;
}
console.log(`  ✓ ${pageCount - bankStart} bank index pages`);

// 3. Bank + Loan pages
const blStart = pageCount;
console.log('Generating bank + loan pages...');
for (const bank of banks) {
  for (const loanType of Object.keys(LOAN_TYPES)) {
    const page = generateBankLoanPage(bank, loanType);
    if (!page) continue;
    fs.writeFileSync(path.join(DIST, page.slug + '.html'), page.html);
    allPages.push(page.slug);
    pageCount++;
  }
}
console.log(`  ✓ ${pageCount - blStart} bank+loan pages`);

// 4. Loan + Amount pages
const laStart = pageCount;
console.log('Generating loan + amount pages...');
for (const loanType of Object.keys(LOAN_TYPES)) {
  for (const amount of AMOUNTS[loanType]) {
    const page = generateLoanAmountPage(loanType, amount);
    fs.writeFileSync(path.join(DIST, page.slug + '.html'), page.html);
    allPages.push(page.slug);
    pageCount++;
  }
}
console.log(`  ✓ ${pageCount - laStart} loan+amount pages`);

// 5. Bank + Loan + Amount pages
const blaStart = pageCount;
console.log('Generating bank + loan + amount pages...');
for (const bank of banks) {
  for (const loanType of Object.keys(LOAN_TYPES)) {
    if (!bank.loans[loanType]) continue;
    for (const amount of AMOUNTS[loanType]) {
      const page = generateBankLoanAmountPage(bank, loanType, amount);
      if (!page) continue;
      fs.writeFileSync(path.join(DIST, page.slug + '.html'), page.html);
      allPages.push(page.slug);
      pageCount++;
    }
  }
}
console.log(`  ✓ ${pageCount - blaStart} bank+loan+amount pages`);

// 6. Affiliate comparison pages
const affStart = pageCount;
console.log('Generating affiliate comparison pages...');
for (const page of affiliateData.pages) {
  const result = generateAffiliatePage(page);
  fs.writeFileSync(path.join(DIST, result.slug + '.html'), result.html);
  allPages.push(result.slug);
  pageCount++;
}
console.log(`  ✓ ${pageCount - affStart} affiliate pages`);

// 7. Sitemap & robots
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), generateSitemap(allPages));
fs.writeFileSync(path.join(DIST, 'robots.txt'), generateRobotsTxt());

console.log(`\nBuild complete! Total pages: ${pageCount + 3} (${pageCount} generated + 3 static)`);
console.log(`Sitemap entries: ${allPages.length + 2}`);
console.log(`Output: ${DIST}`);
