/* Modern Product Slider — prev/next scrolling, no dependencies. */
(function () {
  function cardWidth(track) {
    var card = track.querySelector('.mps-card');
    if (!card) return 300;
    var gap = parseInt(window.getComputedStyle(track).gap, 10) || 16;
    return card.getBoundingClientRect().width + gap;
  }
  document.querySelectorAll('.mps-slider').forEach(function (slider) {
    var track = slider.querySelector('.mps-track');
    var prev = slider.querySelector('.mps-prev');
    var next = slider.querySelector('.mps-next');
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -cardWidth(track), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: cardWidth(track), behavior: 'smooth' }); });
  });
})();
