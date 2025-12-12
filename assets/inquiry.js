/**
 * Inquiry Form Handler
 * Updated: Dec 2025
 */

(function() {
  'use strict';
  
  console.log('=== INQUIRY.JS LOADED ===');
  
  function initInquiryForm() {
    console.log('Initializing inquiry form...');
    
    var form = document.getElementById('inquiryForm');
    var statusEl = document.getElementById('inq-status');
    var actionField = document.getElementById('actionField');
    var btnEmail = document.getElementById('btnEmail');
    var btnWhatsApp = document.getElementById('btnWhatsApp');
    
    if (!form) {
      console.error('ERROR: Form not found');
      return;
    }
    
    function showStatus(msg, type) {
      if (statusEl) {
        statusEl.textContent = msg;
        statusEl.style.display = 'block';
        statusEl.style.padding = '15px';
        statusEl.style.marginTop = '15px';
        statusEl.style.borderRadius = '8px';
        statusEl.style.fontWeight = '600';
        
        if (type === 'error') {
          statusEl.style.background = '#f44336';
          statusEl.style.color = 'white';
        } else if (type === 'success') {
          statusEl.style.background = '#4CAF50';
          statusEl.style.color = 'white';
        } else {
          statusEl.style.background = '#2196F3';
          statusEl.style.color = 'white';
        }
        
        setTimeout(function() {
          statusEl.style.display = 'none';
        }, 5000);
      }
    }
    
    function validateForm() {
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var phone = document.getElementById('phone').value.trim();
      var message = document.getElementById('message').value.trim();
      
      if (!name) { showStatus('⚠️ Please enter your name', 'error'); document.getElementById('name').focus(); return false; }
      if (!email) { showStatus('⚠️ Please enter your email', 'error'); document.getElementById('email').focus(); return false; }
      
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) { showStatus('⚠️ Please enter a valid email address', 'error'); document.getElementById('email').focus(); return false; }
      
      if (!phone) { showStatus('⚠️ Please enter your phone number', 'error'); document.getElementById('phone').focus(); return false; }
      
      var phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(phone)) { showStatus('⚠️ Please enter a valid 10-digit phone number', 'error'); document.getElementById('phone').focus(); return false; }
      
      if (!message) { showStatus('⚠️ Please enter a message', 'error'); document.getElementById('message').focus(); return false; }
      
      return true;
    }
    
    if (btnEmail) {
      btnEmail.onclick = function(e) {
        e.preventDefault();
        if (validateForm()) {
          showStatus('📧 Sending email...', 'info');
          actionField.value = 'email';
          setTimeout(function() { form.submit(); }, 500);
        }
      };
    }
    
    if (btnWhatsApp) {
      btnWhatsApp.onclick = function(e) {
        e.preventDefault();
        if (validateForm()) {
          showStatus('📱 Opening WhatsApp...', 'info');
          actionField.value = 'whatsapp';
          setTimeout(function() { form.submit(); }, 500);
        }
      };
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInquiryForm);
  } else {
    initInquiryForm();
  }
})();
