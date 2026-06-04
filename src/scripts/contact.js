(function () {
  document.querySelectorAll('#page-contact .rv').forEach(function (el) {
    el.classList.add('show');
  });

  var form = document.querySelector('#page-contact #contactForm');
  if (!form) return;

  var page = document.getElementById('page-contact');
  var formspreeEndpoint = page?.dataset.formspreeEndpoint?.trim() || '';

  function showSuccess() {
    form.style.display = 'none';
    document.getElementById('successMsg')?.classList.add('show');
  }

  function collectData() {
    return {
      name:
        document.getElementById('fname').value +
        ' ' +
        document.getElementById('lname').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      brand: document.getElementById('brand').value,
      services: [...document.querySelectorAll('input[name="services"]:checked')]
        .map(function (i) {
          return i.value;
        })
        .join(', '),
      message: document.getElementById('message').value,
    };
  }

  function sendMailto(data) {
    var subject = encodeURIComponent('New Project Inquiry — ' + data.brand);
    var body = encodeURIComponent(
      'Name: ' +
        data.name +
        '\n' +
        'Email: ' +
        data.email +
        '\n' +
        'Phone: ' +
        data.phone +
        '\n' +
        'Brand: ' +
        data.brand +
        '\n' +
        'Services: ' +
        data.services +
        '\n\n' +
        'Message:\n' +
        data.message
    );
    window.location.href =
      'mailto:dynastymarketingagency@gmail.com?subject=' + subject + '&body=' + body;
    showSuccess();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = collectData();
    var btn = form.querySelector('.submit-btn span');
    var originalLabel = btn ? btn.textContent : '';

    if (!formspreeEndpoint) {
      sendMailto(data);
      return;
    }

    if (btn) btn.textContent = 'Sending…';
    fetch(formspreeEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        brand: data.brand,
        services: data.services,
        message: data.message,
        _subject: 'New Project Inquiry — ' + data.brand,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Formspree error');
        showSuccess();
      })
      .catch(function () {
        if (btn) btn.textContent = originalLabel;
        sendMailto(data);
      });
  });
})();
