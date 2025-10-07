function attachEditDeleteHandlers(container) {
  container.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', e => {
      const review = e.target.closest('.review');
      review.remove();
    });
  });
  container.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', e => {
      const review = e.target.closest('.review');
      const p = review.querySelector('.review-text');
      const newText = prompt('عدل تعليقك:', p.textContent);
      if (newText !== null && newText.trim() !== '') p.textContent = newText;
    });
  });
}

function addReviewToPage(name, text, verified=false) {
  const reviewsContainer = document.querySelector('.reviews');
  const div = document.createElement('div');
  div.className = 'review';
  div.innerHTML = `
    <img src="assets/images/user1.png" alt="${escapeHtml(name)}">
    <strong class="review-name">${escapeHtml(name)}</strong>
    ${ verified ? '' : '<span class="review-badge">قيد التحقق — مرسَل للمدير</span>' }
    <p class="review-text">${escapeHtml(text)}</p>
    <div class="review-actions">
      <span class="edit">✏️</span>
      <span class="delete">🗑️</span>
    </div>
  `;
  reviewsContainer.appendChild(div);
  attachEditDeleteHandlers(div);
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reviewForm');
  const msg = document.getElementById('formMessage');

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    msg.textContent = '';
    msg.className = '';

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const comment = document.getElementById('comment').value.trim();

    if (!name || !email || !comment) {
      msg.textContent = 'الرجاء ملء كل الحقول.';
      msg.className = 'error';
      return;
    }
    if (!isValidEmail(email)) {
      msg.textContent = 'الرجاء إدخال بريد إلكتروني صالح.';
      msg.className = 'error';
      return;
    }

    addReviewToPage(name, comment, false);

    try {
      const action = form.getAttribute('action');
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      if (res.ok) {
        msg.textContent = 'تم الإرسال، وسيتم التحقق قريبا.';
        msg.className = 'success';
        form.reset();
      } else {
        const data = await res.json().catch(()=>({}));
        msg.textContent = data.error || 'حدث خطأ أثناء الإرسال.';
        msg.className = 'error';
      }
    } catch (err) {
      msg.textContent = 'فشل الإرسال — تحقق من اتصال الإنترنت.';
      msg.className = 'error';
    }
  });

  attachEditDeleteHandlers(document);
});