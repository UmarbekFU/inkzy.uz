const marked = require('marked');

/**
 * Generate table of contents from markdown content
 * @param {string} markdown - Markdown content
 * @returns {Array} Array of TOC items with id, text, level
 */
function generateTOC(markdown) {
    const tokens = marked.lexer(markdown);
    const toc = [];
    
    tokens.forEach(token => {
        if (token.type === 'heading' && token.depth >= 2 && token.depth <= 4) {
            const id = generateHeadingId(token.text);
            toc.push({
                id,
                text: token.text,
                level: token.depth,
                children: []
            });
        }
    });
    
    return buildTOCHierarchy(toc);
}

/**
 * Generate a URL-friendly ID for a heading
 * @param {string} text - Heading text
 * @returns {string} URL-friendly ID
 */
function generateHeadingId(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

/**
 * Build hierarchical TOC structure
 * @param {Array} toc - Flat TOC array
 * @returns {Array} Hierarchical TOC
 */
function buildTOCHierarchy(toc) {
    const result = [];
    const stack = [];
    
    toc.forEach(item => {
        while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
            stack.pop();
        }
        
        if (stack.length === 0) {
            result.push(item);
        } else {
            stack[stack.length - 1].children.push(item);
        }
        
        stack.push(item);
    });
    
    return result;
}

/**
 * Add IDs to markdown headings
 * @param {string} markdown - Markdown content
 * @returns {string} Markdown with heading IDs
 */
function addHeadingIds(markdown) {
    const lines = markdown.split('\n');
    const result = [];
    
    lines.forEach(line => {
        const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = headingMatch[2];
            const id = generateHeadingId(text);
            result.push(`${headingMatch[1]} <span id="${id}">${text}</span>`);
        } else {
            result.push(line);
        }
    });
    
    return result.join('\n');
}

/**
 * Render TOC as HTML
 * @param {Array} toc - TOC array
 * @returns {string} HTML TOC
 */
function renderTOC(toc) {
    if (toc.length === 0) return '';
    
    const renderItem = (item) => {
        const children = item.children.length > 0 
            ? `<ul>${item.children.map(renderItem).join('')}</ul>` 
            : '';
        
        return `
            <li>
                <a href="#${item.id}" class="toc-link toc-level-${item.level}">
                    ${item.text}
                </a>
                ${children}
            </li>
        `;
    };
    
    return `
        <nav class="table-of-contents" aria-label="Table of contents">
            <h2 class="toc-title">Table of Contents</h2>
            <ul class="toc-list">
                ${toc.map(renderItem).join('')}
            </ul>
        </nav>
    `;
}

module.exports = {
    generateTOC,
    addHeadingIds,
    renderTOC,
    generateHeadingId
}; 