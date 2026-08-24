/* =========================================
   FIREBASE CONFIGURATION
   ========================================= */
const firebaseConfig = {
    apiKey: "AIzaSyAI3-sZZQiUJKngFppYh0_3q2VKebU7_hg",
    authDomain: "sjaa-protostars.firebaseapp.com",
    projectId: "sjaa-protostars",
    storageBucket: "sjaa-protostars.firebasestorage.app",
    messagingSenderId: "665392508121",
    appId: "1:665392508121:web:d846223498726b7632e2c8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* =========================================
   HARDCODED DATA
   ========================================= */
const newsletters = [
    {
        title: "Beyond the Light Curve: Hunting Exoplanets",
        date: "August 13, 2026 | By Anaaya Mashru",
        description: "Read about Anaaya's journey using NASA's open-source archives and the transit method to explore deep space and study exoplanets like the habitable zone candidate TOI-4633 c.",
        // 👇 PASTE YOUR GOOGLE DRIVE LINK RIGHT HERE 👇
        link: "file:///Users/anaayamashru/Downloads/Beyond_the_Light_Curve%20(1).pdf"
    }
];

let currentEditingOfficerId = null; 
let isLoggedIn = false;
let isSeeding = false; // Prevents the database from glitching into an infinite loop

/* =========================================
   ANTI-GLITCH FIXES (Stops the page jumping)
   ========================================= */
// This intercepts the navigation clicks so the page doesn't forcefully jump to the top
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === '#') {
                e.preventDefault(); 
            }
        });
    });
});

/* =========================================
   AUTHENTICATION & SECURITY
   ========================================= */
auth.onAuthStateChanged((user) => {
    if (user) {
        isLoggedIn = true;
        document.getElementById('logout-btn').style.display = "block";
        document.getElementById('admin-photo-adder').style.display = "block";
        loadGallery(); 
    } else {
        isLoggedIn = false;
        document.getElementById('logout-btn').style.display = "none";
        document.getElementById('admin-photo-adder').style.display = "none";
        document.getElementById('admin-edit-form').style.display = "none";
        loadGallery();
    }
});

function openLoginModal() { document.getElementById('login-modal').style.display = "flex"; }
function closeLoginModal() { document.getElementById('login-modal').style.display = "none"; }

function loginUser() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            closeLoginModal();
            alert("Successfully logged in!");
        })
        .catch(error => {
            document.getElementById('login-error').innerText = "Error: " + error.message;
        });
}

function logout() {
    auth.signOut().then(() => alert("Logged out successfully."));
}

/* =========================================
   WEBSITE LOGIC (Built to stop flickering)
   ========================================= */
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth, non-glitchy scrolling
}

function loadNewsletters() {
    const container = document.getElementById('newsletter-container');
    let htmlString = ""; // Builds everything off-screen first to stop flickering
    newsletters.forEach(news => {
        htmlString += `
            <div class="card newsletter-card">
                <h3>${news.title}</h3>
                <p style="font-size: 0.9em; color: #9ca3af; margin-bottom: 10px;">${news.date}</p>
                <p>${news.description}</p>
                <a href="${news.link}" target="_blank">Read Newsletter</a>
            </div>`;
    });
    container.innerHTML = htmlString;
}

// Fetch Officers from Firebase
function loadOfficers() {
    db.collection('officers').orderBy('order').onSnapshot(snapshot => {
        const container = document.getElementById('officers-container');
        
        if(snapshot.empty) {
            if(!isSeeding) {
                isSeeding = true;
                seedDatabase(); 
            }
            return;
        }

        let htmlString = ""; // Builds everything off-screen first
        snapshot.forEach(doc => {
            const officer = doc.data();
            htmlString += `
                <div class="card officer-card" onclick="openBioModal('${doc.id}', '${officer.name}', '${officer.role}', '${(officer.bio || "").replace(/'/g, "\\'")}', '${officer.image}')">
                    <h3>${officer.name}</h3>
                    <p>${officer.role}</p>
                </div>`;
        });
        container.innerHTML = htmlString; // Paints it to the screen all at once
    }, error => {
        console.error("Error fetching officers:", error);
        document.getElementById('officers-container').innerHTML = "<p style='color: #ef4444;'>Could not load officers. Ensure database rules are set.</p>";
    });
}

