/* ================================
   WEBCRAFT STUDIO — SCRIPT.JS
   ================================ */

// =====================
// 1. CUSTOM CURSOR
// =====================
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// Cursor hover effects
document.querySelectorAll('a, button, .check-item, .plan, .step, select').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '14px';
    cursor.style.height = '14px';
    cursorFollower.style.width = '48px';
    cursorFollower.style.height = '48px';
    cursorFollower.style.borderColor = 'rgba(200,169,110,0.7)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    cursorFollower.style.width = '32px';
    cursorFollower.style.height = '32px';
    cursorFollower.style.borderColor = 'rgba(200,169,110,0.4)';
  });
});

// =====================
// 2. STICKY HEADER
// =====================
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

// =====================
// 3. MOBILE HAMBURGER
// =====================
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';

  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

// Close mobile nav on link click
document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  });
});

// =====================
// 4. SCROLL REVEAL
// =====================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Stagger child reveals
      const children = entry.target.querySelectorAll('.step, .plan, .perk');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 80);
      });
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// Add reveal class and observe
document.querySelectorAll('.process, .pricing, .contact, .step, .plan').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// =====================
// 5. FORM VALIDATION & SUBMISSION
// =====================
const form = document.getElementById('requestForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const formErrorMsg = document.getElementById('formErrorMsg');

// Live validation on blur
const validatedFields = ['ownerName', 'email', 'phone', 'businessName', 'industry', 'description'];

validatedFields.forEach(fieldId => {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});

function validateField(field) {
  const errEl = document.getElementById('err-' + field.id);
  let error = '';

  if (field.required && !field.value.trim()) {
    error = 'This field is required.';
  } else if (field.type === 'email' && field.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) error = 'Please enter a valid email address.';
  } else if (field.id === 'phone' && field.value) {
    const phoneRegex = /^[+\d\s\-().]{8,}$/;
    if (!phoneRegex.test(field.value)) error = 'Please enter a valid phone number.';
  }

  if (error) {
    field.classList.add('error');
    if (errEl) errEl.textContent = error;
  } else {
    field.classList.remove('error');
    if (errEl) errEl.textContent = '';
  }
  return !error;
}

function validateAll() {
  let isValid = true;
  validatedFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && !validateField(field)) isValid = false;
  });

  // Consent checkbox
  const consent = document.getElementById('consent');
  const consentErr = document.getElementById('err-consent');
  if (!consent.checked) {
    if (consentErr) consentErr.textContent = 'Please agree to be contacted.';
    isValid = false;
  } else {
    if (consentErr) consentErr.textContent = '';
  }

  return isValid;
}

function getFormData() {
  const data = {};
  const fd = new FormData(form);

  // Collect all form values including checkboxes
  for (const [key, value] of fd.entries()) {
    if (data[key]) {
      // Multiple values (checkboxes)
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
    } else {
      data[key] = value;
    }
  }

  // Features checkboxes specifically
  data.features = fd.getAll('features');
  return data;
}

