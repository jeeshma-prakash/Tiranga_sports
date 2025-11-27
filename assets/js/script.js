fetch('navbar.html')
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
        // Custom mobile menu toggle
        const toggler = document.querySelector('.navbar-toggler');
        const collapse = document.getElementById('navbarNav');
        const closeBtn = document.querySelector('.btn-close');
        if (toggler && collapse) {
            toggler.addEventListener('click', function(e) {
                e.preventDefault();
                collapse.classList.toggle('show');
                toggler.setAttribute('aria-expanded', collapse.classList.contains('show'));
            });
        }
        if (closeBtn && collapse) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                collapse.classList.remove('show');
                toggler.setAttribute('aria-expanded', 'false');
            });
        }
    });

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

// Animated counters in About section (re-trigger each time section is viewed)
document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.about-section');
    const stats = Array.from(document.querySelectorAll('.about-stat-number[data-target]'));
    if (!section || !stats.length) return;

    const DURATION = 1500; // ms per animation

    function animate(el) {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        if (isNaN(target)) return;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / DURATION, 1);
            const current = Math.floor(progress * target);
            el.textContent = current + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix; // ensure final exact
            }
        }
        requestAnimationFrame(step);
    }

    function resetAll() {
        stats.forEach(el => {
            const suffix = el.dataset.suffix || '';
            el.textContent = '0' + suffix;
        });
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                stats.forEach(animate);
            } else {
                // Reset so animation plays again when re-entered
                resetAll();
            }
        });
    }, { threshold: 0.5 });

    observer.observe(section);
});

// gallery section
    const cards = Array.from(document.querySelectorAll('.t2-card'));
    const dotsContainer = document.getElementById('t2-dots');
    const track = document.getElementById('t2-track');
    const hint = document.querySelector('.t2-hint');

    // Only initialize carousel if DOM elements exist
    if (track && cards.length && dotsContainer) {

  let current = 0;
  let animating = false;
  let autoplay = true;
  const autoplayDelay = 1500;
  let autoplayTimer = null;
  let touchStartX = 0, touchEndX = 0;

  function createDots(){
    dotsContainer.innerHTML = '';
    cards.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 't2-dot' + (i===0 ? ' t2-active' : '');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  function refresh(){
  cards.forEach(c => c.classList.remove('t2-left','t2-center','t2-right','t2-hidden'));

    const len = cards.length;

    const center = cards[current];
  center.classList.add('t2-center');

    const left = cards[(current - 1 + len) % len];
  left.classList.add('t2-left');

    const right = cards[(current + 1) % len];
  right.classList.add('t2-right');

    cards.forEach((c, i) => {
      if (![current, (current - 1 + len) % len, (current + 1) % len].includes(i))
  c.classList.add('t2-hidden');
    });

    document.querySelectorAll('.t2-dot').forEach((d, i) => {
      d.classList.toggle('t2-active', i === current);
    });
  }

  function goTo(i){
    if (animating) return;
    animating = true;
    current = (i + cards.length) % cards.length;
    refresh();
    setTimeout(()=> animating=false, 700);
    resetAutoplay();
  }
  function next(){ goTo(current+1); }
  function prev(){ goTo(current-1); }

  function startAutoplay(){
    if (!autoplay) return;
    stopAutoplay();
    autoplayTimer = setInterval(next, autoplayDelay);
  }
  function stopAutoplay(){
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  function resetAutoplay(){
    stopAutoplay();
    startAutoplay();
  }

    track.addEventListener('touchstart',e=>{ touchStartX=e.changedTouches[0].clientX;},{passive:true});
    track.addEventListener('touchend',e=>{ touchEndX=e.changedTouches[0].clientX; handleSwipe();});
  function handleSwipe(){
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff)<35) return;
    diff>0 ? next() : prev();
  }

    track.addEventListener('mouseenter',()=>{ stopAutoplay(); if (hint) hint.style.display='block'; });
    track.addEventListener('mouseleave',()=>{ startAutoplay(); if (hint) hint.style.display='none'; });

    document.addEventListener('keydown', (e)=>{
    if (e.key==='ArrowLeft') prev();
    if (e.key==='ArrowRight') next();
  });

    createDots();
    refresh();
    startAutoplay();
    }

    // testimonial section
    (function(){
  const track = document.getElementById('carouselTrack');
  let tl; // GSAP timeline instance
  let resizeTimer;

  // Duplicate items to allow seamless looping
  function duplicateItems() {
    // Clear duplicates if any
    // Keep only original items (first set) before duplicating
    const all = Array.from(track.children);
    // If duplicates already present (more than unique set), reset to first unique set
    // We'll detect uniqueness by using a data attribute
    const originals = all.filter(el => !el.dataset.duplicate);
    // remove any existing duplicates
    all.forEach(el => { if (el.dataset.duplicate) track.removeChild(el); });
    // clone originals and mark them
    originals.forEach(node => {
      const clone = node.cloneNode(true);
      clone.dataset.duplicate = '1';
      track.appendChild(clone);
    });
  }

  // Compute widths and create animation
  function createAnimation() {
    // kill old timeline
    if (tl) tl.kill();

    // ensure duplicates present
    duplicateItems();

    // Wait a frame to ensure layout applied
    requestAnimationFrame(() => {
      // width of the original set (half of track because we duplicated)
      const children = Array.from(track.children);
      const totalWidth = children.reduce((sum, el) => sum + el.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0), 0);
      // original width is half (we duplicated)
      const originalWidth = totalWidth / 2;

      // Medium speed chosen: base factor (seconds per 1000px)
      const baseSecondsPer1000px = 18; // medium. Increase for slower.
      const duration = Math.max(8, (originalWidth / 1000) * baseSecondsPer1000px);

      // Reset transform
      gsap.set(track, { x: 0 });

      // animate x from 0 to -originalWidth
      tl = gsap.to(track, {
        x: -originalWidth,
        duration: duration,
        ease: "none",
        repeat: -1
      });
    });
  }

  // initialize on DOM ready
  function init() {
    // ensure we have at least one child to duplicate
    if (!track || track.children.length === 0) return;

    // Duplicate once and create animation
    duplicateItems();
    createAnimation();

    // Recreate on resize (debounced)
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        createAnimation();
      }, 150);
    });
  }

  // Pause on hover (optional): uncomment to enable
  // track.addEventListener('mouseenter', () => tl && tl.pause());
  // track.addEventListener('mouseleave', () => tl && tl.play());

  // Kick off
  document.addEventListener('DOMContentLoaded', init);
})();

// News/events tab filtering
document.addEventListener('DOMContentLoaded', () => {
  const tabs = Array.from(document.querySelectorAll('.news-tab'));
  const cards = Array.from(document.querySelectorAll('.news-card'));
  if (!tabs.length || !cards.length) return;

  function setActiveTab(selectedTab) {
    tabs.forEach(tab => {
      const isActive = tab === selectedTab;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  function applyFilter(filterValue) {
    cards.forEach(card => {
      const category = (card.dataset.category || '').toLowerCase();
      const shouldShow = filterValue === 'all' || category === filterValue;
      card.classList.toggle('hidden', !shouldShow);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filterValue = (tab.dataset.filter || 'all').toLowerCase();
      setActiveTab(tab);
      applyFilter(filterValue);
    });
  });

  // initialize
  setActiveTab(tabs[0]);
  applyFilter((tabs[0].dataset.filter || 'all').toLowerCase());
});