document.addEventListener("DOMContentLoaded", () => {
    const questList = document.getElementById('questList');
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popupTitle');
    const popupDesc = document.getElementById('popupDescription');
    const closeBtn = document.getElementById('popupClose');
    const completeBtn = document.getElementById('completeQuestBtn');

    let selectedQuestId = null;
    const userId = 1; // TEMP user

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

        fetch('/complete-quest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, quest_id: selectedQuestId })
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