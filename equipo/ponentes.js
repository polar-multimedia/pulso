/* Llegada de ponentes: lista corta con un toque «Llegó». Se guarda en la base en vivo (retopulso/pulso26/ponentes)
   con la hora y quién lo marcó; la ven Blanca, Vero, Roberto y el reporte en vivo. */
(function () {
  var DB = 'https://jeopardycarnot-default-rtdb.firebaseio.com/retopulso/pulso26/ponentes';
  var L = [
    ['vazquez', 'Dr. Rodrigo Vázquez Frías', 'Coordinador académico · bienvenida 16:00 · ponencia 17:55'],
    ['mendoza', 'Dra. María José Mendoza Tavera', 'Ponencia 16:00 · El Observatorio'],
    ['otero', 'Dr. Francisco Javier Otero Mendoza', 'Ponencia 16:30 · El Laboratorio · y panel'],
    ['abreu', 'Dra. Ana Teresa Abreu y Abreu', 'Ponencia 16:55 · El Arrecife'],
    ['copto', 'Dr. Alfonso Copto García', 'Moderador del panel 18:25'],
    ['montijo', 'Dra. Ericka Montijo Barrios', 'Panel 18:25'],
    ['zepeda', 'Dr. Benjamín Zepeda Ortega', 'Panel 18:25'],
    ['chavez', 'Dr. José Antonio Chávez Barrera', 'Ponencia 19:10 · La Orilla']
  ];
  var S = {}, busy = {}, ok = false;
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hm(iso) { try { return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Mexico_City' }); } catch (x) { return ''; } }
  function who() { try { return localStorage.getItem('pulso.staff.who') || 'Equipo'; } catch (x) { return 'Equipo'; } }
  function redraw() { try { if (typeof TAB !== 'undefined' && TAB === 'inicio' && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) && typeof render === 'function') render(); } catch (x) {} }
  function load() { fetch(DB + '.json?x=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (v) { var n = JSON.stringify(v || {}); if (n !== JSON.stringify(S) || !ok) { S = v || {}; ok = true; redraw(); } }).catch(function () {}); }
  function set(k, val) {
    busy[k] = 1; redraw();
    fetch(DB + '/' + k + '.json', { method: val ? 'PUT' : 'DELETE', body: val ? JSON.stringify(val) : undefined })
      .then(function () { if (val) S[k] = val; else delete S[k]; busy[k] = 0; redraw(); })
      .catch(function () { busy[k] = 0; redraw(); alert('Sin conexión. Intenta de nuevo.'); });
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-pon]'); if (!b) return;
    var k = b.dataset.pon;
    if (S[k]) { if (confirm('¿Quitar la llegada de ' + b.dataset.n + '?')) set(k, null); return; }
    set(k, { at: new Date().toISOString(), by: who() });
  });
  function html() {
    var n = L.filter(function (p) { return S[p[0]]; }).length;
    return '<div class="card"><h2 style="margin:0 0 2px">Ponentes · llegada</h2><div class="meta">' + n + ' de ' + L.length + ' en el lugar' + (ok ? '' : ' · cargando…') + '. Un toque cuando lleguen; se guarda la hora.</div>' +
      L.map(function (p) {
        var s = S[p[0]];
        return '<div class="li" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--line)"><div><div class="nm" style="font-weight:800">' + e(p[1]) + '</div><div class="meta">' + e(p[2]) + (s ? ' · <b style="color:var(--ok)">llegó ' + hm(s.at) + '</b> · ' + e(s.by) : '') + '</div></div>' +
          '<button class="btn sm' + (s ? ' ghost' : '') + '" data-pon="' + p[0] + '" data-n="' + e(p[1]) + '" ' + (busy[p[0]] ? 'disabled' : '') + ' style="white-space:nowrap' + (s ? '' : ';background:var(--ok);color:#03210f') + '">' + (busy[p[0]] ? '…' : s ? '✓ ' + hm(s.at) : 'Llegó') + '</button></div>';
      }).join('') + '</div>';
  }
  load(); setInterval(load, 15000);
  window.PONENTES = { html: html, list: L, state: function () { return S; } };
})();
