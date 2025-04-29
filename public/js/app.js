document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".container");
    const carouselContainer = document.querySelector('.carousel-container');
    const isBooksPage = window.location.pathname.includes("books.html");

    let books = [];
    
    // Fetch the books once
    try {
        const response = await fetch("/api/books"); // Relative URL
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        books = await response.json();
        displayBooks(books);

        if (isBooksPage) {
            populateFilters(books);
            addFilterListeners(books);
        }

        // Carousel functionality
        if (carouselContainer) {
            if (!books.length) return;

            carouselContainer.innerHTML = '';
            books.forEach(book => {
                const item = document.createElement('div');
                item.classList.add('carousel-item');
                item.innerHTML = `
                    <img src="${book.cover_image || 'placeholder.jpg'}" alt="${book.title}">
                    <h3>${book.title}</h3>
                `;
                carouselContainer.appendChild(item);
            });

            startCarousel();
        }
        
    } catch (error) {
        container.innerHTML = `<p>Error loading books: ${error.message}</p>`;
    }

    // Display books in the main container
    function displayBooks(books) {
        container.innerHTML = "";
        if (!books.length) {
            container.innerHTML = "<p>No books available.</p>";
        }
        books.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.classList.add("card");
            bookCard.innerHTML = `
                <img class="card--avatar" src="/images/${book.cover_image || 'placeholder.jpg'}" alt="${book.title}">
                <h3 class="card--title">${book.title}</h3>
                <p class="card--author"><strong>Author:</strong> ${book.author || "Unknown"}</p>
                <p class="card--genre"><strong>Genre:</strong> ${book.genre_ship || "Unknown"}</p>
            `;
            
            if (isBooksPage) {
                bookCard.addEventListener("click", () => openModal(book));
            }
            
            container.appendChild(bookCard);
        });
    }

    // Populate the filter dropdowns
    function populateFilters(books) {
        const genreSelect = document.getElementById("genre");
        const statusSelect = document.getElementById("status");

        if (!genreSelect || !statusSelect) {
            console.error("Error: Filter dropdowns not found.");
            return;
        }

        const genres = [...new Set(books.map(book => book.genre_ship || "Unknown"))].sort();
        const statuses = [...new Set(books.map(book => (book.read_status || "Not specified").trim().toLowerCase()))].sort();

        genreSelect.innerHTML = '<option value="">All Genres</option>';
        statusSelect.innerHTML = '<option value="">All Statuses</option>';

        genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });

        statuses.forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusSelect.appendChild(option);
        });
    }

    // Add event listeners for filters
    function addFilterListeners(books) {
        document.getElementById("sorting").addEventListener("change", () => applyFilters(books));
        document.getElementById("genre").addEventListener("change", () => applyFilters(books));
        document.getElementById("status").addEventListener("change", () => applyFilters(books));
    }

    // Apply filters based on user selections
    function applyFilters(books) {
        const sortBy = document.getElementById("sorting").value;
        const genreFilter = document.getElementById("genre").value;
        const statusFilter = (document.getElementById("status")?.value || "").trim().toLowerCase();

        let filteredBooks = books.filter(book => 
            (genreFilter === "" || book.genre_ship === genreFilter) &&
            (statusFilter === "" || (book.read_status || "").trim().toLowerCase() === statusFilter)
        );

        filteredBooks.sort((a, b) => {
            switch (sortBy) {
                case "author": return a.author.localeCompare(b.author);
                case "title": return a.title.localeCompare(b.title);
                case "publish": return new Date(b.publish_complete_date) - new Date(a.publish_complete_date);
                case "pages": return a.pages_words - b.pages_words;
                case "rating": return b.rating - a.rating;
                case "time": return a.hours_to_read - b.hours_to_read;
                default: return 0;
            }
        });

        displayBooks(filteredBooks);
    }

    // Open a modal with book details
    function openModal(book) {
        const modal = document.getElementById("bookModal");
    
        if (!modal) {
            console.error("Modal element not found!");
            return;
        }
    
        console.log('Opening Modal with Book Data:', book);  // Log the book data
    
        // Title and Image
        document.getElementById("modal-title").textContent = book.title || "Unknown Title";
        document.getElementById("modal-cover").src = `/images/${book.cover_image || "placeholder.jpg"}`;
    
        // Author, Genre, and Publish Date
        document.getElementById("modal-author").textContent = `Author: ${book.author || "Unknown"}`;
        document.getElementById("modal-genre").textContent = `Genre: ${book.genre_ship || "Unknown"}`;
        document.getElementById("modal-publish").textContent = `Publish Date: ${book.publish_complete_date || "N/A"}`;
    
        // Pages - Ensure valid number
        let pages = book.pages_words;
        if (pages && !isNaN(pages)) {
            document.getElementById("modal-pages").textContent = `Pages: ${pages}`;
        } else {
            document.getElementById("modal-pages").textContent = "Pages: ?";
        }
    
        // Rating - Ensure it's valid and numeric
        let rating = book.rating;
        if (rating && !isNaN(rating)) {
            document.getElementById("modal-rating").textContent = `Rating: ${rating}`;
        } else {
            document.getElementById("modal-rating").textContent = "Rating: N/A";
        }
    
        // Hours to Read - Ensure it's valid
        let hoursToRead = book.hours_to_read;
        if (hoursToRead && !isNaN(hoursToRead)) {
            document.getElementById("modal-time").textContent = `Hours to Read: ${hoursToRead}`;
        } else {
            document.getElementById("modal-time").textContent = "Hours to Read: N/A";
        }
    
        // Description - Fallback if missing
        document.getElementById("modal-description").textContent = book.description && book.description !== "No description available." ? `Description: ${book.description}` : "Description: No description available.";
    
        // Show the modal
        modal.style.display = "flex";
    
        // Close the modal when clicking the close button
        document.querySelector(".close-btn").onclick = () => {
            modal.style.display = "none";
        };
    
        // Close the modal if clicked outside of it
        window.onclick = event => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };
    }
});
