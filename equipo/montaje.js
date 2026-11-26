/* Lista de montaje con fotos de testigo y «Carnot en vivo», compartida por las consolas de Blanca y Vero.
   Cada consola define api(action, body), WHO y esc(); aquí solo se arma la vista y se manejan los toques. */
(function () {
  var PEND = {}, BUSY = {};
  function shrink(file, max) {
    return new Promise(function (ok, ko) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () { var k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', .84)); };
      img.onerror = ko; img.src = u;
    });
  }
  function html(M) {
    if (!M) return '<div class="card"><p>La lista de montaje aparece en cuanto Roberto actualice el servidor (versión 8).</p></div>';
    var ok = M.filter(function (x) { return x.ok; }).length, pct = M.length ? Math.round(ok / M.length * 100) : 0;
    return '<div class="card"><div class="big"><span class="n">' + ok + '</span><span class="of">de ' + M.length + ' zonas listas</span></div><div class="meter"><i style="width:' + pct + '%"></i></div>' +
      '<p class="note" style="margin:0">Cada zona se marca con al menos una foto de testigo. En cuanto la marcas, el equipo de Lacteol la ve en su liga en vivo, y las fotos quedan en el reporte final.</p></div>' +
      M.map(function (x) {
        var p = PEND[x.row] || [], b = BUSY[x.row];
        return '<div class="p ' + (x.ok ? '' : 'alert') + '" style="' + (x.ok ? 'border-color:rgba(61,220,151,.55)' : 'border-color:var(--line);box-shadow:none') + '"><div class="row"><div><div class="nm">' + esc(x.item) + '</div><div class="meta">' + esc((x.hora ? 'Lista a las ' + x.hora : '') + (x.para ? ' · ' + x.para : '')) + '</div></div>' +
          '<span class="chip ' + (x.ok ? 'c-done' : '') + '">' + (x.ok ? '✓ ' + esc(x.at) : 'Pendiente') + '</span></div>' +
          (x.ok ? '<div class="by">Lista · ' + esc(x.por) + ' · ' + x.fotos + ' foto' + (x.fotos === 1 ? '' : 's') + (x.nota ? ' · ' + esc(x.nota) : '') + '</div>'
                : '<div class="note" style="margin-top:8px;color:var(--tx)">📷 ' + esc(x.foto) + '</div>') +
          (p.length ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">' + p.map(function (s) { return '<img src="' + s + '" style="width:72px;height:72px;object-fit:cover;border-radius:10px;border:1px solid var(--line)">'; }).join('') + '</div>' : '') +
          '<div class="acts">' +
          '<label class="btn ' + (x.ok ? 'ghost ' : '') + 'sm" style="margin:0;color:' + (x.ok ? 'var(--tx)' : '#071433') + '">' + (p.length ? 'Otra foto' : x.ok ? 'Agregar foto' : 'Tomar fotos') + '<input type="file" accept="image/*" multiple data-mfile="' + x.row + '" hidden></label>' +
          (p.length ? '<button class="btn sm" style="background:var(--ok);color:#03210f" data-mok="' + x.row + '" ' + (b ? 'disabled' : '') + '>' + (b ? esc(b) : (x.ok ? 'Subir ' + p.length + ' foto' + (p.length === 1 ? '' : 's') : 'Marcar lista con ' + p.length + ' foto' + (p.length === 1 ? '' : 's'))) + '</button><button class="lnk" data-mclr="' + x.row + '">Quitar fotos</button>' : '') +
          (x.ok && !p.length ? '<button class="lnk" data-mundo="' + x.row + '">Deshacer</button>' : '') +
          '</div></div>';
      }).join('');
  }
  function vivo(L, A) {
    if (!L) return '';
    var on = L.filter(function (x) { return x.online; });
    return '<div class="card"><h2>Carnot en vivo</h2><p>Quién de la cadena ha entrado a su liga. En verde, quien la tiene abierta ahora.</p>' +
      (L.length ? L.map(function (x) { return '<div class="li"><div><div class="nm">' + (x.online ? '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--ok);margin-right:6px"></span>' : '') + esc(x.name) + '</div><div class="meta">' + esc(x.tipo) + ' · entró ' + esc(x.first) + ' · última vez ' + esc(x.last) + ' · ' + x.visitas + ' visita' + (x.visitas === 1 ? '' : 's') + '</div></div></div>'; }).join('') : '<p>Todavía no entra nadie. La bienvenida sale a las 08:00.</p>') +
      (A && A.length ? '<details class="more" style="margin-top:10px"><summary>Qué han hecho (' + A.length + ')</summary>' + A.map(function (a) { return '<div class="li"><div><div class="meta"><b>' + esc(a.time) + '</b> · ' + esc(a.name) + ' · ' + esc(a.what) + '</div></div></div>'; }).join('') + '</details>' : '') +
      (on.length ? '<div class="by">' + on.length + ' en línea ahora</div>' : '') + '</div>';
  }
  function bind(getM, setM, rerender) {
    document.addEventListener('change', function (e) {
      var f = e.target.closest('[data-mfile]'); if (!f) return; var row = f.dataset.mfile, fs = [].slice.call(f.files || []);
      Promise.all(fs.slice(0, 6).map(function (x) { return shrink(x, 1800); })).then(function (L) { PEND[row] = (PEND[row] || []).concat(L).slice(0, 6); rerender(); }).catch(function () { alert('No se pudo leer la foto.'); });
    });
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-mclr]'); if (c) { delete PEND[c.dataset.mclr]; rerender(); return; }
      var u = e.target.closest('[data-mundo]'); if (u) { if (!confirm('¿Regresar esta zona a pendiente? Las fotos se quedan en el reporte.')) return; api('montajeSet', { row: +u.dataset.mundo, ok: false, who: WHO }).then(function (r) { if (r.success) { setM(r.montaje); rerender(); } }); return; }
      var o = e.target.closest('[data-mok]'); if (!o) return;
      var row = o.dataset.mok, M = getM() || [], it = M.find(function (x) { return String(x.row) === String(row); }), P = PEND[row] || []; if (!it || !P.length) return;
      var n = 0, fail = 0;
      (function next(i) {
        if (i >= P.length) {
          if (!n) { BUSY[row] = ''; rerender(); return alert('No se subió ninguna foto. Revisa tu conexión.'); }
          BUSY[row] = 'Guardando…'; rerender();
          return api('montajeSet', { row: +row, ok: true, fotos: n, who: WHO }).then(function (r) { BUSY[row] = ''; if (r.success) { delete PEND[row]; setM(r.montaje); } else alert(r.message || 'No se guardó'); if (fail) alert(fail + ' foto(s) no se subieron.'); rerender(); }).catch(function () { BUSY[row] = ''; rerender(); alert('Sin conexión'); });
        }
        BUSY[row] = 'Subiendo ' + (i + 1) + ' de ' + P.length + '…'; rerender();
        api('uploadPhoto', { data: P[i], momento: 'Equipo y montaje', caption: 'Montaje · ' + it.item, who: WHO, star: false }).then(function (r) { if (r.success) n++; else fail++; next(i + 1); }).catch(function () { fail++; next(i + 1); });
      })(0);
    });
  }
  window.MONTAJE = { html: html, vivo: vivo, bind: bind, busy: function () { return Object.keys(PEND).length || Object.keys(BUSY).some(function (k) { return BUSY[k]; }); } };
})();
