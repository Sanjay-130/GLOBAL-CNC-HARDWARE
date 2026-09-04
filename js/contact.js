// Global CNC Hardware - Contact Form JavaScript

const RECEIVER_EMAIL = "globalcnchardware@gmail.com";

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const successBox = document.getElementById('form-success-box');
  const resetBtn = document.getElementById('reset-form-btn');
  const senderNameSpan = document.getElementById('success-sender-name');

  const triggerMailtoFallback = (name, email, company, message) => {
    const subject = encodeURIComponent(`CNC Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Full Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:${RECEIVER_EMAIL}?subject=${subject}&body=${body}`;
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name')?.value.trim();
      const email = document.getElementById('form-email')?.value.trim();
      const company = document.getElementById('form-company')?.value.trim() || 'N/A';
      const message = document.getElementById('form-message')?.value.trim();

      if (!name || !email || !message) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Message...';
      }

      try {
        const response = await fetch(`https://formsubmit.co/ajax/${RECEIVER_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            _subject: `New CNC Inquiry from ${name} (${company})`,
            _captcha: 'false',
            'Full Name': name,
            'Email Address': email,
            'Company': company,
            'Message': message,
          }),
        });

        if (response.ok) {
          showSuccess(name);
        } else {
          triggerMailtoFallback(name, email, company, message);
          showSuccess(name);
        }
      } catch (err) {
        triggerMailtoFallback(name, email, company, message);
        showSuccess(name);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      }
    });
  }

  function showSuccess(name) {
    if (senderNameSpan) senderNameSpan.textContent = name;
    if (contactForm) contactForm.classList.add('hidden');
    if (successBox) successBox.classList.remove('hidden');
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (contactForm) {
        contactForm.reset();
        contactForm.classList.remove('hidden');
      }
      if (successBox) successBox.classList.add('hidden');
    });
  }
});
