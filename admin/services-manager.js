class ServicesManager {
    constructor() {
        this.servicesData = {};
        this.currentService = null;
        this.init();
    }

    async init() {
        await this.loadServicesData();
        this.setupEventListeners();
        this.renderServicesList();
    }

    async loadServicesData() {
        try {
            const response = await fetch('/api/services');
            if (response.ok) {
                this.servicesData = await response.json();
            } else {
                // Load default data if API fails
                this.servicesData = this.getDefaultServicesData();
            }
        } catch (error) {
            console.error('Error loading services data:', error);
            this.servicesData = this.getDefaultServicesData();
        }
    }

    getDefaultServicesData() {
        return {
            header: {
                title: "[Page Title]",
                description: "[Page Description]"
            },
            services: {
                strategy: {
                    title: "[Service 1 Title]",
                    subtitle: "[Service 1 Subtitle]",
                    price: "[Service 1 Price]",
                    description: "[Service 1 Description]",
                    features: [
                        "[Service 1 Feature 1]",
                        "[Service 1 Feature 2]",
                        "[Service 1 Feature 3]",
                        "[Service 1 Feature 4]",
                        "[Service 1 Feature 5]"
                    ],
                    ctaText: "[Service 1 CTA Text]",
                    ctaLink: "mailto:umarbek@example.com?subject=Service 1 Inquiry",
                    secondaryCta: "[Service 1 Secondary CTA]"
                },
                audit: {
                    title: "[Service 2 Title]",
                    subtitle: "[Service 2 Subtitle]",
                    price: "[Service 2 Price]",
                    description: "[Service 2 Description]",
                    features: [
                        "[Service 2 Feature 1]",
                        "[Service 2 Feature 2]",
                        "[Service 2 Feature 3]",
                        "[Service 2 Feature 4]",
                        "[Service 2 Feature 5]",
                        "[Service 2 Feature 6]",
                        "[Service 2 Feature 7]"
                    ],
                    ctaText: "[Service 2 CTA Text]",
                    ctaLink: "mailto:umarbek@example.com?subject=Service 2 Inquiry",
                    secondaryCta: "[Service 2 Secondary CTA]"
                },
                growth: {
                    title: "[Service 3 Title]",
                    subtitle: "[Service 3 Subtitle]",
                    price: "[Service 3 Price]",
                    description: "[Service 3 Description]",
                    features: [
                        "[Service 3 Feature 1]",
                        "[Service 3 Feature 2]",
                        "[Service 3 Feature 3]",
                        "[Service 3 Feature 4]",
                        "[Service 3 Feature 5]",
                        "[Service 3 Feature 6]",
                        "[Service 3 Feature 7]",
                        "[Service 3 Feature 8]"
                    ],
                    ctaText: "[Service 3 CTA Text]",
                    ctaLink: "mailto:umarbek@example.com?subject=Service 3 Inquiry",
                    secondaryCta: "[Service 3 Secondary CTA]"
                },
                support: {
                    title: "[Service 4 Title]",
                    subtitle: "[Service 4 Subtitle]",
                    price: "[Service 4 Price]",
                    description: "[Service 4 Description]",
                    features: [
                        "[Service 4 Feature 1]",
                        "[Service 4 Feature 2]",
                        "[Service 4 Feature 3]",
                        "[Service 4 Feature 4]",
                        "[Service 4 Feature 5]",
                        "[Service 4 Feature 6]"
                    ],
                    ctaText: "[Service 4 CTA Text]",
                    ctaLink: "mailto:umarbek@example.com?subject=Service 4 Inquiry",
                    secondaryCta: "[Service 4 Secondary CTA]"
                }
            },
            info: {
                howItWorks: {
                    title: "[How It Works Title]",
                    steps: [
                        "[Step 1]",
                        "[Step 2]",
                        "[Step 3]",
                        "[Step 4]"
                    ]
                },
                whatIDontDo: {
                    title: "[What I Don't Do Title]",
                    items: [
                        "[Item 1]",
                        "[Item 2]",
                        "[Item 3]",
                        "[Item 4]"
                    ]
                }
            },
            contact: {
                title: "[Contact Title]",
                description: "[Contact Description]",
                email: "[Contact Email]"
            }
        };
    }

    setupEventListeners() {
        // Service selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.service-item')) {
                const serviceId = e.target.closest('.service-item').dataset.serviceId;
                this.selectService(serviceId);
            }
        });

        // Save button
        const saveBtn = document.getElementById('saveServicesBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveServices());
        }

        // Add feature button
        const addFeatureBtn = document.getElementById('addFeatureBtn');
        if (addFeatureBtn) {
            addFeatureBtn.addEventListener('click', () => this.addFeature());
        }

        // Remove feature buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-feature')) {
                const featureItem = e.target.closest('.feature-item');
                featureItem.remove();
            }
        });

        // Header section buttons
        const saveHeaderBtn = document.getElementById('saveHeaderBtn');
        if (saveHeaderBtn) {
            saveHeaderBtn.addEventListener('click', () => this.saveHeader());
        }

        // Info section buttons
        const saveInfoBtn = document.getElementById('saveInfoBtn');
        if (saveInfoBtn) {
            saveInfoBtn.addEventListener('click', () => this.saveInfo());
        }

        // Contact section buttons
        const saveContactBtn = document.getElementById('saveContactBtn');
        if (saveContactBtn) {
            saveContactBtn.addEventListener('click', () => this.saveContact());
        }
    }

    renderServicesList() {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) return;

        servicesList.innerHTML = '';
        
        Object.entries(this.servicesData.services).forEach(([id, service]) => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'service-item';
            serviceItem.dataset.serviceId = id;
            serviceItem.innerHTML = `
                <div class="service-item-header">
                    <h3>${service.title}</h3>
                    <span class="service-price">${service.price}</span>
                </div>
                <p class="service-subtitle">${service.subtitle}</p>
            `;
            servicesList.appendChild(serviceItem);
        });

        // Select first service by default
        if (Object.keys(this.servicesData.services).length > 0) {
            this.selectService(Object.keys(this.servicesData.services)[0]);
        }
    }

    selectService(serviceId) {
        this.currentService = serviceId;
        
        // Update active state
        document.querySelectorAll('.service-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-service-id="${serviceId}"]`).classList.add('active');

        // Populate form
        this.populateServiceForm(serviceId);
    }

    populateServiceForm(serviceId) {
        const service = this.servicesData.services[serviceId];
        if (!service) return;

        // Basic fields
        document.getElementById('serviceTitle').value = service.title;
        document.getElementById('serviceSubtitle').value = service.subtitle;
        document.getElementById('servicePrice').value = service.price;
        document.getElementById('serviceDescription').value = service.description;
        document.getElementById('serviceCtaText').value = service.ctaText;
        document.getElementById('serviceCtaLink').value = service.ctaLink;
        document.getElementById('serviceSecondaryCta').value = service.secondaryCta;

        // Features
        const featuresContainer = document.getElementById('featuresContainer');
        featuresContainer.innerHTML = '';
        
        service.features.forEach((feature, index) => {
            this.addFeatureInput(feature, index);
        });
    }

    addFeature() {
        const featuresContainer = document.getElementById('featuresContainer');
        const featureCount = featuresContainer.children.length;
        this.addFeatureInput('', featureCount);
    }

    addFeatureInput(value = '', index = 0) {
        const featuresContainer = document.getElementById('featuresContainer');
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        featureItem.innerHTML = `
            <input type="text" class="feature-input" value="${value}" placeholder="Enter feature">
            <button type="button" class="remove-feature">×</button>
        `;
        featuresContainer.appendChild(featureItem);
    }

    async saveServices() {
        if (!this.currentService) return;

        const serviceData = {
            title: document.getElementById('serviceTitle').value,
            subtitle: document.getElementById('serviceSubtitle').value,
            price: document.getElementById('servicePrice').value,
            description: document.getElementById('serviceDescription').value,
            ctaText: document.getElementById('serviceCtaText').value,
            ctaLink: document.getElementById('serviceCtaLink').value,
            secondaryCta: document.getElementById('serviceSecondaryCta').value,
            features: Array.from(document.querySelectorAll('.feature-input')).map(input => input.value).filter(f => f.trim())
        };

        this.servicesData.services[this.currentService] = serviceData;

        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.getElementById('csrf-token').content
                },
                body: JSON.stringify(this.servicesData)
            });

            if (response.ok) {
                this.showNotification('Services saved successfully!', 'success');
            } else {
                throw new Error('Failed to save services');
            }
        } catch (error) {
            console.error('Error saving services:', error);
            this.showNotification('Error saving services. Please try again.', 'error');
        }
    }

    async saveHeader() {
        const headerData = {
            title: document.getElementById('pageTitle').value,
            description: document.getElementById('pageDescription').value
        };

        this.servicesData.header = headerData;

        try {
            const response = await fetch('/api/services/header', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.getElementById('csrf-token').content
                },
                body: JSON.stringify(headerData)
            });

            if (response.ok) {
                this.showNotification('Header saved successfully!', 'success');
            } else {
                throw new Error('Failed to save header');
            }
        } catch (error) {
            console.error('Error saving header:', error);
            this.showNotification('Error saving header. Please try again.', 'error');
        }
    }

    async saveInfo() {
        const infoData = {
            howItWorks: {
                title: document.getElementById('howItWorksTitle').value,
                steps: [
                    document.getElementById('step1').value,
                    document.getElementById('step2').value,
                    document.getElementById('step3').value,
                    document.getElementById('step4').value
                ]
            },
            whatIDontDo: {
                title: document.getElementById('whatIDontDoTitle').value,
                items: [
                    document.getElementById('item1').value,
                    document.getElementById('item2').value,
                    document.getElementById('item3').value,
                    document.getElementById('item4').value
                ]
            }
        };

        this.servicesData.info = infoData;

        try {
            const response = await fetch('/api/services/info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.getElementById('csrf-token').content
                },
                body: JSON.stringify(infoData)
            });

            if (response.ok) {
                this.showNotification('Info section saved successfully!', 'success');
            } else {
                throw new Error('Failed to save info section');
            }
        } catch (error) {
            console.error('Error saving info section:', error);
            this.showNotification('Error saving info section. Please try again.', 'error');
        }
    }

    async saveContact() {
        const contactData = {
            title: document.getElementById('contactTitle').value,
            description: document.getElementById('contactDescription').value,
            email: document.getElementById('contactEmail').value
        };

        this.servicesData.contact = contactData;

        try {
            const response = await fetch('/api/services/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.getElementById('csrf-token').content
                },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                this.showNotification('Contact section saved successfully!', 'success');
            } else {
                throw new Error('Failed to save contact section');
            }
        } catch (error) {
            console.error('Error saving contact section:', error);
            this.showNotification('Error saving contact section. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Method to update the live services page
    async updateLivePage() {
        try {
            const response = await fetch('/api/services/update-live', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.getElementById('csrf-token').content
                },
                body: JSON.stringify(this.servicesData)
            });

            if (response.ok) {
                this.showNotification('Live page updated successfully!', 'success');
            } else {
                throw new Error('Failed to update live page');
            }
        } catch (error) {
            console.error('Error updating live page:', error);
            this.showNotification('Error updating live page. Please try again.', 'error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ServicesManager();
}); 