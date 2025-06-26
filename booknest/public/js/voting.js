// public/js/voting.js  (replace everything with this)

document.addEventListener("DOMContentLoaded", initVotingPage);

async function initVotingPage() {
    const user  = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
        window.location.href = "login.html";
        return;
    }

    const $            = (id) => document.getElementById(id);
    const voteMessage  = $("voteMessage");
    const votingUIroot = document.querySelector(".voting");

    function hidePollUI() {
        votingUIroot.innerHTML =
            "<h2>Poll completed.</h2>";
    }

    async function checkIfVoted(pollId) {
        const res  = await fetch(`/api/has-voted?poll=${pollId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.alreadyVoted) hidePollUI();
        return data.alreadyVoted;
    }

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

    loadResults();    // latest closed poll
    loadWinner();
    loadPastPolls();
}
async function loadResults(pollId = "latest") {
    try {
        const res     = await fetch(`/api/poll-results/${pollId}`);
        const results = await res.json();
        const ul      = document.getElementById("resultsList");
        ul.innerHTML  = "";
        results.forEach((r) => {
            const li = document.createElement("li");
            li.textContent = ` ${r.title} – ${r.votes} vote${
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

document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = localStorage.getItem('is_admin') === "1";
    if (isAdmin) document.getElementById('admin-poll-panel').style.display = 'block';
    initPollForm();
});

function initPollForm() {
    const booksContainer = document.getElementById('book-options');
    const addBtn = document.getElementById('add-book');
    const form = document.getElementById('poll-form');
    const msg = document.getElementById('poll-msg');

    function createBookInput(index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'book-block';
    wrapper.style = "border:1px solid #ccc; padding:1rem; margin-bottom:1rem;";

    wrapper.innerHTML = `
    <label>Title:<br><input type="text" name="title" required></label><br>
    <label>Author:<br><input type="text" name="author" required></label><br>
    <label>Description:<br><textarea name="description" rows="2"></textarea></label><br>
    <label>Cover URL:<br><input type="text" name="cover_url"></label><br>
    `;

    booksContainer.appendChild(wrapper);
}

  // Add at least 2 books to start
createBookInput();
createBookInput();

addBtn.addEventListener('click', () => createBookInput());

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = "⏳ Creating...";

    const poll = {
    title: document.getElementById('poll-title').value.trim(),
    description: document.getElementById('poll-description').value.trim(),
    start_date: document.getElementById('poll-start').value,
    end_date: document.getElementById('poll-end').value,
    books: []
    };

    // Extract book data
    const blocks = document.querySelectorAll('.book-block');
    blocks.forEach(block => {
        const book = {
        title: block.querySelector('[name="title"]').value.trim(),
        author: block.querySelector('[name="author"]').value.trim(),
        description: block.querySelector('[name="description"]').value.trim(),
        cover_url: block.querySelector('[name="cover_url"]').value.trim(),
        };
        if (book.title && book.author) poll.books.push(book);
    });

    if (poll.books.length < 2) {
        msg.textContent = "❌ Need at least 2 valid books.";
        return;
    }

    try {
        const res = await fetch('/api/polls', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(poll)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unknown error");

        msg.textContent = "Poll created successfully!";
        form.reset();
        booksContainer.innerHTML = "";
        createBookInput();
        createBookInput();

    } catch (err) {
        console.error(err);
        msg.textContent = "❌ " + err.message;
    }
    });
}
