// APE Saint-Mamet — petits comportements du site
(function () {
  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Longueur des traits du cercle (animation de dessin)
  document.querySelectorAll('.ring path').forEach(function (p) {
    p.style.setProperty('--len', Math.ceil(p.getTotalLength()));
  });

  // Événements : date de fin au format AAAA-MM-JJ
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function parse(d) { var a = d.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }

  // Frise : estomper les dates passées
  document.querySelectorAll('.ev[data-date]').forEach(function (li) {
    if (parse(li.dataset.date) < today) {
      li.classList.add('past');
      var t = li.querySelector('.tag'); if (t) t.textContent = 'Passé';
      var b = li.querySelector('.ics'); if (b) b.remove();
    }
  });

  // Accueil : ne garder que les prochaines dates
  document.querySelectorAll('.timeline[data-limit]').forEach(function (ol) {
    var max = +ol.dataset.limit, shown = 0;
    ol.querySelectorAll('.ev').forEach(function (li) {
      if (li.classList.contains('past') || shown >= max) li.remove(); else shown++;
    });
  });

  // Compte à rebours vers le prochain rendez-vous
  var cd = document.querySelector('[data-countdown]');
  if (cd) {
    var days = Math.round((parse(cd.dataset.countdown) - today) / 86400000);
    cd.textContent = days > 1 ? 'Dans ' + days + ' jours'
      : days === 1 ? 'C’est demain !'
      : days === 0 ? 'C’est aujourd’hui !' : '';
  }

  // « Ajouter à mon agenda » : fichier .ics
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
  document.querySelectorAll('.ics').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.closest('.ev'); var d = parse(li.dataset.date);
      var start, end;
      if (li.dataset.start) {
        start = 'DTSTART;TZID=Europe/Paris:' + ymd(d) + 'T' + li.dataset.start.replace(':', '') + '00';
        end = 'DTEND;TZID=Europe/Paris:' + ymd(d) + 'T' + li.dataset.end.replace(':', '') + '00';
      } else {
        var n = new Date(d); n.setDate(n.getDate() + 1);
        start = 'DTSTART;VALUE=DATE:' + ymd(d); end = 'DTEND;VALUE=DATE:' + ymd(n);
      }
      var title = li.querySelector('h3').textContent.trim();
      var place = li.dataset.place || 'Saint-Mamet-la-Salvetat';
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//APE Saint-Mamet//FR', 'BEGIN:VEVENT',
        'UID:' + ymd(d) + '-' + title.replace(/\W+/g, '') + '@ape-saint-mamet', 'DTSTAMP:' + ymd(new Date()) + 'T000000Z',
        start, end, 'SUMMARY:' + title + ' – APE Saint-Mamet', 'LOCATION:' + place, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics';
      document.body.appendChild(a); a.click(); a.remove();
    });
  });

  // Année dans le pied de page
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