function buildEmailBody(data) {
  const features = Array.isArray(data.features) && data.features.length > 0
    ? data.features.join(', ')
    : 'None selected';

  return `
New Website Request — WebCraft Studio
======================================

CONTACT INFORMATION
-------------------
Full Name:        ${data.ownerName || ''}
Email:            ${data.email || ''}
Phone/WhatsApp:   ${data.phone || ''}

BUSINESS DETAILS
----------------
Business Name:    ${data.businessName || ''}
Industry/Niche:   ${data.industry || ''}
Current Website:  ${data.currentSite || 'N/A'}

PROJECT DETAILS
---------------
Budget Range:     ${data.budget || 'Not specified'}
Desired Launch:   ${data.deadline || 'Not specified'}
Features Needed:  ${features}

BUSINESS DESCRIPTION & GOALS
-----------------------------
${data.description || ''}

======================================
Submitted via WebCraft Studio website
  `.trim();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formErrorMsg.style.display = 'none';

  if (!validateAll()) {
    // Scroll to first error
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  const formData = getFormData();

  // =====================
  // EMAIL SENDING VIA MAILTO (Fallback)
  // =====================
  // To connect to a real backend / email service like EmailJS, Formspree, etc.,
  // replace the sendEmail function below with your preferred integration.

  try {
    const sent = await sendEmail(formData);
    if (sent) {
      form.style.display = 'none';
      formSuccess.style.display = 'block';
      window.scrollTo({ top: formSuccess.offsetTop - 100, behavior: 'smooth' });
    } else {
      throw new Error('Send failed');
    }
  } catch (err) {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    formErrorMsg.style.display = 'block';
    formErrorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// =====================
// EMAIL SERVICE INTEGRATION
// =====================
// This function handles sending form data to YOU (the site owner).
// OPTION A: Formspree (easiest — no backend needed)
// OPTION B: EmailJS
// OPTION C: Mailto fallback (works immediately, opens email client)

async function sendEmail(data) {
//-------------------------------------------------------
//    OPTION A: FORMSPREE
//    1. Sign up at https://formspree.io
//    2. Create a form and get your endpoint URL
//    3. Replace YOUR_FORMSPREE_ENDPOINT below
//    -------------------------------------------------------
const endpoint = 'https://formspree.io/f/xkokveew';
const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    });
   return response.ok;

  /* -------------------------------------------------------
   * OPTION B: EMAILJS
   * 1. Sign up at https://emailjs.com
   * 2. Set up a service + email template
   * 3. Load their SDK in index.html and configure below
   * -------------------------------------------------------
   * await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', data, 'YOUR_PUBLIC_KEY');
   * return true;
   * -------------------------------------------------------*/

  /* -------------------------------------------------------
   * CURRENT: MAILTO FALLBACK
   * Opens the user's email client with all the form data
   * pre-filled. Replace YOUR_EMAIL with your actual email.
   * -------------------------------------------------------*/
  const YOUR_EMAIL = 'forges.web@gmail.com'; // 🔧 CHANGE THIS TO YOUR EMAIL
  const subject = encodeURIComponent(`Website Request — ${data.businessName || 'New Client'}`);
  const body = encodeURIComponent(buildEmailBody(data));
  const mailtoLink = `mailto:${YOUR_EMAIL}?subject=${subject}&body=${body}`;
  window.location.href = mailtoLink;

  // After opening mailto, show success after a short delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1200);
  });
}

// =====================
// 6. SMOOTH SCROLL FOR ANCHOR LINKS
// =====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// =====================
// 7. ACTIVE NAV HIGHLIGHTING
// =====================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// =====================
// 8. PARALLAX ORB ON MOUSE MOVE
// =====================
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  document.querySelectorAll('.orb').forEach((orb, i) => {
    const factor = (i + 1) * 0.4;
    orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
}, { passive: true });

// =====================
// 9. FORM FLOATING LABEL EFFECT (Input fill detection)
// =====================
document.querySelectorAll('input, textarea, select').forEach(input => {
  const checkFilled = () => {
    if (input.value) {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }
  };
  input.addEventListener('change', checkFilled);
  input.addEventListener('input', checkFilled);
  checkFilled();
});

// =====================
// 10. KEYBOARD ACCESSIBILITY
// =====================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// =====================
// 11. PRICING CARD HOVER EFFECT (Subtle tilt)
// =====================
document.querySelectorAll('.plan').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    card.style.transform = `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// =====================
// 12. STEP CARD HOVER
// =====================
document.querySelectorAll('.step').forEach(step => {
  step.addEventListener('mousemove', (e) => {
    const rect = step.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    step.style.transform = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-4px)`;
  });
  step.addEventListener('mouseleave', () => {
    step.style.transform = '';
  });
});

// =====================
// 13. DEADLINE MIN DATE
// =====================
const deadlineInput = document.getElementById('deadline');
if (deadlineInput) {
  const today = new Date();
  today.setDate(today.getDate() + 7); // Minimum 7 days from today
  deadlineInput.min = today.toISOString().split('T')[0];
}

console.log('%c WebCraft Studio 🎨', 'color: #c8a96e; font-size: 1.5rem; font-weight: bold;');
console.log('%c To integrate real email delivery, edit the sendEmail() function in script.js', 'color: #888; font-size: 0.9rem;');
