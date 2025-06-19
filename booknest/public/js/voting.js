document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
        window.location.href = "login.html";
        return;
    }
// yes
async function checkIfVoted(pollId) {
    const res = await fetch(`/api/has-voted/${pollId}?user=${user.user_id}`);
    const data = await res.json();
    if (data.alreadyVoted) hidePollUI();
}

function hidePollUI() {
    document.querySelector(".voting").innerHTML =
        "<p>✅ You’ve already voted in this poll. Thanks!</p>";
}
//here
    const $ = (id) => document.getElementById(id);
    const voteMessage = $("voteMessage");
    let currentPoll = null;

    try {
        const res = await fetch("/api/active-poll");
        const poll = await res.json();

        if (!poll || !poll.books || poll.books.length === 0) {
            voteMessage.textContent = "❌ No active poll.";
        } else {
            currentPoll = poll;
            document.querySelector("h2").textContent = poll.title;
            $("bookList").innerHTML = "";

            poll.books.forEach(book => {
                const div = document.createElement("div");
                div.className = "book-card";

                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "book_id";
                radio.value = book.book_id;
                radio.id = `book-${book.book_id}`;

                const label = document.createElement("label");
                label.setAttribute("for", radio.id);
                label.className = "vote-btn";
                label.innerHTML = `
                    <img src="${book.cover_url}" alt="${book.title}" />
                    <h3>${book.title}</h3>
                    <p><em>by ${book.author}</em></p>
                    <p>${book.description}</p>
                `;

                div.appendChild(radio);
                div.appendChild(label);
                $("bookList").appendChild(div);
            });
        }
    } catch (err) {
        console.error(err);
        voteMessage.textContent = "❌ Failed to load poll.";
    }

    $("voteForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const selected = document.querySelector('input[name="book_id"]:checked');
        if (!selected || !currentPoll) {
            voteMessage.textContent = "❌ Select a book first.";
            return;
        }

        try {
            const res = await fetch("/api/vote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    poll_id: currentPoll.poll_id,
                    book_id: selected.value
                })
            });

            const result = await res.json();
            if (!res.ok) {
                voteMessage.textContent = `❌ ${result.message}`;
            } else {
                voteMessage.textContent = "✅ Vote submitted!";
                hidePollUI();
                await loadResults(currentPoll.poll_id);
                await loadWinner();
            }
            // changes from here
            if (!res.ok) {
    voteMessage.textContent = result.message || "You already voted.";
    if (result.message.includes("already voted")) {
        document.getElementById("voteForm").style.display = "none"; // 🔥 Hide form
    }
    return;
}
//to here
        } catch (err) {
            console.error(err);
            voteMessage.textContent = "❌ Error submitting vote.";
        }
    });

    loadResults();
    loadWinner();

    async function loadResults(pollId = "latest") {
        try {
            const res = await fetch(`/api/poll-results/${pollId}`);
            const results = await res.json();
            $("resultsList").innerHTML = "";
            results.forEach(item => {
                const li = document.createElement("li");
                li.textContent = `📘 ${item.title} – ${item.votes} vote${item.votes !== 1 ? "s" : ""}`;
                $("resultsList").appendChild(li);
            });
        } catch (err) {
            console.error("Error loading results:", err);
        }
    }

    async function loadWinner() {
        try {
            const res = await fetch("/api/poll-winner");
            const winner = await res.json();

            $("winnerDisplay").innerHTML = `
                <div class="book-card">
                    <img src="${winner.cover_url}" alt="${winner.title}" />
                    <h3>${winner.title}</h3>
                    <p><em>by ${winner.author}</em></p>
                    <p>Votes: ${winner.votes}</p>
                </div>
            `;
        } catch (err) {
            console.error("Error loading winner:", err);
            $("winnerSection").style.display = "none";
        }
    }
});

loadPastPolls();

async function loadPastPolls() {
    try {
        const res = await fetch("/api/past-polls");
        const polls = await res.json();
        const list  = document.getElementById("pastList");
        list.innerHTML = "";

        polls.forEach(p => {
            const li = document.createElement("li");
            li.innerHTML = `
                <figure style="text-align:center">
                    <img src="${p.cover_url}" alt="${p.title}" style="width:80px;border-radius:6px"/>
                    <figcaption style="font-size:.8rem">${p.poll_title}</figcaption>
                </figure>`;
            list.appendChild(li);
        });
    } catch (e) {
        console.error(e);
        document.getElementById("pastList").textContent = "Failed to load.";
    }
}
