// ===== Coordinate LMS - Core Application (standalone, no build step) =====
// Data persistence: localStorage (works fully offline, per-browser).
// To sync across devices in the future, this module can be swapped for Firebase.

const DB = {
  users: 'clms_users',
  session: 'clms_session',
  results: 'clms_results'
};

const ADMIN_USER = 'menahel';
const ADMIN_PASS = 'admin1234';
const MAX_ATTEMPTS = 3;
const MAX_SCORE = 1200;

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (e) { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function getUsers() { return loadJSON(DB.users, {}); }
function saveUsers(u) { saveJSON(DB.users, u); }
function getResults() { return loadJSON(DB.results, {}); }
function saveResults(r) { saveJSON(DB.results, r); }
function getSession() { return loadJSON(DB.session, null); }
function setSession(s) { saveJSON(DB.session, s); }
function clearSession() { localStorage.removeItem(DB.session); }

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function normalizeAnswer(val) {
  return String(val || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function checkAnswer(question, userValue) {
  const given = normalizeAnswer(userValue);
  if (given === '') return false;
  const accepted = Array.isArray(question.answer) ? question.answer : [question.answer];
  return accepted.some(a => normalizeAnswer(a) === given);
}

// ===== Scoring engine =====
// Each page max score = MAX_SCORE. Every wrong attempt costs a penalty.
// 3 attempts allowed per question; on the 3rd wrong attempt the question is locked (0 for that question).
function computePageScore(pageState, totalQuestions) {
  if (!totalQuestions) return 0;
  const perQ = MAX_SCORE / totalQuestions;
  let total = 0;
  Object.values(pageState.questions).forEach(q => {
    if (q.correct) {
      const penalty = q.attempts > 1 ? (q.attempts - 1) * (perQ * 0.25) : 0;
      total += Math.max(perQ - penalty, perQ * 0.25);
    }
  });
  return Math.round(total);
}

// ===== Router / State =====
const state = {
  route: 'login',
  pageIndex: 0,
  pageState: {}
};

function render() {
  const app = document.getElementById('app');
  const session = getSession();
  if (!session && state.route !== 'register') {
    app.innerHTML = renderLogin();
    bindLogin();
    return;
  }
  if (state.route === 'register') {
    app.innerHTML = renderRegister();
    bindRegister();
    return;
  }
  if (session && session.role === 'admin') {
    app.innerHTML = renderAdmin();
    bindAdmin();
    return;
  }
  if (state.route === 'workbook') {
    app.innerHTML = renderWorkbookPage(state.pageIndex);
    bindWorkbookPage(state.pageIndex);
    return;
  }
  app.innerHTML = renderHome(session);
  bindHome();
}

// ===== Login screen =====
function renderLogin() {
  return `
  <div class="card" style="max-width:420px;margin:60px auto;">
    <h1 style="text-align:center;">מערכת צירים</h1>
    <p style="text-align:center;color:#64748b;">כניסה למערכת התרגול</p>
    <label>שם משתמש</label>
    <input id="login-user" type="text" placeholder="הקלדו שם משתמש" />
    <label>סיסמה</label>
    <input id="login-pass" type="password" placeholder="סיסמה" />
    <div id="login-error" class="error-msg"></div>
    <button id="login-btn">התחברות</button>
    <button id="goto-register-btn" class="secondary">אין לך משתמש? הירשמו</button>
  </div>`;
}

function bindLogin() {
  document.getElementById('login-btn').onclick = () => {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errBox = document.getElementById('login-error');
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setSession({ username: user, role: 'admin' });
      state.route = 'home';
      render();
      return;
    }
    const users = getUsers();
    const u = users[user];
    if (!u || u.passHash !== simpleHash(pass)) {
      errBox.textContent = 'שם משתמש או סיסמה שגויים.';
      return;
    }
    setSession({ username: user, role: 'student' });
    state.route = 'home';
    render();
  };
  document.getElementById('goto-register-btn').onclick = () => {
    state.route = 'register';
    render();
  };
}

// ===== Register screen =====
function renderRegister() {
  return `
  <div class="card" style="max-width:420px;margin:60px auto;">
    <h1 style="text-align:center;">הרשמה</h1>
    <label>שם מלא</label>
    <input id="reg-fullname" type="text" placeholder="שם מלא" />
    <label>שם משתמש</label>
    <input id="reg-user" type="text" placeholder="שם משתמש (אנגלית)" />
    <label>סיסמה</label>
    <input id="reg-pass" type="password" placeholder="לפחות 4 תווים" />
    <div id="reg-error" class="error-msg"></div>
    <button id="reg-btn">הרשמה</button>
    <button id="goto-login-btn" class="secondary">חזרה להתחברות</button>
  </div>`;
}

function bindRegister() {
  document.getElementById('reg-btn').onclick = () => {
    const fullname = document.getElementById('reg-fullname').value.trim();
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const errBox = document.getElementById('reg-error');
    if (!fullname || !user || !pass) {
      errBox.textContent = 'יש למלא את כל השדות.';
      return;
    }
    if (pass.length < 4) {
      errBox.textContent = 'הסיסמה צריכה להכיל לפחות 4 תווים.';
      return;
    }
    if (user === ADMIN_USER) {
      errBox.textContent = 'שם משתמש זה שמור.';
      return;
    }
    const users = getUsers();
    if (users[user]) {
      errBox.textContent = 'שם משתמש זה כבר תפוס.';
      return;
    }
    users[user] = { fullname, passHash: simpleHash(pass), createdAt: Date.now() };
    saveUsers(users);
    setSession({ username: user, role: 'student' });
    state.route = 'home';
    render();
  };
  document.getElementById('goto-login-btn').onclick = () => {
    state.route = 'login';
    render();
  };
}

// ===== Home screen =====
function renderHome(session) {
  const results = getResults()[session.username] || {};
  const totalPages = PAGES.length;
  const doneCount = Object.keys(results).length;
  const avg = doneCount ? Math.round(Object.values(results).reduce((s,r)=>s+r.score,0)/doneCount) : 0;
  let rows = PAGES.map((p, i) => {
    const r = results[i];
    const status = r ? `<span class="badge">ניקוד: ${r.score}</span>` : '<span style="color:#94a3b8;">טרם בוצע</span>';
    return `<tr>
      <td>${i+1}</td>
      <td style="text-align:right;">${p.title}</td>
      <td>${status}</td>
      <td><button data-page="${i}" class="open-page-btn secondary" style="width:auto;">פתח</button></td>
    </tr>`;
  }).join('');
  return `
  <div class="top-bar">
    <h1>שלום, ${session.username}</h1>
    <button id="logout-btn" class="danger" style="width:auto;">התנתקות</button>
  </div>
  <div class="card">
    <h3>התקדמות אישית</h3>
    <p>בוצעו ${doneCount} מתוך ${totalPages} עמודים. ציון ממוצע: ${avg}</p>
    <div class="progress-bar-outer"><div class="progress-bar-inner" style="width:${(doneCount/totalPages*100).toFixed(0)}%"></div></div>
  </div>
  <div class="card">
    <h3>עמודי התרגול</h3>
    <table>
      <thead><tr><th>#</th><th>נושא</th><th>סטטוס</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function bindHome() {
  document.getElementById('logout-btn').onclick = () => {
    clearSession();
    state.route = 'login';
    render();
  };
  document.querySelectorAll('.open-page-btn').forEach(btn => {
    btn.onclick = () => {
      state.pageIndex = parseInt(btn.dataset.page, 10);
      state.route = 'workbook';
      state.pageState = initPageState(state.pageIndex);
      render();
    };
  });
}

function initPageState(pageIndex) {
  const page = PAGES[pageIndex];
  const qState = {};
  page.questions.forEach((q, i) => { qState[i] = { attempts: 0, correct: false, locked: false }; });
  return { questions: qState, finished: false };
}

// ===== Workbook page rendering =====
function renderWorkbookPage(pageIndex) {
  const page = PAGES[pageIndex];
  const ps = state.pageState;
  const questionsHtml = page.questions.map((q, i) => {
    const qs = ps.questions[i];
    let iconHtml = '';
    if (qs.correct) iconHtml = '<span class="feedback-icon correct">✔</span>';
    else if (qs.locked) iconHtml = '<span class="feedback-icon wrong">✖</span>';
    const attemptsLeft = MAX_ATTEMPTS - qs.attempts;
    const disabled = (qs.correct || qs.locked) ? 'disabled' : '';
    return `
    <div class="question-block ${qs.locked ? 'locked' : ''}" data-qindex="${i}">
      <div><strong>שאלה ${i+1}:</strong> ${q.prompt}</div>
      <div class="answer-row">
        <input type="text" class="answer-input" data-qindex="${i}" placeholder="כתבו את התשובה כאן" ${disabled} />
        <button class="check-btn secondary" style="width:auto;" data-qindex="${i}" ${disabled}>בדוק</button>
        ${iconHtml}
      </div>
      <div class="attempts-left">${qs.correct ? 'נכון! נקודה מלאה על שאלה זו.' : (qs.locked ? 'נפסל: נוצלו 3 ניסיונות.' : `נותרו ${attemptsLeft} ניסיונות`)}</div>
      <div class="wrong-msg error-msg" data-qindex="${i}"></div>
    </div>`;
  }).join('');

  const allDone = page.questions.every((q, i) => ps.questions[i].correct || ps.questions[i].locked);

  return `
  <div class="top-bar">
    <div><span class="badge">עמוד ${pageIndex+1} מתוך ${PAGES.length}</span></div>
    <button id="back-home-btn" class="secondary" style="width:auto;">חזרה לרשימת עמודים</button>
  </div>
  <div class="card">
    <h2>${page.title}</h2>
    ${page.instructions ? `<p style="color:#64748b;">${page.instructions}</p>` : ''}
    ${questionsHtml}
    ${allDone ? '<button id="finish-page-btn">סיום וקבלת ציון</button>' : ''}
  </div>
  <div class="page-nav">
    <button id="prev-page-btn" class="secondary" style="width:auto;" ${pageIndex===0?'disabled':''}>◀ עמוד קודם</button>
    <button id="next-page-btn" class="secondary" style="width:auto;" ${pageIndex===PAGES.length-1?'disabled':''}>עמוד הבא ▶</button>
  </div>`;
}

// ===== Workbook page interactions (IMMEDIATE feedback) =====
function bindWorkbookPage(pageIndex) {
  const page = PAGES[pageIndex];
  const ps = state.pageState;

  document.getElementById('back-home-btn').onclick = () => {
    state.route = 'home';
    render();
  };
  const prevBtn = document.getElementById('prev-page-btn');
  if (prevBtn) prevBtn.onclick = () => {
    state.pageIndex = pageIndex - 1;
    state.pageState = initPageState(state.pageIndex);
    render();
  };
  const nextBtn = document.getElementById('next-page-btn');
  if (nextBtn) nextBtn.onclick = () => {
    state.pageIndex = pageIndex + 1;
    state.pageState = initPageState(state.pageIndex);
    render();
  };

  document.querySelectorAll('.check-btn').forEach(btn => {
    btn.onclick = () => {
      const i = parseInt(btn.dataset.qindex, 10);
      const q = page.questions[i];
      const qs = ps.questions[i];
      if (qs.correct || qs.locked) return;
      const input = document.querySelector(`.answer-input[data-qindex="${i}"]`);
      const val = input.value;
      qs.attempts += 1;
      const isRight = checkAnswer(q, val);
      const msgBox = document.querySelector(`.wrong-msg[data-qindex="${i}"]`);
      if (isRight) {
        qs.correct = true;
        msgBox.textContent = '';
      } else {
        if (qs.attempts >= MAX_ATTEMPTS) {
          qs.locked = true;
          msgBox.textContent = 'נפסל לאחר 3 ניסיונות שגויים.';
        } else {
          msgBox.textContent = `תשובה לא מדויקת. נותרו ${MAX_ATTEMPTS - qs.attempts} ניסיונות.`;
        }
      }
      render();
    };
  });

  document.querySelectorAll('.answer-input').forEach(inp => {
    inp.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const i = inp.dataset.qindex;
        document.querySelector(`.check-btn[data-qindex="${i}"]`).click();
      }
    };
  });

  const finishBtn = document.getElementById('finish-page-btn');
  if (finishBtn) finishBtn.onclick = () => {
    const score = computePageScore(ps, page.questions.length);
    const session = getSession();
    const results = getResults();
    if (!results[session.username]) results[session.username] = {};
    results[session.username][pageIndex] = { score, date: Date.now() };
    saveResults(results);
    state.route = 'finished';
    state.lastScore = score;
    renderFinishedOverlay(score);
  };
}

function renderFinishedOverlay(score) {
  const app = document.getElementById('app');
  app.innerHTML = `
  <div class="card" style="text-align:center;">
    <h2>כל הכבוד! סיימתם את העמוד</h2>
    <div class="final-score-circle">${score}</div>
    <p>מתוך 1200 נקודות אפשריות</p>
    <button id="back-home-btn2">חזרה לרשימת עמודים</button>
  </div>`;
  document.getElementById('back-home-btn2').onclick = () => {
    state.route = 'home';
    render();
  };
}

// ===== Admin dashboard =====
function renderAdmin() {
  const users = getUsers();
  const results = getResults();
  const usernames = Object.keys(users);
  let rows = usernames.map(u => {
    const r = results[u] || {};
    const doneCount = Object.keys(r).length;
    const avg = doneCount ? Math.round(Object.values(r).reduce((s,x)=>s+x.score,0)/doneCount) : 0;
    const detail = Object.entries(r).map(([pi, val]) => `עמוד ${parseInt(pi)+1}: ${val.score}`).join(', ') || 'טרם התחיל';
    return `<tr>
      <td>${users[u].fullname}</td>
      <td>${u}</td>
      <td>${doneCount} / ${PAGES.length}</td>
      <td>${avg}</td>
      <td style="text-align:right;font-size:12px;">${detail}</td>
    </tr>`;
  }).join('');
  return `
  <div class="top-bar">
    <h1>דשבורד ניהול</h1>
    <button id="logout-btn" class="danger" style="width:auto;">התנתקות</button>
  </div>
  <div class="card">
    <h3>סיכום</h3>
    <p>סך הכל נרשמו: ${usernames.length}</p>
  </div>
  <div class="card">
    <h3>פירוט תלמידים</h3>
    <table>
      <thead><tr><th>שם מלא</th><th>שם משתמש</th><th>התקדמות</th><th>ממוצע</th><th>פירוט ציונים</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5">עדיין אין תלמידים רשומים</td></tr>'}</tbody>
    </table>
  </div>`;
}

function bindAdmin() {
  document.getElementById('logout-btn').onclick = () => {
    clearSession();
    state.route = 'login';
    render();
  };
}

// ===== App bootstrap =====
render();
