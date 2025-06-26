/* public/js/index.js — dashboard only */
document.addEventListener('DOMContentLoaded', () => {
const user  = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');
if (!user || !token) {
    window.location.href = 'login.html';
    return;
}
/*document.getElementById('navUserName').textContent  = `Welcome, ${user.first_name}`;*/
document.getElementById('firstName').textContent    = user.first_name;
document.getElementById('userPoints').textContent   = user.total_points ?? 0;
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

window.addEventListener('storage', (e) => {
    console.log("Storage event detected:", e);
    if (e.key === '__points_sync') {
        const { value } = JSON.parse(e.newValue);
        console.log("Updating user points to:", value);
        document.getElementById('userPoints').textContent = value;

        // keep local copy in sync so next reload is correct
        const u = JSON.parse(localStorage.getItem('user'));
        u.total_points = value;
        localStorage.setItem('user', JSON.stringify(u));
    }
});

loadPollWinner();
loadTopGuild();
loadQuestPreview();

  /* ============ helper functions ============ */

async function loadPollWinner() {
    try {
    const res    = await fetch('/api/poll-winner');
    console.log('Poll winner response status:', res.status);
    const winner = await res.json();
    if (!winner?.cover_url) return;

    document.getElementById('winnerCard').innerHTML = `
        <img src="${winner.cover_url}" alt="${winner.title}" style="max-width:120px;border-radius:10px" />
        <h4>${winner.title}</h4>
        <p><em>${winner.author}</em></p>
    `;
    } catch (err) {
    console.error('Poll‑winner fetch failed', err);
    }
}

async function loadTopGuild() {
    try {
    const res   = await fetch('/api/top-guild');
    console.log('Top guild response status:', res.status);
    const guild = await res.json();
    if (!guild?.name) return;
    document.getElementById('topGuild').textContent =
        `${guild.name} – ${guild.points} pts`;
    } catch (err) {
    document.getElementById('topGuild').textContent = 'No data yet.';
    }
}

async function loadQuestPreview() {
    try {
    const res    = await fetch('/api/quests');
    console.log('Quest preview response status:', res.status);
    const quests = await res.json();
    const list   = document.getElementById('questList');
    list.innerHTML = '';
    quests.slice(0, 3).forEach(q => {
        const li = document.createElement('li');
        li.textContent = q.title;
        list.appendChild(li);
    });
    } catch {
    document.getElementById('questList').textContent = 'Unable to load quests.';
    }
}
});