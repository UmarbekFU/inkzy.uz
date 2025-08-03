const EssayService = {
    baseUrl: '/api/essays',
    token: localStorage.getItem('authToken'),

    async getAllEssays() {
        const response = await fetch(this.baseUrl);
        return response.json();
    },

    async getEssay(slug) {
        const response = await fetch(`${this.baseUrl}/${slug}`);
        return response.json();
    },

    async createEssay(essayData) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(essayData)
        });
        return response.json();
    },

    async updateEssay(id, essayData) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(essayData)
        });
        return response.json();
    }
}; 
