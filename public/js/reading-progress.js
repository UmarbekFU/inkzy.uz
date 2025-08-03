class ReadingProgress {
    constructor() {
        this.progressBar = null;
        this.article = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        this.createProgressBar();
        this.attachScrollListener();
        this.attachIntersectionObserver();
    }

    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'reading-progress';
        this.progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">0%</div>
        `;
        
        document.body.appendChild(this.progressBar);
    }

    attachScrollListener() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateProgress();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    attachIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.article = entry.target;
                    this.showProgress();
                } else {
                    this.hideProgress();
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe all article elements
        document.querySelectorAll('article, .essay-content, .post-content').forEach(article => {
            observer.observe(article);
        });
    }

    updateProgress() {
        if (!this.article || !this.isVisible) return;

        const articleRect = this.article.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the article is visible
        const articleTop = articleRect.top;
        const articleHeight = articleRect.height;
        
        let progress = 0;
        
        if (articleTop <= 0) {
            // Article is scrolled past the top
            const scrolledHeight = Math.abs(articleTop);
            progress = Math.min((scrolledHeight / (articleHeight - windowHeight)) * 100, 100);
        } else if (articleTop < windowHeight) {
            // Article is partially visible at the top
            progress = ((windowHeight - articleTop) / windowHeight) * 100;
        }

        this.setProgress(progress);
    }

    setProgress(percentage) {
        const fill = this.progressBar.querySelector('.progress-fill');
        const text = this.progressBar.querySelector('.progress-text');
        
        fill.style.width = `${percentage}%`;
        text.textContent = `${Math.round(percentage)}%`;
        
        // Update color based on progress
        if (percentage > 80) {
            this.progressBar.classList.add('progress-complete');
        } else {
            this.progressBar.classList.remove('progress-complete');
        }
    }

    showProgress() {
        if (!this.isVisible) {
            this.progressBar.classList.add('visible');
            this.isVisible = true;
        }
    }

    hideProgress() {
        if (this.isVisible) {
            this.progressBar.classList.remove('visible');
            this.isVisible = false;
        }
    }
}

// Initialize reading progress
document.addEventListener('DOMContentLoaded', () => {
    new ReadingProgress();
});

// Add CSS for reading progress
const style = document.createElement('style');
style.textContent = `
    .reading-progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border-color, #e5e5e5);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        gap: 1rem;
    }

    .reading-progress.visible {
        transform: translateY(0);
    }

    .progress-bar {
        flex: 1;
        height: 4px;
        background: rgba(0, 122, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: var(--accent-color, #007aff);
        width: 0%;
        transition: width 0.1s ease;
    }

    .progress-complete .progress-fill {
        background: var(--success-color, #34c759);
    }

    .progress-text {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-color, #1d1d1f);
        min-width: 3rem;
        text-align: right;
    }

    @media (prefers-color-scheme: dark) {
        .reading-progress {
            background: rgba(28, 28, 30, 0.95);
            border-bottom-color: var(--border-color, #38383a);
        }
    }

    @media (max-width: 768px) {
        .reading-progress {
            padding: 0.25rem 0.75rem;
        }
        
        .progress-text {
            font-size: 0.625rem;
            min-width: 2.5rem;
        }
    }
`;

document.head.appendChild(style); 