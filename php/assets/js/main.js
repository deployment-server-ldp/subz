// Minimal progressive-enhancement JS — the site works with forms/links alone;
// this just adds a couple of small conveniences.

document.addEventListener('DOMContentLoaded', function () {
  // Confirm before any destructive action (delete/suspend/withdraw forms).
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) {
        e.preventDefault();
      }
    });
  });

  // Country -> city dependent dropdowns (data-city-select pages).
  var countrySelect = document.querySelector('[data-country-select]');
  var citySelect = document.querySelector('[data-city-select]');
  if (countrySelect && citySelect) {
    var allOptions = Array.prototype.slice.call(citySelect.options);
    var preselected = citySelect.getAttribute('data-selected') || '';
    function filterCities() {
      var countryId = countrySelect.value;
      var currentValue = citySelect.value;
      citySelect.innerHTML = '';
      citySelect.appendChild(new Option('Select city', ''));
      allOptions.forEach(function (opt) {
        if (opt.value === '') return;
        if (opt.getAttribute('data-country') === countryId) {
          citySelect.appendChild(opt.cloneNode(true));
        }
      });
      if (preselected) {
        citySelect.value = preselected;
        preselected = '';
      } else {
        citySelect.value = currentValue;
      }
    }
    countrySelect.addEventListener('change', filterCities);
    filterCities();
  }
});
