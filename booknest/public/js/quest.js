function completeQuest(userId, questId) {
    fetch('/complete-quest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, quest_id: questId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.pointsEarned) {
            alert(`✅ Quest completed! You earned ${data.pointsEarned} points.`);
        } else {
            alert(`❌ Error: ${data.error}`);
        }
    })
    .catch(err => {
        console.error('Network error:', err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const questList = document.getElementById('questList');
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popupTitle');
    const popupDesc = document.getElementById('popupDescription');
    const closeBtn = document.getElementById('popupClose');
    const completeBtn = document.getElementById('completeQuestBtn');

    let selectedQuestId = null;
    const userId = 1; // 🔧 TEMP: hardcoded test user

    // Load quests from backend
    fetch('/quests')
        .then(res => res.json())
        .then(data => {
            data.forEach(quest => {
                const div = document.createElement('div');
                div.classList.add('quest');
                div.innerHTML = `<strong>${quest.title}</strong> — ${quest.points} points`;
                div.onclick = () => {
                    popupTitle.textContent = quest.title;
                    popupDesc.textContent = `Earn ${quest.points} points by completing this quest.`;
                    selectedQuestId = quest.quest_id;
                    popup.classList.remove('hidden');
                    popup.style.display = 'block';
                };
                questList.appendChild(div);
            });
        });

    closeBtn.onclick = () => {
        popup.classList.add('hidden');
        popup.style.display = 'none';
    };

    completeBtn.onclick = () => {
        fetch('/complete-quest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, quest_id: selectedQuestId })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message || "Quest completed!");
            popup.classList.add('hidden');
            popup.style.display = 'none';
        })
        .catch(err => {
            console.error("Failed to complete quest:", err);
        });
    };
});

document.addEventListener("DOMContentLoaded", () => {
    fetch('/quests')
        .then(response => response.json())
        .then(data => {
            const questList = document.getElementById('questList');

            if (!data.length) {
                questList.innerHTML = "<p>No quests available.</p>";
                return;
            }

            data.forEach(quest => {
                const questItem = document.createElement('div');
                questItem.className = "quest-card";
                questItem.innerHTML = `<strong>${quest.title}</strong> — ${quest.points} points`;
                questList.appendChild(questItem);
            });
        })
        .catch(err => {
            console.error("Error loading quests:", err);
            const questList = document.getElementById('questList');
            questList.innerHTML = "<p>Error loading quests.</p>";
        });
});