// Open Bio Modal & Admin Tools
function openBioModal(id, name, role, bio, image) {
    currentEditingOfficerId = id;
    document.getElementById('modal-name').innerText = name;
    document.getElementById('modal-role').innerText = role;
    document.getElementById('modal-bio').innerText = bio || "Bio coming soon...";
    
    const imgElement = document.getElementById('modal-img');
    if(image && image !== "") {
        imgElement.src = image;
        imgElement.style.display = "block";
    } else {
        imgElement.style.display = "none";
    }

    if(isLoggedIn) {
        document.getElementById('admin-edit-form').style.display = "block";
        document.getElementById('edit-img').value = image || "";
        document.getElementById('edit-bio-text').value = bio || "";
    }

    document.getElementById('bio-modal').style.display = "flex";
}

function closeModal() {
    document.getElementById('bio-modal').style.display = "none";
}

// Admin: Save Officer Bio
function saveOfficerUpdate() {
    if(!isLoggedIn) return;
    const newImg = document.getElementById('edit-img').value;
    const newBio = document.getElementById('edit-bio-text').value;

    db.collection('officers').doc(currentEditingOfficerId).update({
        image: newImg,
        bio: newBio
    }).then(() => {
        alert("Bio updated successfully!");
        closeModal();
    }).catch(err => alert("Error saving: " + err.message));
}

// Fetch Gallery from Firebase
function loadGallery() {
    db.collection('gallery').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        const container = document.getElementById('gallery-container');
        
        if(snapshot.empty) {
            container.innerHTML = "<p style='color: #9ca3af;'>No photos yet.</p>";
            return;
        }

        let htmlString = ""; // Builds everything off-screen first
        snapshot.forEach(doc => {
            let deleteBtn = isLoggedIn ? `<button class="delete-photo-btn" onclick="deletePhoto('${doc.id}')">Delete Photo</button>` : "";
            htmlString += `
                <div>
                    <img src="${doc.data().url}" alt="SJAA Event">
                    ${deleteBtn}
                </div>`;
        });
        container.innerHTML = htmlString;
    });
}

// Admin: Add Photo
function addGalleryPhoto() {
    const url = document.getElementById('new-photo-url').value;
    if(!url) return alert("Please enter a link!");
    
    db.collection('gallery').add({
        url: url,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('new-photo-url').value = ""; 
    }).catch(err => alert("Error: " + err.message));
}

// Admin: Delete Photo
function deletePhoto(id) {
    if(confirm("Are you sure you want to delete this photo?")) {
        db.collection('gallery').doc(id).delete();
    }
}

// Initial Database Setup (Bundled save)
function seedDatabase() {
    const batch = db.batch();
    const initialOfficers = [
        { id: "p1", order: 1, name: "Vipanchi Rawat", role: "President", image: "", bio: "" },
        { id: "p2", order: 2, name: "Creighton Voon", role: "Co-VP", image: "", bio: "" },
        { id: "p3", order: 3, name: "Anaaya Mashru", role: "Co-VP", image: "", bio: "" },
        { id: "p4", order: 4, name: "Lucy Lai", role: "Activities Commissioner", image: "", bio: "" },
        { id: "p5", order: 5, name: "Valeriya Tomkiv", role: "Outreach Coordinator", image: "", bio: "" },
        { id: "p6", order: 6, name: "Neha Meher", role: "Co-Director of Research", image: "", bio: "" },
        { id: "p7", order: 7, name: "Isabelle Niu", role: "Co-Director of Research", image: "", bio: "" }
    ];
    
    initialOfficers.forEach(off => {
        const docRef = db.collection('officers').doc(off.id);
        batch.set(docRef, off);
    });

    batch.commit().then(() => {
        console.log("All officers saved securely!");
        isSeeding = false;
    });
}

// Boot up
window.onload = () => {
    loadNewsletters();
    loadOfficers();
    loadGallery();
};
