document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user) {
    window.location.href = "login.html";
    return;
    }

    const bookList = document.getElementById("bookList");
    const voteForm = document.getElementById("voteForm");
    const voteMessage = document.getElementById("voteMessage");
  let poll = null; // declare poll here for later use

    try {
    const res = await fetch("/api/active-poll");
    const data = await res.json();
    console.log("Fetched poll data:", data);


    if (!data || !data.books || data.books.length === 0) {
    voteMessage.textContent = "❌ No active poll available.";
    return;
}

poll = {
    poll_id: data.poll_id,
    title: data.title,
    description: data.description
};
    document.querySelector("h2").textContent = data.title;

    data.books.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "book_id";
        radio.value = book.book_id;
        radio.id = `book-${book.book_id}`;

        const label = document.createElement("label");
        label.setAttribute("for", `book-${book.book_id}`);
        label.className = "vote-btn";
        label.innerHTML = `
        <img src="${book.cover_url}" alt="${book.title}" />
        <h3>${book.title}</h3>
        <p><em>by ${book.author}</em></p>
        <p>${book.description}</p>
        `;

        card.appendChild(radio);
        card.appendChild(label);
        bookList.appendChild(card);
    });
    } catch (err) {
    voteMessage.textContent = "❌ Error loading poll data.";
    console.error(err);
    }

    voteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
        if (result.success) {
    voteMessage.textContent = "✅ Vote submitted successfully!";
    await loadResults(poll.poll_id); // show results after voting
}
    async function loadResults(poll_id) {
    try {
        const res = await fetch(`/api/poll-results/${poll_id}`);
        const results = await res.json();

        const resultsList = document.getElementById("resultsList");
        resultsList.innerHTML = "";

        results.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `📘 ${item.title} – ${item.votes} vote${item.votes != 1 ? 's' : ''}`;
            resultsList.appendChild(li);
        });
    } catch (err) {
        console.error("Error loading poll results:", err);
    }
}
    const selected = document.querySelector('input[name="book_id"]:checked');
    if (!selected) {
        voteMessage.textContent = "❌ Please select a book before voting.";
        return;
    }

    try {
        const voteRes = await fetch("/api/vote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // 🔑 Send the JWT token
            },
            body: JSON.stringify({
                user_id: user.user_id,
                book_id: selected.value,
                poll_id: poll.poll_id
            })
        });

        const result = await voteRes.json();

        if (!voteRes.ok) {
            voteMessage.textContent = `❌ ${result.message || "Vote failed. Already voted."}`;
            return;
        }

        voteMessage.textContent = "✅ Vote submitted successfully!";
    } catch (err) {
        console.error("Error submitting vote:", err);
        voteMessage.textContent = "❌ Failed to submit your vote due to a network error.";
    }
})})
async function loadWinner() {
    try {
        const res = await fetch("/api/poll-winner");
        const winner = await res.json();

        const display = document.getElementById("winnerDisplay");
        display.innerHTML = `
            <div class="book-card">
                <img src="${winner.cover_url}" alt="${winner.title}" />
                <h3>${winner.title}</h3>
                <p><em>by ${winner.author}</em></p>
                <p>Votes: ${winner.votes}</p>
            </div>
        `;
    } catch (err) {
        console.error("Error loading poll winner:", err);
        document.getElementById("winnerSection").style.display = "none";
    }
}