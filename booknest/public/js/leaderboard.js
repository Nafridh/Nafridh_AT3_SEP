document.addEventListener("DOMContentLoaded", () => {
    fetch('/leaderboard')
        .then(res => res.json())
        .then(data => {
    const list = document.getElementById('leaderboard');
    data.forEach((guild, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${guild.name} — ${guild.total_points} points`;
        list.appendChild(li);
        });
    })
    .catch(err => {
        console.error('Error loading leaderboard:', err);
    });
});
