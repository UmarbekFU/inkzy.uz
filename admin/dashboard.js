document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard script loaded');

    // Check authentication
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = '/admin/login.html';
        return;
    }

    // Initialize editor
    const editor = new Quill('#editor', {
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

    // Get form elements
    const essayForm = document.querySelector('#essayForm');
    const publishButton = document.querySelector('#publishEssay');
    const saveDraftButton = document.querySelector('#saveDraftBtn');

    // Debug log
    console.log('Found elements:', { 
        form: essayForm, 
        publishBtn: publishButton, 
        draftBtn: saveDraftButton 
    });

    // Form submission handler
    essayForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        
        try {
            const essayData = {
                title: document.querySelector('#essayTitle').value,
                content: editor.root.innerHTML,
                excerpt: document.querySelector('#essayExcerpt').value,
                tags: document.querySelector('#essayTags').value.split(',').map(tag => tag.trim()),
                status: 'published'
            };

            console.log('Submitting essay:', essayData);

            const response = await fetch('/api/essays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(essayData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to publish essay');
            }

            showNotification('Essay published successfully!', 'success');
            setTimeout(() => {
                window.location.href = `/essays/${data.slug}`;
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
        }
    });

    // Save draft handler
    saveDraftButton?.addEventListener('click', async () => {
        console.log('Save draft clicked');
        try {
            const essayData = {
                title: document.querySelector('#essayTitle').value,
                content: editor.root.innerHTML,
                excerpt: document.querySelector('#essayExcerpt').value,
                tags: document.querySelector('#essayTags').value.split(',').map(tag => tag.trim()),
                status: 'draft'
            };

            const response = await fetch('/api/essays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(essayData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save draft');
            }

            showNotification('Draft saved successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
        }
    });

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}); 