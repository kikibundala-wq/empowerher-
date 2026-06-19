/* =========================================================
   EmpowerHer — validation.js
   Client-side validation + simulated AJAX submission
   ========================================================= */

(function () {

  var patterns = {
    name: /^[A-Za-z'’\-\s]{2,60}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+?\d{1,3}[\s-]?)?(\(?\d{2,3}\)?[\s-]?)?\d{3}[\s-]?\d{4}$/
  };

  var messages = {
    valueMissing: 'This field is required.',
    name: 'Please enter a valid name (letters only, at least 2 characters).',
    email: 'Please enter a valid email address.',
    phone: 'Please enter a valid phone number, e.g. 082 123 4567.',
    minlength: 'Please enter at least {min} characters.',
    select: 'Please choose an option.',
    checkbox: 'Please confirm before submitting.'
  };

  function showError(field, msg) {
    var wrapper = field.closest('.field') || field.closest('.checkbox-row');
    if (!wrapper) return;
    wrapper.classList.add('has-error');
    var errEl = wrapper.querySelector('.error-msg');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(field) {
    var wrapper = field.closest('.field') || field.closest('.checkbox-row');
    if (!wrapper) return;
    wrapper.classList.remove('has-error');
  }

  function validateField(field) {
    var value = field.value ? field.value.trim() : '';
    var type = field.getAttribute('data-validate');

    if (field.hasAttribute('required')) {
      if (field.type === 'checkbox' && !field.checked) {
        showError(field, messages.checkbox);
        return false;
      }
      if (field.type !== 'checkbox' && value === '') {
        showError(field, messages.valueMissing);
        return false;
      }
    }

    if (value === '' && !field.hasAttribute('required')) {
      clearError(field);
      return true;
    }

    if (type === 'name' && !patterns.name.test(value)) {
      showError(field, messages.name); return false;
    }
    if (type === 'email' && !patterns.email.test(value)) {
      showError(field, messages.email); return false;
    }
    if (type === 'phone' && !patterns.phone.test(value)) {
      showError(field, messages.phone); return false;
    }
    if (field.tagName === 'SELECT' && value === '') {
      showError(field, messages.select); return false;
    }
    var minlength = field.getAttribute('minlength');
    if (minlength && value.length < parseInt(minlength, 10)) {
      showError(field, messages.minlength.replace('{min}', minlength)); return false;
    }

    clearError(field);
    return true;
  }

  function initForm(form) {
    var statusBox = form.querySelector('.form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    var fields = Array.prototype.slice.call(
      form.querySelectorAll('input[data-validate], textarea[data-validate], select[data-validate], input[type="checkbox"][required]')
    );

    fields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var wrapper = field.closest('.field') || field.closest('.checkbox-row');
        if (wrapper && wrapper.classList.contains('has-error')) validateField(field);
      });
    });

    // live character counter
    form.querySelectorAll('[data-charcount]').forEach(function (textarea) {
      var counter = document.querySelector(textarea.getAttribute('data-charcount'));
      var max = textarea.getAttribute('maxlength');
      function update() {
        if (counter) counter.textContent = textarea.value.length + (max ? ' / ' + max : '') + ' characters';
      }
      textarea.addEventListener('input', update);
      update();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });

      if (statusBox) {
        statusBox.classList.remove('show', 'success', 'error');
      }

      if (!allValid) {
        if (statusBox) {
          statusBox.textContent = 'Please correct the highlighted fields and try again.';
          statusBox.classList.add('show', 'error');
        }
        var firstError = form.querySelector('.has-error input, .has-error textarea, .has-error select');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate an asynchronous (AJAX-style) submission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      setTimeout(function () {
        if (statusBox) {
          statusBox.textContent = form.getAttribute('data-success-message') ||
            'Thank you — your message has been received. We will be in touch soon.';
          statusBox.classList.add('show', 'success');
        }
        form.reset();
        fields.forEach(clearError);
        form.querySelectorAll('[data-charcount]').forEach(function (t) { t.dispatchEvent(new Event('input')); });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.getAttribute('data-default-label') || 'Submit';
        }
      }, 900);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[data-validate-form]').forEach(initForm);
  });

})();
