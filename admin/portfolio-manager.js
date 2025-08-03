// Portfolio Manager for Admin Panel
class PortfolioManager {
    constructor() {
        this.currentPassword = 'portfolio2024';
        this.portfolioData = [];
        this.init();
    }

    init() {
        this.loadPortfolioData();
        this.setupEventListeners();
        this.renderInterface();
    }

    setupEventListeners() {
        // Password management
        const passwordForm = document.getElementById('portfolioPasswordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePassword();
            });
        }

        // Portfolio item management
        const addItemBtn = document.getElementById('addPortfolioItem');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.showAddItemModal();
            });
        }

        // Save all changes
        const saveAllBtn = document.getElementById('savePortfolioChanges');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => {
                this.saveAllChanges();
            });
        }
    }

    async loadPortfolioData() {
        try {
            const response = await fetch('/api/portfolio/admin/data', {
                headers: {
                    'Authorization': 'Bearer admin-token' // In a real implementation, use proper auth
                }
            });
            const result = await response.json();
            
            if (result.success) {
                this.portfolioData = result.data.portfolioData;
                this.currentPassword = result.data.password;
            } else {
                console.error('Error loading portfolio data:', result.message);
                this.showNotification('Error loading portfolio data', 'error');
            }
            
            this.renderPortfolioList();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.showNotification('Error loading portfolio data', 'error');
        }
    }

    renderInterface() {
        const container = document.getElementById('portfolioManagerContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="portfolio-manager">
                <div class="admin-section">
                <h2>Portfolio Management</h2>
                
                <!-- Password Management -->
                <div class="admin-card">
                    <h3>Access Password</h3>
                    <form id="portfolioPasswordForm" class="admin-form">
                        <div class="form-group">
                            <label for="portfolioPassword">Current Password</label>
                            <input type="text" id="portfolioPassword" value="${this.currentPassword}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="newPortfolioPassword">New Password</label>
                            <input type="text" id="newPortfolioPassword" placeholder="Enter new password">
                        </div>
                        <button type="submit" class="btn btn-primary">Update Password</button>
                    </form>
                </div>

                <!-- Portfolio Items -->
                <div class="admin-card">
                    <div class="card-header">
                        <h3>Portfolio Items</h3>
                        <button id="addPortfolioItem" class="btn btn-secondary">Add New Item</button>
                    </div>
                    <div id="portfolioItemsList" class="items-list">
                        <!-- Portfolio items will be rendered here -->
                    </div>
                </div>

                <!-- Save Changes -->
                <div class="admin-card">
                    <button id="savePortfolioChanges" class="btn btn-success">Save All Changes</button>
                </div>
            </div>

            <!-- Add/Edit Item Modal -->
            <div id="portfolioItemModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">Add Portfolio Item</h3>
                        <span class="close">&times;</span>
                    </div>
                    <form id="portfolioItemForm" class="admin-form">
                        <div class="form-group">
                            <label for="itemTitle">Title</label>
                            <input type="text" id="itemTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="itemDescription">Description</label>
                            <textarea id="itemDescription" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="itemImage">Image (Emoji)</label>
                            <input type="text" id="itemImage" placeholder="📚" required>
                        </div>
                        <div class="form-group">
                            <label for="itemTech">Technologies (comma-separated)</label>
                            <input type="text" id="itemTech" placeholder="HTML, CSS, JavaScript" required>
                        </div>
                        <div class="form-group">
                            <label for="itemLink">Link</label>
                            <input type="text" id="itemLink" placeholder="project.html">
                        </div>
                        <div class="form-group">
                            <label for="itemStatus">Status</label>
                            <select id="itemStatus" required>
                                <option value="completed">Completed</option>
                                <option value="in-progress">In Progress</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Save Item</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closeModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderPortfolioList() {
        const container = document.getElementById('portfolioItemsList');
        if (!container) return;

        container.innerHTML = this.portfolioData.map((item, index) => `
            <div class="item-card" data-id="${item.id}">
                <div class="item-header">
                    <div class="item-image">${item.image}</div>
                    <div class="item-info">
                        <h4>${item.title}</h4>
                        <p>${item.description.substring(0, 100)}...</p>
                        <div class="item-meta">
                            <span class="status status-${item.status}">${item.status}</span>
                            <span class="tech-count">${item.tech.length} technologies</span>
                        </div>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="portfolioManager.editItem(${item.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="portfolioManager.deleteItem(${item.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async updatePassword() {
        const newPassword = document.getElementById('newPortfolioPassword').value.trim();
        
        if (!newPassword) {
            this.showNotification('Please enter a new password', 'error');
            return;
        }

        try {
            const response = await fetch('/api/portfolio/admin/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin-token' // In a real implementation, use proper auth
                },
                body: JSON.stringify({ password: newPassword })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentPassword = newPassword;
                document.getElementById('portfolioPassword').value = newPassword;
                document.getElementById('newPortfolioPassword').value = '';
                this.showNotification('Password updated successfully', 'success');
            } else {
                this.showNotification(result.message || 'Error updating password', 'error');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            this.showNotification('Error updating password', 'error');
        }
    }

    showAddItemModal() {
        const modal = document.getElementById('portfolioItemModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('portfolioItemForm');
        
        modalTitle.textContent = 'Add Portfolio Item';
        form.reset();
        form.dataset.mode = 'add';
        
        modal.style.display = 'block';
    }

    editItem(itemId) {
        const item = this.portfolioData.find(item => item.id === itemId);
        if (!item) return;

        const modal = document.getElementById('portfolioItemModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('portfolioItemForm');
        
        modalTitle.textContent = 'Edit Portfolio Item';
        form.dataset.mode = 'edit';
        form.dataset.itemId = itemId;
        
        // Populate form fields
        document.getElementById('itemTitle').value = item.title;
        document.getElementById('itemDescription').value = item.description;
        document.getElementById('itemImage').value = item.image;
        document.getElementById('itemTech').value = item.tech.join(', ');
        document.getElementById('itemLink').value = item.link;
        document.getElementById('itemStatus').value = item.status;
        
        modal.style.display = 'block';
    }

    deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this portfolio item?')) {
            this.portfolioData = this.portfolioData.filter(item => item.id !== itemId);
            this.renderPortfolioList();
            this.showNotification('Portfolio item deleted', 'success');
        }
    }

    saveItem(formData) {
        const mode = formData.dataset.mode;
        const itemData = {
            title: document.getElementById('itemTitle').value,
            description: document.getElementById('itemDescription').value,
            image: document.getElementById('itemImage').value,
            tech: document.getElementById('itemTech').value.split(',').map(tech => tech.trim()),
            link: document.getElementById('itemLink').value,
            status: document.getElementById('itemStatus').value
        };

        if (mode === 'add') {
            itemData.id = Date.now(); // Simple ID generation
            this.portfolioData.push(itemData);
        } else {
            const itemId = parseInt(formData.dataset.itemId);
            const index = this.portfolioData.findIndex(item => item.id === itemId);
            if (index !== -1) {
                itemData.id = itemId;
                this.portfolioData[index] = itemData;
            }
        }

        this.renderPortfolioList();
        this.closeModal();
        this.showNotification(`Portfolio item ${mode === 'add' ? 'added' : 'updated'} successfully`, 'success');
    }

    closeModal() {
        const modal = document.getElementById('portfolioItemModal');
        modal.style.display = 'none';
    }

    async saveAllChanges() {
        try {
            const response = await fetch('/api/portfolio/admin/data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin-token' // In a real implementation, use proper auth
                },
                body: JSON.stringify({ portfolioData: this.portfolioData })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('All changes saved successfully', 'success');
            } else {
                this.showNotification(result.message || 'Error saving changes', 'error');
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            this.showNotification('Error saving changes', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Get current data for external access
    getCurrentData() {
        return {
            password: this.currentPassword,
            portfolioData: this.portfolioData
        };
    }
}

// Initialize portfolio manager
let portfolioManager;

document.addEventListener('DOMContentLoaded', () => {
    portfolioManager = new PortfolioManager();
    
    // Setup modal close functionality
    const modal = document.getElementById('portfolioItemModal');
    const closeBtn = modal?.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            portfolioManager.closeModal();
        });
    }
    
    // Setup form submission
    const itemForm = document.getElementById('portfolioItemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            portfolioManager.saveItem(itemForm);
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            portfolioManager.closeModal();
        }
    });
});

// Expose for global access
window.portfolioManager = portfolioManager; 