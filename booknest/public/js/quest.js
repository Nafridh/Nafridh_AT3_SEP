/* public/js/quests.js — one clean copy */
document.addEventListener("DOMContentLoaded", async () => {
  /* ------------------------------------------------------------ *
   * 0.  Auth
   * ------------------------------------------------------------ */
    const user  = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
    window.location.href = "login.html";
    return;
    }

  /* ------------------------------------------------------------ *
   * 1.  DOM handles
   * ------------------------------------------------------------ */
    const avail     = document.getElementById("availableList");
    const done      = document.getElementById("completedList");
    const popup     = document.getElementById("popup");
    const popTitle  = document.getElementById("popupTitle");
    const popDesc   = document.getElementById("popupDescription");
    const popClose  = document.getElementById("popupClose");
    const popDone   = document.getElementById("completeQuestBtn");

  let currentQuest = null;          // quest displayed in popup

  /* ------------------------------------------------------------ *
   * 2.  Initial load
   * ------------------------------------------------------------ */
    await refreshLists();

  /* ------------------------------------------------------------ *
   * 3.  Popup actions
   * ------------------------------------------------------------ */
    popClose.onclick = hidePopup;

    popDone.onclick = async () => {
    if (!currentQuest) return;

    const res = await fetch("/complete-quest", {
    method : "POST",
    headers: { "Content-Type": "application/json",
                Authorization : `Bearer ${token}` },
    body   : JSON.stringify({ quest_id: currentQuest.quest_id })
    });
    const out = await res.json();
    if (!res.ok) { alert(out.error || "Failed"); return; }

    moveToCompleted(currentQuest);
    updatePoints(out.pointsEarned || 0);
    alert(`✅ Quest completed! (+${out.pointsEarned} pts)`);
    hidePopup();
    };

  /* ================  helper functions  ================= */

    async function refreshLists() {
    const res  = await fetch(`/api/user-quests/${user.user_id}`, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    const data = await res.json();
    render(data.available, data.completed);
    }

    function render(availArr, doneArr) {
    avail.innerHTML = "";
    done .innerHTML = "";

    if (!availArr.length)
        avail.innerHTML = "<li>No quests available.</li>";
    if (!doneArr.length)
        done.innerHTML  = "<li>You haven’t completed any quests yet.</li>";

    availArr.forEach(q => avail.appendChild(card(q, true)));
    doneArr .forEach(q => done .appendChild(card(q, false)));
    }

    function card(q, clickable) {
    const li = document.createElement("li");
    li.className = "quest-card";
    li.textContent = `${q.title} — ${q.points} pts`;

    if (clickable) {
        li.addEventListener("click", () => {
        currentQuest         = q;
        popTitle.textContent = q.title;
        popDesc.textContent  = q.description;
        popup.classList.remove("hidden");
        });
    } else {
        li.style.opacity = 0.6;
    }
    return li;
    }

    function hidePopup() {
    popup.classList.add("hidden");
    currentQuest = null;
    }

    function moveToCompleted(q) {
    // remove from Available
    [...avail.children].forEach(el => {
        if (el.textContent.startsWith(q.title)) el.remove();
    });
    // add to Completed
    done.appendChild(card(q, false));
    if (!avail.children.length)
        avail.innerHTML = "<li>No quests available.</li>";
    }

    function updatePoints(inc) {
    // update local copy + broadcast
    user.total_points += inc;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("__points_sync",
        JSON.stringify({ value:user.total_points, t:Date.now() }));

    // if this page shows points, bump them
    const pts = document.getElementById("userPoints");
    if (pts) pts.textContent = user.total_points;
    }
});
