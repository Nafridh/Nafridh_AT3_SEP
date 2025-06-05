// js/voting.js
document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return window.location.href = "login.html";

    const res = await fetch("/api/active-poll");
    const { poll, books } = await res.json();

    const bookList = document.getElementById("bookList");
    books.forEach(book => {
    const card = document.createElement("div");
    card.classList.add("book-card");
    card.innerHTML = `
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <button data-book-id="${book.book_id}">Vote</button>
    `;
    bookList.appendChild(card);
    });

    bookList.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
        const bookId = e.target.getAttribute("data-book-id");
        const voteRes = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, book_id: bookId, poll_id: poll.poll_id })
        });

        const result = await voteRes.json();
        alert(result.message || "Vote submitted!");
    }
    });
});

// voting.js

document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return window.location.href = "login.html";

    const res = await fetch("/api/active-poll");
    const { poll, books } = await res.json();


    const bookList = document.getElementById("bookList");
    books.forEach(book => {
    const card = document.createElement("div");
    card.classList.add("book-card");
    card.innerHTML = `
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <button data-book-id="${book.book_id}">Vote</button>
    `;
    bookList.appendChild(card);
    });

    bookList.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
        const bookId = e.target.getAttribute("data-book-id");
        const voteRes = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user.user_id,
            book_id: bookId,
            poll_id: poll.poll_id
        })
        });

        const result = await voteRes.json();
        alert(result.message || "Vote submitted!");
    }
    });
});

const bookList = document.getElementById('bookList');
books.forEach(book => {
    const bookDiv = document.createElement('div');
    bookDiv.classList.add('book-option');
    bookDiv.innerHTML = `
    <input type="radio" name="book" value="${book.book_id}" required />
    <img src="${book.cover_url}" alt="${book.title} cover" />
    <h3>${book.title}</h3>
    <p>by ${book.author}</p>
    <p>${book.description}</p>
    `;
    bookList.appendChild(bookDiv);
});

document.getElementById('voteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedBookId = document.querySelector('input[name="book"]:checked').value;
    const user = JSON.parse(localStorage.getItem('user'));
    
    const res = await fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.user_id, book_id: selectedBookId, poll_id: poll.poll_id })
    });

    if (res.ok) {
    alert('Your vote has been submitted!');
    } else {
    alert('Failed to submit vote.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
    window.location.href = 'login.html';
    return;
    }

    const bookList = document.getElementById('bookList');
    const voteForm = document.getElementById('voteForm');
    const voteMessage = document.getElementById('voteMessage');

    fetch('/api/active-poll')
    .then(res => res.json())
    .then(data => {
        if (!data.poll || data.books.length === 0) {
        voteMessage.textContent = 'No active poll available at the moment.';
        return;
        }

        const pollTitle = document.createElement('h3');
        pollTitle.textContent = data.poll.title;
        voteForm.insertBefore(pollTitle, bookList);

        const pollDescription = document.createElement('p');
        pollDescription.textContent = data.poll.description;
        voteForm.insertBefore(pollDescription, bookList);

        data.books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';

        const cover = document.createElement('img');
        cover.src = book.cover_url;
        cover.alt = book.title;

        const title = document.createElement('h4');
        title.textContent = book.title;

        const author = document.createElement('p');
        author.textContent = `by ${book.author}`;

        const description = document.createElement('p');
        description.textContent = book.description;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'book_id';
        radio.value = book.book_id;

        card.appendChild(radio);
        card.appendChild(cover);
        card.appendChild(title);
        card.appendChild(author);
        card.appendChild(description);

        bookList.appendChild(card);
        });

        voteForm.addEventListener('submit', e => {
        e.preventDefault();

        const selected = voteForm.querySelector('input[name="book_id"]:checked');
        if (!selected) {
            voteMessage.textContent = 'Please select a book to vote for.';
            return;
        }

        fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            user_id: user.user_id,
            book_id: selected.value,
            poll_id: data.poll.poll_id
            })
        })
            .then(res => res.json())
            .then(result => {
            if (result.success) {
                voteMessage.textContent = '✅ Vote submitted!';
                voteForm.reset();
            } else {
                voteMessage.textContent = `❌ ${result.message}`;
            }
            })
            .catch(err => {
            voteMessage.textContent = '❌ An error occurred while submitting your vote.';
            console.error(err);
            });
        });
    })
    .catch(err => {
        voteMessage.textContent = '❌ Failed to load voting options.';
        console.error(err);
    });
});

const bookList = document.getElementById('bookList');
let selectedBookId = null;

function renderBooks(poll, books) {
    document.querySelector('h2').textContent = poll.title;
    bookList.innerHTML = '';

    books.forEach(book => {
    const card = document.createElement('div');
    card.classList.add('book-card');

    card.innerHTML = `
        <img src="${book.cover_url}" alt="${book.title}" />
        <h3>${book.title} By ${book.author}</h3>
        <p>${book.description}</p>
        <input type="radio" name="vote" value="${book.book_id}" id="book-${book.book_id}" hidden>
        <label for="book-${book.book_id}" class="vote-btn">select</label>
    `;

    bookList.appendChild(card);
    });
}

fetch('/api/active-poll')
    .then(res => res.json())
    .then(data => {
    if (!data.poll) return;
    renderBooks(data.poll, data.books);
    });

document.getElementById('voteForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const selected = document.querySelector('input[name="vote"]:checked');
    if (!selected) return alert('Please select a book.');

    const book_id = parseInt(selected.value);
    const user = JSON.parse(localStorage.getItem('user'));

    fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        user_id: user.user_id,
        book_id,
      poll_id: 1 // Use actual dynamic poll ID
    })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('voteMessage').textContent = data.message;
    });
});
