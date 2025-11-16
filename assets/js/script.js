fetch('navbar.html')
    .then(res => res.text())
    .then(data => document.getElementById('navbar').innerHTML = data);

fetch('footer.html')
    .then(res => res.text())
    .then(data => document.getElementById('footer').innerHTML = data);

// Donate amount pills -> input sync
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('donateAmount');
    const pills = document.querySelectorAll('.amount-pill');
    if (!pills.length || !input) return;
    pills.forEach(btn => {
        btn.addEventListener('click', () => {
            const amt = parseInt(btn.getAttribute('data-amount') || '0', 10);
            if (amt > 0) input.value = String(amt);
            pills.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            input.focus();
        });
    });
});

// New redesigned donation widget logic + Razorpay integration
document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('donateAmount');
    const amountBtns = document.querySelectorAll('.donation-amount-btn');
    const tierCards = document.querySelectorAll('.tier-card');
    const donateBtn = document.getElementById('rzpDonateBtn');

    function setAmount(val) {
        if (!amountInput) return;
        amountInput.value = String(val);
        amountBtns.forEach(b => b.classList.remove('active'));
        amountBtns.forEach(b => {
            if (parseInt(b.dataset.amount || '0', 10) === parseInt(val, 10)) {
                b.classList.add('active');
            }
        });
    }

    amountBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const amt = parseInt(btn.dataset.amount || '0', 10);
            if (amt >= 100) setAmount(amt);
        });
    });

    tierCards.forEach(card => {
        card.addEventListener('click', () => {
            const amt = parseInt(card.dataset.amount || '0', 10);
            if (amt >= 100) setAmount(amt);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const amt = parseInt(card.dataset.amount || '0', 10);
                if (amt >= 100) setAmount(amt);
            }
        });
    });

    function buildRazorpayOptions(amountRupees) {
        const amtPaise = amountRupees * 100; // Razorpay expects paise
        return {
            key: 'rzp_test_PLACEHOLDERKEY', // TODO: replace with live key_id
            amount: amtPaise,
            currency: 'INR',
            name: 'Tiranga Sports Foundation',
            description: 'Support rural athlete development',
            image: '',
            // order_id: 'order_DBJOWzybf0sJAA', // For production: generate server-side and inject here
            handler: function (response) {
                console.log('Payment success', response);
                alert('Thank you! Payment successful. ID: ' + response.razorpay_payment_id);
            },
            prefill: {
                name: '',
                email: '',
                contact: ''
            },
            notes: {
                purpose: 'Donation',
                campaign: 'AthleteSupport'
            },
            theme: {
                color: '#ff9933'
            }
        };
    }

    function launchRazorpay(amountRupees) {
        if (typeof Razorpay === 'undefined') {
            // Fallback to existing payment link if script not loaded yet
            window.open('https://rzp.io/l/tiranga-support?amount=' + encodeURIComponent(amountRupees), '_blank');
            return;
        }
        const options = buildRazorpayOptions(amountRupees);
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (resp) {
            console.warn('Payment failed', resp.error);
            alert('Payment failed: ' + (resp.error && resp.error.description ? resp.error.description : 'Please try again.'));
        });
        rzp.open();
    }

    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            if (!amountInput) return;
            const val = parseInt(amountInput.value, 10);
            if (isNaN(val) || val < 100) {
                amountInput.focus();
                amountInput.classList.add('shake');
                setTimeout(() => amountInput.classList.remove('shake'), 600);
                return;
            }
            launchRazorpay(val);
        });
    }
});