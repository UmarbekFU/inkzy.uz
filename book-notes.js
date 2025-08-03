document.addEventListener('DOMContentLoaded', () => {
    const booksList = document.querySelector('.books-list');
    const sortButtons = document.querySelectorAll('.sort-btn');

    // Sample books data (you can replace this with your actual data)
    let books = [
        {
            title: "Antifragile",
            author: "Nassim Nicholas Taleb",
            readDate: "January 2024",
            isbn: "978-1400067824",
            tags: ["Philosophy", "Systems"],
            summary: "Things that gain from disorder. A fascinating exploration of systems that become stronger when exposed to volatility.",
            rating: 5, // For top picks sorting
            timestamp: new Date("2024-01-15").getTime() // For newest sorting
        },
        // Add more books here
    ];

    // Sorting functions
    const sortFunctions = {
        recommended: (a, b) => b.rating - a.rating,
        newest: (a, b) => b.timestamp - a.timestamp,
        title: (a, b) => a.title.localeCompare(b.title),
        author: (a, b) => a.author.localeCompare(b.author)
    };

    // Render book entry
    function renderBook(book) {
        return `
            <article class="book-entry">
                <div class="book-main">
                    <h2>${book.title}</h2>
                    <p class="book-meta">
                        by ${book.author}
                        <span class="meta-divider">•</span>
                        <span class="reading-date">Read: ${book.readDate}</span>
                        <span class="meta-divider">•</span>
                        <span class="isbn">ISBN: ${book.isbn}</span>
                    </p>
                    <div class="tags">
                        ${book.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <p class="summary">${book.summary}</p>
                    <a href="notes/${book.title.toLowerCase().replace(/\s+/g, '-')}.html" class="read-notes">
                        Read detailed notes →
                    </a>
                </div>
            </article>
        `;
    }

    // Sort and render books
    function sortAndRenderBooks(sortType) {
        const sortedBooks = [...books].sort(sortFunctions[sortType]);
        booksList.innerHTML = sortedBooks.map(renderBook).join('');
        
        // Add animation
        gsap.from('.book-entry', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
        });
    }

    // Handle sort button clicks
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            sortButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Sort and render
            sortAndRenderBooks(button.dataset.sort);
        });
    });

    // Initial sort (by recommended)
    sortAndRenderBooks('recommended');

    // Optional: Add search functionality
    const searchInput = document.getElementById('searchNotes');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredBooks = books.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                book.summary.toLowerCase().includes(searchTerm)
            );
            booksList.innerHTML = filteredBooks.map(renderBook).join('');
        }, 300));
    }

    // Debounce helper function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}); 