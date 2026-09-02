// Bright Smile Dental — shared front-end behavior
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');
  var scrim = document.querySelector('.nav-scrim');

  function closeNav() {
    if (!mainNav) return;
    mainNav.classList.remove('open');
    if (scrim) scrim.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
  function toggleNav() {
    if (!mainNav) return;
    var isOpen = mainNav.classList.toggle('open');
    if (scrim) scrim.classList.toggle('open', isOpen);
    if (navToggle) navToggle.setAttribute('aria-expanded', String(isOpen));
  }
  if (navToggle) navToggle.addEventListener('click', toggleNav);
  if (scrim) scrim.addEventListener('click', closeNav);
  if (mainNav) {
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- Active nav link highlighting ---------- */
  var currentPage = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.main-nav a[data-nav]').forEach(function (a) {
    if (a.getAttribute('data-nav') === currentPage) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Testimonial carousel ---------- */
  var track = document.querySelector('.testimonial-slides');
  if (track) {
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = document.querySelector('.carousel-dots');
    var prevBtn = document.querySelector('.carousel-btn.prev');
    var nextBtn = document.querySelector('.carousel-btn.next');
    var index = 0;
    var timer;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function () { goTo(i); resetTimer(); });
      if (dotsWrap) dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
    }
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, 6000);
    }
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetTimer(); });
    render();
    resetTimer();
  }

  /* ---------- Service detail expand/collapse ---------- */
  document.querySelectorAll('.service-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.service-item');
      var isOpen = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', String(!isOpen));
      btn.setAttribute('aria-expanded', String(!isOpen));
      btn.querySelector('.label').textContent = isOpen ? 'View details' : 'Hide details';
    });
  });

  /* If URL has #service-slug, open + scroll to that service */
  if (location.hash) {
    var target = document.querySelector(location.hash);
    if (target && target.classList.contains('service-item')) {
      target.setAttribute('data-open', 'true');
      var toggleBtn = target.querySelector('.service-toggle');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'true');
        var lbl = toggleBtn.querySelector('.label');
        if (lbl) lbl.textContent = 'Hide details';
      }
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  /* ---------- Booking form ---------- */
  var bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    var params = new URLSearchParams(location.search);
    var serviceParam = params.get('service');
    var serviceSelect = document.getElementById('service');
    if (serviceParam && serviceSelect) {
      var match = Array.prototype.find.call(serviceSelect.options, function (o) {
        return o.value === serviceParam;
      });
      if (match) serviceSelect.value = serviceParam;
    }

    var dateInput = document.getElementById('date');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(bookingForm)) return;

      var data = Object.fromEntries(new FormData(bookingForm).entries());
      data.id = 'BK-' + Date.now();
      data.submittedAt = new Date().toISOString();

      try {
        var existing = JSON.parse(localStorage.getItem('dentalBookings') || '[]');
        existing.push(data);
        localStorage.setItem('dentalBookings', JSON.stringify(existing));
      } catch (err) { /* storage unavailable — still show confirmation */ }

      var serviceLabel = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : data.service;
      document.getElementById('conf-id').textContent = data.id;
      document.getElementById('conf-service').textContent = serviceLabel;
      document.getElementById('conf-date').textContent = formatDate(data.date);
      document.getElementById('conf-time').textContent = data.time;
      document.getElementById('conf-name').textContent = data.name;
      document.getElementById('conf-contact').textContent = data.phone + '  ·  ' + data.email;

      document.getElementById('booking-form-wrap').classList.add('hidden');
      document.getElementById('booking-confirmation').classList.remove('hidden');
      document.getElementById('booking-confirmation').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    var bookAnotherBtn = document.getElementById('book-another');
    if (bookAnotherBtn) {
      bookAnotherBtn.addEventListener('click', function () {
        bookingForm.reset();
        document.getElementById('booking-confirmation').classList.add('hidden');
        document.getElementById('booking-form-wrap').classList.remove('hidden');
        document.getElementById('booking-form-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  /* ---------- Contact form ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(contactForm)) return;
      document.getElementById('contact-form-wrap').classList.add('hidden');
      document.getElementById('contact-confirmation').classList.remove('hidden');
      contactForm.reset();
    });
  }

  /* ---------- Shared form validation ---------- */
  function validateForm(form) {
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var wrap = field.closest('.field');
      var ok = field.checkValidity();
      if (!wrap) return;
      wrap.classList.toggle('has-error', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      var firstError = form.querySelector('.has-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }
  document.querySelectorAll('.field input, .field select, .field textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      var wrap = field.closest('.field');
      if (wrap && field.checkValidity()) wrap.classList.remove('has-error');
    });
  });

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
});
