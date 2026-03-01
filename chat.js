// Chat Module
class Chat {
    constructor() {
        this.db = firebase.firestore();
        this.currentRoom = 'general';
        this.typingTimeout = null;
        this.currentUser = null;
        this.messageListener = null;
        this.usersListener = null;
    }

    init() {
        this.currentUser = window.currentUser;
        this.initElements();
        this.initEventListeners();
        this.loadMessages();
        this.loadUsers();
        this.setupTypingListener();
    }

    initElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.roomsList = document.querySelectorAll('.room-item');
        this.currentRoomEl = document.getElementById('currentRoom');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.emojiBtn = document.getElementById('emojiBtn');
    }

    initEventListeners() {
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Typing indicator
        this.messageInput.addEventListener('input', () => this.handleTyping());
        
        // Room switching
        this.roomsList.forEach(room => {
            room.addEventListener('click', () => this.switchRoom(room.dataset.room));
        });
        
        // Emoji picker
        this.emojiBtn.addEventListener('click', () => this.toggleEmojiPicker());
    }

    async loadMessages() {
        // Clear existing listener
        if (this.messageListener) {
            this.messageListener();
        }
        
        // Listen for new messages in real-time
        this.messageListener = this.db.collection('messages')
            .where('room', '==', this.currentRoom)
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        this.displayMessage(change.doc.data(), change.doc.id);
                    }
                });
                this.scrollToBottom();
            }, (error) => {
                console.error('Error loading messages:', error);
            });
    }

    loadUsers() {
        // Listen for online users
        this.usersListener = this.db.collection('users')
            .onSnapshot((snapshot) => {
                const usersList = document.getElementById('usersList');
                const onlineCount = document.getElementById('onlineCount');
                let online = 0;
                let html = '';
                
                snapshot.forEach((doc) => {
                    const user = doc.data();
                    if (user.status === 'online') {
                        online++;
                        html += `
                            <div class="user-item">
                                <div class="user-avatar">${user.avatar || '👤'}</div>
                                <div class="user-name">${user.name}</div>
                                <div class="user-status"><i class="fas fa-circle"></i></div>
                            </div>
                        `;
                    }
                });
                
                usersList.innerHTML = html;
                onlineCount.textContent = online;
            });
    }

    displayMessage(message, messageId) {
        const isOutgoing = message.userId === this.currentUser.uid;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;
        messageEl.dataset.id = messageId;
        
        const time = message.timestamp ? 
            moment(message.timestamp.toDate()).format('HH:mm') : 
            moment().format('HH:mm');
        
        const senderName = message.userName || 'Unknown';
        const senderInitial = (message.userName || '?')[0].toUpperCase();
        
        messageEl.innerHTML = `
            ${!isOutgoing ? `<div class="message-avatar">${senderInitial}</div>` : ''}
            <div class="message-content">
                ${!isOutgoing ? `<div class="message-sender">${senderName}</div>` : ''}
                <div class="message-text">${this.escapeHtml(message.text)}</div>
                <div class="message-time">${time}</div>
            </div>
            ${isOutgoing ? `<div class="message-avatar">${this.currentUser.initials}</div>` : ''}
        `;
        
        this.messagesContainer.appendChild(messageEl);
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;
        
        try {
            await this.db.collection('messages').add({
                text: text,
                room: this.currentRoom,
                userId: this.currentUser.uid,
                userName: this.currentUser.name,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.messageInput.value = '';
            this.stopTyping();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    }

    handleTyping() {
        if (this.messageInput.value.trim()) {
            this.startTyping();
        } else {
            this.stopTyping();
        }
    }

    startTyping() {
        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Set typing status in database
        this.db.collection('typing').doc(this.currentRoom).set({
            [`user_${this.currentUser.uid}`]: true
        }, { merge: true });
        
        // Auto-stop typing after 2 seconds
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 2000);
    }

    stopTyping() {
        this.db.collection('typing').doc(this.currentRoom).update({
            [`user_${this.currentUser.uid}`]: firebase.firestore.FieldValue.delete()
        }).catch(() => {});
    }

    setupTypingListener() {
        this.db.collection('typing').doc(this.currentRoom)
            .onSnapshot((doc) => {
                const data = doc.data() || {};
                const typingUsers = [];
                
                Object.keys(data).forEach(key => {
                    if (key.startsWith('user_') && data[key]) {
                        typingUsers.push(key.replace('user_', ''));
                    }
                });
                
                if (typingUsers.length > 0 && !typingUsers.includes(this.currentUser.uid)) {
                    this.typingIndicator.textContent = 'Someone is typing...';
                } else {
                    this.typingIndicator.textContent = '';
                }
            });
    }

    switchRoom(room) {
        this.currentRoom = room;
        
        // Update UI
        this.roomsList.forEach(r => r.classList.remove('active'));
        document.querySelector(`[data-room="${room}"]`).classList.add('active');
        this.currentRoomEl.textContent = `# ${room}`;
        
        // Clear messages
        this.messagesContainer.innerHTML = '';
        
        // Load new room messages
        this.loadMessages();
        
        // Update typing listener
        this.setupTypingListener();
    }

    toggleEmojiPicker() {
        // Simple emoji picker implementation
        const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '✨', '💯'];
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = emojis.map(e => `<span class="emoji">${e}</span>`).join('');
        
        picker.querySelectorAll('.emoji').forEach(emoji => {
            emoji.addEventListener('click', () => {
                this.messageInput.value += emoji.textContent;
                this.messageInput.focus();
                picker.remove();
            });
        });
        
        // Remove existing picker
        const existing = document.querySelector('.emoji-picker');
        if (existing) existing.remove();
        
        document.body.appendChild(picker);
        
        // Position picker
        const rect = this.emojiBtn.getBoundingClientRect();
        picker.style.position = 'absolute';
        picker.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
        picker.style.right = (window.innerWidth - rect.right) + 'px';
        
        // Close when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target) && e.target !== this.emojiBtn) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 100);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chat when user is logged in
window.chatApp = new Chat();