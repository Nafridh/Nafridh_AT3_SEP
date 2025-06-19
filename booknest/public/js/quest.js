document.addEventListener("DOMContentLoaded", () => {
    const questList = document.getElementById('questList');
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popupTitle');
    const popupDesc = document.getElementById('popupDescription');
    const closeBtn = document.getElementById('popupClose');
    const completeBtn = document.getElementById('completeQuestBtn');


    let selectedQuestId = null;
    // Load and display quests
    fetch('/quests')
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                questList.innerHTML = "<p>No quests available.</p>";
                return;
            }

            data.forEach(quest => {
                const questItem = document.createElement('div');
                questItem.className = "quest-card";
                questItem.innerHTML = `<strong>${quest.title}</strong> — ${quest.points} points`;
                questItem.onclick = () => {
                    popupTitle.textContent = quest.title;
                    popupDesc.textContent = quest.description;
                    selectedQuestId = quest.quest_id;
                    popup.classList.remove('hidden');
                    popup.style.display = 'block';
                };
                questList.appendChild(questItem);
            });
        })
        .catch(err => {
            console.error("Error loading quests:", err);
            questList.innerHTML = "<p>Error loading quests.</p>";
        });

    // Popup close
    closeBtn.onclick = () => {
        popup.classList.add('hidden');
        popup.style.display = 'none';
    };

    // Submit quest completion
    completeBtn.onclick = () => {
        if (!selectedQuestId) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to complete a quest.');
            return;
        }

        fetch('/complete-quest', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ quest_id: selectedQuestId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.pointsEarned) {
                alert(`✅ Quest completed! You earned ${data.pointsEarned} points.`);
            } else {
                alert(`❌ ${data.error || 'Unknown error.'}`);
            }
            popup.classList.add('hidden');
            popup.style.display = 'none';
        })
        .catch(err => {
            console.error("Failed to complete quest:", err);
        });
    };
});

document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return window.location.href = "login.html";
    });

// completion seperation
document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`/api/user-quests/${user.user_id}`);
        const data = await res.json();

        const availableList = document.getElementById('availableList');
        const completedList = document.getElementById('completedList');

        availableList.innerHTML = '';
        completedList.innerHTML = '';

        if (data.available.length === 0) {
            availableList.innerHTML = '<li>No quests available right now.</li>';
        } else {
            data.available.forEach(q => {
                const li = document.createElement('li');
                li.textContent = q.title;
                availableList.appendChild(li);
            });
        }

        if (data.completed.length === 0) {
            completedList.innerHTML = '<li>You haven’t completed any quests yet.</li>';
        } else {
            data.completed.forEach(q => {
                const li = document.createElement('li');
                li.textContent = q.title;
                completedList.appendChild(li);
            });
        }

    } catch (err) {
        console.error(err);
    }
});
