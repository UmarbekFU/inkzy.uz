class EssaysManager {
    constructor() {
        this.essays = [];
        this.currentEssay = null;
        this.isEditing = false;
        this.init();
    }

    async init() {
        await this.loadEssays();
        this.renderEssaysList();
        this.attachEventListeners();
    }

    async loadEssays() {
        try {
            const response = await fetch('/api/essays/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load essays');
            }
            
            this.essays = await response.json();
        } catch (error) {
            console.error('Error loading essays:', error);
            this.showNotification('Failed to load essays', 'error');
        }
    }

    renderEssaysList() {
        const essaysList = document.querySelector('#essaysList');
        if (!essaysList) return;

        if (this.essays.length === 0) {
            essaysList.innerHTML = '<div class="empty-state">No essays found</div>';
            return;
        }

        essaysList.innerHTML = this.essays.map(essay => `
            <div class="essay-item ${essay.status}" data-id="${essay._id}">
                <div class="essay-item-content">
                    <h3 class="essay-item-title">${essay.title}</h3>
                    <div class="essay-item-meta">
                        <span class="essay-status ${essay.status}">${essay.status}</span>
                        <span class="essay-date">${this.formatDate(essay.publishDate)}</span>
                        <span class="essay-reading-time">${essay.readingTime} min read</span>
                    </div>
                    <p class="essay-excerpt">${essay.excerpt}</p>
                </div>
                <div class="essay-item-actions">
                    <button class="edit-btn" onclick="essaysManager.editEssay('${essay._id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        </svg>
                    </button>
                    <button class="delete-btn" onclick="essaysManager.deleteEssay('${essay._id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        const newEssayBtn = document.querySelector('#newEssayBtn');
        const essayForm = document.querySelector('#essayFormElement');
        const publishBtn = document.querySelector('#publishEssay');
        const backToEssaysBtn = document.querySelector('#backToEssaysBtn');

        if (newEssayBtn) {
            newEssayBtn.addEventListener('click', () => this.showEssayForm());
        }

        if (essayForm) {
            essayForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publishEssay());
        }

        if (backToEssaysBtn) {
            backToEssaysBtn.addEventListener('click', () => this.showSection('essays'));
        }
    }

    showEssayForm(essay = null) {
        this.currentEssay = essay;
        this.isEditing = !!essay;

        const form = document.querySelector('#essayFormElement');
        const titleInput = document.querySelector('#essayTitle');
        const contentInput = document.querySelector('#essayContent');
        const excerptInput = document.querySelector('#essayExcerpt');
        const tagsInput = document.querySelector('#essayTags');
        const publishBtn = document.querySelector('#publishEssay');
        const formTitle = document.querySelector('#essayFormTitle');

        if (essay) {
            titleInput.value = essay.title;
            contentInput.value = essay.content;
            excerptInput.value = essay.excerpt;
            tagsInput.value = essay.tags.join(', ');
            publishBtn.textContent = 'Update Essay';
            formTitle.textContent = 'Edit Essay';
        } else {
            form.reset();
            publishBtn.textContent = 'Publish Essay';
            formTitle.textContent = 'New Essay';
        }

        // Show the form section
        this.showSection('essayForm');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const essayData = {
            title: formData.get('title'),
            content: formData.get('content'),
            excerpt: formData.get('excerpt'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            status: 'draft'
        };

        try {
            if (this.isEditing) {
                await this.updateEssay(essayData);
            } else {
                await this.createEssay(essayData);
            }
        } catch (error) {
            console.error('Error saving essay:', error);
            this.showNotification('Failed to save essay', 'error');
        }
    }

    async createEssay(essayData) {
        const response = await fetch('/api/essays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(essayData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create essay');
        }

        const newEssay = await response.json();
        this.essays.unshift(newEssay);
        this.renderEssaysList();
        this.showNotification('Essay created successfully', 'success');
        this.showSection('essays');
    }

    async updateEssay(essayData) {
        const response = await fetch(`/api/essays/${this.currentEssay._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(essayData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update essay');
        }

        const updatedEssay = await response.json();
        const index = this.essays.findIndex(e => e._id === updatedEssay._id);
        if (index !== -1) {
            this.essays[index] = updatedEssay;
        }
        
        this.renderEssaysList();
        this.showNotification('Essay updated successfully', 'success');
        this.showSection('essays');
    }

    async publishEssay() {
        if (!this.currentEssay) return;

        try {
            const response = await fetch(`/api/essays/${this.currentEssay._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    status: 'published',
                    publishDate: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to publish essay');
            }

            const updatedEssay = await response.json();
            const index = this.essays.findIndex(e => e._id === updatedEssay._id);
            if (index !== -1) {
                this.essays[index] = updatedEssay;
            }

            this.renderEssaysList();
            this.showNotification('Essay published successfully', 'success');
            this.showSection('essays');
        } catch (error) {
            console.error('Error publishing essay:', error);
            this.showNotification('Failed to publish essay', 'error');
        }
    }

    async deleteEssay(essayId) {
        if (!confirm('Are you sure you want to delete this essay?')) return;

        try {
            const response = await fetch(`/api/essays/${essayId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete essay');
            }

            this.essays = this.essays.filter(e => e._id !== essayId);
            this.renderEssaysList();
            this.showNotification('Essay deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting essay:', error);
            this.showNotification('Failed to delete essay', 'error');
        }
    }

    editEssay(essayId) {
        const essay = this.essays.find(e => e._id === essayId);
        if (essay) {
            this.showEssayForm(essay);
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show the target section
        const targetSection = document.querySelector(`#${sectionId}`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

// Initialize essays manager
let essaysManager;
document.addEventListener('DOMContentLoaded', () => {
    essaysManager = new EssaysManager();
}); 