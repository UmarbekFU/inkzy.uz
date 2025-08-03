class GalleryManager {
    constructor() {
        this.galleryItems = [];
        this.currentItem = null;
        this.isEditing = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadGalleryItems();
        this.renderGalleryList();
    }

    setupEventListeners() {
        // Add new item button
        const addBtn = document.getElementById('addGalleryItem');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddForm());
        }

        // Form submission
        const form = document.getElementById('galleryForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelGalleryItem');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideForm());
        }

        // File input for media upload
        const mediaInput = document.getElementById('mediaUrl');
        if (mediaInput) {
            mediaInput.addEventListener('change', (e) => this.handleMediaUpload(e));
        }

        // Media type change
        const mediaTypeSelect = document.getElementById('mediaType');
        if (mediaTypeSelect) {
            mediaTypeSelect.addEventListener('change', (e) => this.handleMediaTypeChange(e));
        }
    }

    async loadGalleryItems() {
        try {
            const response = await fetch('/api/gallery', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                this.galleryItems = data.data;
            } else {
                console.error('Failed to load gallery items');
            }
        } catch (error) {
            console.error('Error loading gallery items:', error);
        }
    }

    renderGalleryList() {
        const container = document.getElementById('galleryList');
        if (!container) return;

        if (this.galleryItems.length === 0) {
            container.innerHTML = '<p class="no-items">No gallery items found. Add your first item!</p>';
            return;
        }

        container.innerHTML = this.galleryItems.map(item => `
            <div class="gallery-item-card" data-id="${item._id}">
                <div class="item-preview">
                    ${item.mediaType === 'video' 
                        ? `<video src="${item.mediaUrl}" muted></video>`
                        : `<img src="${item.mediaUrl}" alt="${item.title}">`
                    }
                </div>
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <p>${item.description || 'No description'}</p>
                    <div class="item-meta">
                        <span class="media-type">${item.mediaType}</span>
                        <span class="status ${item.isActive ? 'active' : 'inactive'}">
                            ${item.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="galleryManager.editItem('${item._id}')">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button class="delete-btn" onclick="galleryManager.deleteItem('${item._id}')">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                    <button class="randomize-btn" onclick="galleryManager.randomizeItem('${item._id}')">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showAddForm() {
        this.isEditing = false;
        this.currentItem = null;
        this.showForm();
        this.resetForm();
    }

    showEditForm(item) {
        this.isEditing = true;
        this.currentItem = item;
        this.showForm();
        this.populateForm(item);
    }

    showForm() {
        const form = document.getElementById('galleryForm');
        const list = document.getElementById('galleryList');
        
        if (form && list) {
            form.style.display = 'block';
            list.style.display = 'none';
        }
    }

    hideForm() {
        const form = document.getElementById('galleryForm');
        const list = document.getElementById('galleryList');
        
        if (form && list) {
            form.style.display = 'none';
            list.style.display = 'block';
        }
    }

    resetForm() {
        const form = document.getElementById('galleryForm');
        if (form) {
            form.reset();
            document.getElementById('formTitle').textContent = 'Add New Gallery Item';
        }
    }

    populateForm(item) {
        const form = document.getElementById('galleryForm');
        if (!form) return;

        document.getElementById('formTitle').textContent = 'Edit Gallery Item';
        document.getElementById('title').value = item.title;
        document.getElementById('description').value = item.description || '';
        document.getElementById('mediaUrl').value = item.mediaUrl;
        document.getElementById('mediaType').value = item.mediaType;
        document.getElementById('thumbnailUrl').value = item.thumbnailUrl || '';
        document.getElementById('tags').value = item.tags ? item.tags.join(', ') : '';
        document.getElementById('order').value = item.order || 0;
        document.getElementById('isActive').checked = item.isActive !== false;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            mediaUrl: formData.get('mediaUrl'),
            mediaType: formData.get('mediaType'),
            thumbnailUrl: formData.get('thumbnailUrl'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean),
            order: parseInt(formData.get('order')) || 0,
            isActive: formData.get('isActive') === 'on'
        };

        try {
            const url = this.isEditing 
                ? `/api/gallery/${this.currentItem._id}`
                : '/api/gallery';
            
            const method = this.isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Gallery item saved successfully!', 'success');
                await this.loadGalleryItems();
                this.renderGalleryList();
                this.hideForm();
            } else {
                this.showNotification(result.message || 'Failed to save gallery item', 'error');
            }
        } catch (error) {
            console.error('Error saving gallery item:', error);
            this.showNotification('Error saving gallery item', 'error');
        }
    }

    async editItem(id) {
        const item = this.galleryItems.find(item => item._id === id);
        if (item) {
            this.showEditForm(item);
        }
    }

    async deleteItem(id) {
        if (!confirm('Are you sure you want to delete this gallery item?')) {
            return;
        }

        try {
            const response = await fetch(`/api/gallery/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Gallery item deleted successfully!', 'success');
                await this.loadGalleryItems();
                this.renderGalleryList();
            } else {
                this.showNotification(result.message || 'Failed to delete gallery item', 'error');
            }
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            this.showNotification('Error deleting gallery item', 'error');
        }
    }

    async randomizeItem(id) {
        try {
            const response = await fetch(`/api/gallery/${id}/randomize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Item position randomized!', 'success');
                await this.loadGalleryItems();
                this.renderGalleryList();
            } else {
                this.showNotification(result.message || 'Failed to randomize item', 'error');
            }
        } catch (error) {
            console.error('Error randomizing item:', error);
            this.showNotification('Error randomizing item', 'error');
        }
    }

    handleMediaUpload(e) {
        const file = e.target.files[0];
        if (file) {
            // In a real implementation, you'd upload to a server
            // For now, we'll use a placeholder
            const url = URL.createObjectURL(file);
            document.getElementById('mediaUrl').value = url;
        }
    }

    handleMediaTypeChange(e) {
        const mediaType = e.target.value;
        const mediaUrlInput = document.getElementById('mediaUrl');
        const thumbnailUrlInput = document.getElementById('thumbnailUrl');
        
        if (mediaType === 'video') {
            mediaUrlInput.placeholder = 'Enter video URL (MP4, WebM, etc.)';
            thumbnailUrlInput.style.display = 'block';
        } else {
            mediaUrlInput.placeholder = 'Enter image URL';
            thumbnailUrlInput.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize gallery manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.galleryManager = new GalleryManager();
}); 