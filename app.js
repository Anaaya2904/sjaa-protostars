/* =========================================
   EASY EDIT SECTION - ADD NEWSLETTERS HERE
   ========================================= */
const newsletters = [
    {
        title: "Summer 2026 Edition",
        date: "August 2026",
        description: "Read about our recent trip to Lick Observatory and deep-sky imaging tips.",
        link: "https://docs.google.com/document/d/YOUR_LINK_HERE"
    },
    {
        title: "Spring 2026 Edition",
        date: "April 2026",
        description: "Introduction to the new Protostars Officers and upcoming Star Parties.",
        link: "https://docs.google.com/document/d/YOUR_LINK_HERE"
    }
    // TO ADD A NEW ONE, COPY THE BLOCK ABOVE AND PASTE IT HERE, SEPARATED BY A COMMA!
];

/* =========================================
   WEBSITE LOGIC (DO NOT EDIT BELOW THIS LINE)
   ========================================= */

// 1. Navigation Logic (Switching between Home, Newsletters, Events)
function showPage(pageId) {
    // Hide all sections
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Show the requested section
    document.getElementById(pageId).classList.add('active');
}

// 2. Generate Newsletter Cards automatically
function loadNewsletters() {
    const container = document.getElementById('newsletter-container');
    
    newsletters.forEach(news => {
        const card = document.createElement('div');
        card.className = 'card newsletter-card';
        card.innerHTML = `
            <h3>${news.title}</h3>
            <p style="font-size: 0.9em; color: #9ca3af; margin-bottom: 10px;">${news.date}</p>
            <p>${news.description}</p>
            <a href="${news.link}" target="_blank">Read Newsletter</a>
        `;
        container.appendChild(card);
    });
}

// Run the load function when the page starts
window.onload = loadNewsletters;
