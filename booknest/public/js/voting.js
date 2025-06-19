// public/js/voting.js  (replace everything with this)

document.addEventListener("DOMContentLoaded", initVotingPage);

async function initVotingPage() {
    /* ------------------------------------------------------------------ *
     * 0. Auth guard
     * ------------------------------------------------------------------ */
    const user  = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
        window.location.href = "login.html";
        return;
    }

    /* ------------------------------------------------------------------ *
     * 1. Helpers
     * ------------------------------------------------------------------ */
    const $            = (id) => document.getElementById(id);
    const voteMessage  = $("voteMessage");
    const votingUIroot = document.querySelector(".voting");

    function hidePollUI() {
        votingUIroot.innerHTML =
            "<h2>✅ You’ve already voted in this poll.</h2>";
    }

    async function checkIfVoted(pollId) {
        const res  = await fetch(`/api/has-voted?poll=${pollId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.alreadyVoted) hidePollUI();
        return data.alreadyVoted;
    }

    /* ------------------------------------------------------------------ *
     * 2. Load active poll
     * ------------------------------------------------------------------ */
    let currentPoll = null;

    try {
        const res  = await fetch("/api/active-poll");
        const poll = await res.json();

        if (!poll || !poll.books?.length) {
            voteMessage.textContent = "❌ No active poll.";
        } else {
            currentPoll = poll;

            // 2a.  Hide UI *now* if user already voted
            const already = await checkIfVoted(poll.poll_id);
            if (already) {
                // still load past results + winner section
                loadResults(poll.poll_id);
                loadWinner();
                loadPastPolls()
                return;
            }

            // 2b.  Render polling UI
            document.querySelector("h2").textContent = poll.title;
            $("bookList").innerHTML = "";

            poll.books.forEach((book) => {
                const div = document.createElement("div");
                div.className = "book-card";

                const radio  = document.createElement("input");
                radio.type   = "radio";
                radio.name   = "book_id";
                radio.value  = book.book_id;
                radio.id     = `book-${book.book_id}`;

                const label  = document.createElement("label");
                label.htmlFor = radio.id;
                label.className = "vote-btn";
                label.innerHTML = `
                    <img src="${book.cover_url}" alt="${book.title}" />
                    <h3>${book.title}</h3>
                    <p><em>by ${book.author}</em></p>
                    <p>${book.description}</p>`;

                div.append(radio, label);
                $("bookList").appendChild(div);
            });
        }
    } catch (err) {
        console.error(err);
        voteMessage.textContent = "❌ Failed to load poll.";
    }

    /* ------------------------------------------------------------------ *
     * 3. Submit handler
     * ------------------------------------------------------------------ */
    $("voteForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentPoll) return;

        const selected = document.querySelector(
            'input[name="book_id"]:checked'
        );
        if (!selected) {
            voteMessage.textContent = "❌ Select a book first.";
            return;
        }

        try {
            const res = await fetch("/api/vote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    poll_id: currentPoll.poll_id,
                    book_id: selected.value,
                }),
            });

            const out = await res.json();

            if (!res.ok) {
                voteMessage.textContent =
                    out.message || "You’ve already voted.";
                if (out.message?.includes("already voted")) {
                    hidePollUI();
                }
                return;
            }

            // happy path
            voteMessage.textContent = "✅ Vote submitted!";
            hidePollUI();
            loadResults(currentPoll.poll_id);
            loadWinner();
        } catch (err) {
            console.error(err);
            voteMessage.textContent = "❌ Error submitting vote.";
        }
    });

    /* ------------------------------------------------------------------ *
     * 4. Always show results / winner + past polls
     * ------------------------------------------------------------------ */
    loadResults();    // latest closed poll
    loadWinner();
    loadPastPolls();
}

/* ---------------------------------------------------------------------- *
 *  Helper sections (results, winner, past polls)
 * ---------------------------------------------------------------------- */

async function loadResults(pollId = "latest") {
    try {
        const res     = await fetch(`/api/poll-results/${pollId}`);
        const results = await res.json();
        const ul      = document.getElementById("resultsList");
        ul.innerHTML  = "";
        results.forEach((r) => {
            const li = document.createElement("li");
            li.textContent = `📘 ${r.title} – ${r.votes} vote${
                r.votes !== 1 ? "s" : ""
            }`;
            ul.appendChild(li);
        });
    } catch (e) {
        console.error("loadResults", e);
    }
}

async function loadWinner() {
    try {
        const res    = await fetch("/api/poll-winner");
        const winner = await res.json();
        if (!winner?.cover_url) return;

        document.getElementById("winnerDisplay").innerHTML = `
            <div class="book-card">
                <img src="${winner.cover_url}" alt="${winner.title}" />
                <h3>${winner.title}</h3>
                <p><em>by ${winner.author}</em></p>
                <p>Votes: ${winner.votes}</p>
            </div>`;
    } catch (e) {
        console.error("loadWinner", e);
        document.getElementById("winnerSection").style.display = "none";
    }
}

async function loadPastPolls() {
    try {
        const res   = await fetch("/api/past-polls");
        const polls = await res.json();
        const list  = document.getElementById("pastList");
        list.innerHTML = "";
        polls.forEach((p) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <figure style="text-align:center">
                    <img src="${p.cover_url}" alt="${p.title}"
                        style="width:80px;border-radius:6px" />
                    <figcaption style="font-size:.8rem">${p.poll_title}</figcaption>
                </figure>`;
            list.appendChild(li);
        });
    } catch (e) {
        console.error("loadPastPolls", e);
        document.getElementById("pastList").textContent = "Failed to load.";
    }
}
