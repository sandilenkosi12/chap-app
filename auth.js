// Authentication Module
class Auth {
    constructor() {
        this.initFirebase();
        this.initElements();
        this.initEventListeners();
        this.checkAuthState();
    }

    initFirebase() {
    // 🔥 YOUR FIREBASE CONFIG - WORKING!
    const firebaseConfig = {
        apiKey: "AIzaSyAA3G5DhAbBk61kdhICXIWb0HYkXJ03heU",
        authDomain: "chat-app-2026-f1d46.firebaseapp.com",
        projectId: "chat-app-2026-f1d46",
        storageBucket: "chat-app-2026-f1d46.firebasestorage.app",
        messagingSenderId: "609429790084",
        appId: "1:609429790084:web:19068afe0f704a042d11d1",
        measurementId: "G-HRNLDN033M"
    };
    
    firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth();
    this.db = firebase.firestore();
}

    initElements() {
        this.authScreen = document.getElementById('authScreen');
        this.chatScreen = document.getElementById('chatScreen');
        this.loginTab = document.getElementById('loginTab');
        this.registerTab = document.getElementById('registerTab');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    initEventListeners() {
        // Tab switching
        this.loginTab.addEventListener('click', () => this.switchTab('login'));
        this.registerTab.addEventListener('click', () => this.switchTab('register'));
        
        // Forms
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Logout
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    switchTab(tab) {
        if (tab === 'login') {
            this.loginTab.classList.add('active');
            this.registerTab.classList.remove('active');
            this.loginForm.classList.add('active');
            this.registerForm.classList.remove('active');
        } else {
            this.loginTab.classList.remove('active');
            this.registerTab.classList.add('active');
            this.loginForm.classList.remove('active');
            this.registerForm.classList.add('active');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            // Auth state change will handle navigation
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Create user profile in Firestore
            await this.db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                avatar: this.getInitials(name),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'online'
            });
            
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            // Auth state change will handle navigation
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    async handleLogout() {
        try {
            // Update user status
            if (this.auth.currentUser) {
                await this.db.collection('users').doc(this.auth.currentUser.uid).update({
                    status: 'offline',
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            await this.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    checkAuthState() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                // User is logged in
                this.authScreen.style.display = 'none';
                this.chatScreen.style.display = 'flex';
                this.updateUserInfo(user);
                
                // Initialize chat app
                if (window.chatApp) {
                    window.chatApp.init();
                }
            } else {
                // User is logged out
                this.authScreen.style.display = 'flex';
                this.chatScreen.style.display = 'none';
            }
        });
    }

    updateUserInfo(user) {
        document.getElementById('displayName').textContent = user.displayName || 'User';
        const initials = this.getInitials(user.displayName || 'User');
        document.getElementById('userInitials').textContent = initials;
        
        // Store user data globally
        window.currentUser = {
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            initials: initials
        };
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
}

// Initialize auth
const auth = new Auth();