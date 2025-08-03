// Initialize book notes editor
const bookNotesEditor = new Quill('#bookNotesEditor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            ['link', 'image', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }]
        ]
    }
});

// Load books
async function loadAdminBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        
        document.getElementById('adminBooksList').innerHTML = books.map(book => `
            <div class="book-item" data-id="${book.id}">
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <div class="book-actions">
                    <button onclick="editBook(${book.id})">Edit</button>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showNotification('Error loading books', 'error');
    }
}

// Handle form submission
document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        isbn: document.getElementById('bookISBN').value,
        summary: document.getElementById('bookSummary').value,
        tags: document.getElementById('bookTags').value.split(',').map(tag => tag.trim()),
        rating: parseInt(document.getElementById('bookRating').value),
        readDate: document.getElementById('bookReadDate').value,
        notesContent: bookNotesEditor.getContents()
    };

    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            showNotification('Book saved successfully', 'success');
            loadAdminBooks();
        } else {
            throw new Error('Failed to save book');
        }
    } catch (error) {
        showNotification('Error saving book', 'error');
    }
}); 