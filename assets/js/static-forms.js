/* Triumph Gifts 静态站补充脚本：表单提交、来源字段注入、Cookie 同意。
   依赖：无（原生 JS）。主题交互由 site.js 提供。
   配置：在页面里设置 window.TG_FORM_ENDPOINT = 'https://...' 后表单会真实 POST，
         未配置时阻止提交并引导至邮件/WhatsApp。 */
(function () {
  'use strict';

  var FORMS = document.querySelectorAll('form[data-tg-static-form]');
  var ENDPOINT = window.TG_FORM_ENDPOINT || '';

  function fillHidden(form) {
    var page = form.querySelector('[name="tg-source-page"]');
    var url = form.querySelector('[name="tg-source-url"]');
    var start = form.querySelector('[name="tg-form-start"]');
    if (page) page.value = document.title;
    if (url) url.value = window.location.href;
    if (start && !start.value) start.value = String(Date.now());
  }

  function message(form, text, ok) {
    var box = form.parentNode.querySelector('.tg-form-message');
    if (!box) {
      box = document.createElement('div');
      box.className = 'tg-form-message';
      box.setAttribute('role', 'status');
      form.parentNode.insertBefore(box, form.nextSibling);
    }
    box.textContent = text;
    box.style.cssText = 'margin-top:14px;padding:12px 16px;border-radius:8px;font-size:14px;' +
      (ok ? 'background:#e7f6ec;color:#14532d;border:1px solid #b7e0c4;'
          : 'background:#fdecec;color:#7f1d1d;border:1px solid #f5c2c2;');
  }

  function validate(form) {
    var bad = null;
    var fields = form.querySelectorAll('input, textarea, select');
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.disabled || f.type === 'hidden') continue;
      if (f.hasAttribute('required') || (f.getAttribute('aria-required') === 'true')) {
        if (!f.value || (f.type === 'checkbox' && !f.checked)) {
          if (!bad) bad = f;
          f.setAttribute('aria-invalid', 'true');
        } else {
          f.removeAttribute('aria-invalid');
        }
      }
    }
    return bad;
  }

  Array.prototype.forEach.call(FORMS, function (form) {
    fillHidden(form);
    form.addEventListener('submit', function (ev) {
      var bad = validate(form);
      if (bad) {
        ev.preventDefault();
        message(form, 'Please complete the required field.', false);
        bad.focus();
        return;
      }
      var honeypot = form.querySelector('[name="tg-website"]');
      if (honeypot && honeypot.value) {
        ev.preventDefault();
        return;
      }
      if (!ENDPOINT) {
        ev.preventDefault();
        message(form, 'Form endpoint is not configured on this static build. ' +
          'Please email sales@triumphgifts.com or reach us on WhatsApp.', false);
        return;
      }
      ev.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var label = btn ? btn.value || btn.textContent : '';
      if (btn) { btn.disabled = true; if (btn.type === 'submit') btn.value = 'Sending...'; }
      var data = new FormData(form);
      fetch(ENDPOINT, { method: 'POST', body: data })
        .then(function (r) { return r.ok; })
        .then(function (ok) {
          if (btn) { btn.disabled = false; if (btn.type === 'submit') btn.value = label; }
          message(form, ok ? 'Thanks! We will reply within one business day.'
                           : 'Submission failed, please email sales@triumphgifts.com.', ok);
          if (ok) form.reset();
        })
        .catch(function () {
          if (btn) { btn.disabled = false; if (btn.type === 'submit') btn.value = label; }
          message(form, 'Network error, please email sales@triumphgifts.com.', false);
        });
    });
  });

  /* Cookie 同意：本地模拟 WPConsent，选择记入 localStorage */
  var holder = document.getElementById('wpconsent-banner-holder');
  if (holder) {
    var KEY = 'tg-consent';
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) {
      holder.remove();
    } else {
      holder.hidden = false;
      var btns = holder.querySelectorAll('button, a');
      Array.prototype.forEach.call(btns, function (b) {
        var t = (b.textContent || '').toLowerCase();
        if (t.indexOf('accept') === -1 && t.indexOf('reject') === -1 &&
            t.indexOf('preference') === -1) return;
        b.addEventListener('click', function () {
          try { localStorage.setItem(KEY, t.indexOf('reject') > -1 ? 'reject' : 'accept'); } catch (e) {}
          holder.remove();
        });
      });
      var close = document.getElementById('wpconsent-banner-close');
      if (close) close.addEventListener('click', function () { holder.remove(); });
    }
  }
})();
