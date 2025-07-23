// To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        this.taskIdCounter = parseInt(localStorage.getItem('taskIdCounter')) || 1;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.showEmptyState();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.emptyState = document.getElementById('emptyState');
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // Auto-save on page unload
        window.addEventListener('beforeunload', () => this.saveToStorage());
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            this.showNotification('Please enter a task!', 'error');
            this.shakeElement(this.taskInput);
            return;
        }

        // Check for duplicate tasks
        if (this.isDuplicateTask(taskText)) {
            this.showNotification('This task already exists!', 'error');
            this.shakeElement(this.taskInput);
            return;
        }

        const task = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task); // Add to beginning for better UX
        this.taskInput.value = '';
        
        this.renderTasks();
        this.updateStats();
        this.saveToStorage();
        this.showEmptyState();
        
        this.showNotification('Task added successfully!', 'success');
        this.successAnimation(this.addTaskBtn);
    }

    isDuplicateTask(taskText) {
        return this.tasks.some(task => 
            task.text.toLowerCase() === taskText.toLowerCase()
        );
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.taskId = task.id;

        li.innerHTML = `
            <span onclick="todoApp.toggleTask(${task.id})">${task.text}</span>
            <div class="task-actions">
                <button class="complete-btn" onclick="todoApp.toggleTask(${task.id})" title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
                    <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return li;
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.renderTasks();
            this.updateStats();
            this.saveToStorage();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as pending!';
            this.showNotification(message, 'success');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.renderTasks();
            this.updateStats();
            this.saveToStorage();
            this.showEmptyState();
            
            this.showNotification('Task deleted!', 'success');
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.renderTasks();
            this.updateStats();
            this.saveToStorage();
            this.showEmptyState();
            
            this.showNotification(`${completedCount} completed task(s) cleared!`, 'success');
        }
    }

    clearAll() {
        if (this.tasks.length === 0) {
            this.showNotification('No tasks to clear!', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete all ${this.tasks.length} task(s)?`)) {
            this.tasks = [];
            this.renderTasks();
            this.updateStats();
            this.saveToStorage();
            this.showEmptyState();
            
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = `Total: ${total}`;
        this.completedTasks.textContent = `Completed: ${completed}`;
        this.pendingTasks.textContent = `Pending: ${pending}`;
    }

    showEmptyState() {
        if (this.tasks.length === 0) {
            this.emptyState.classList.add('show');
            this.taskList.style.display = 'none';
        } else {
            this.emptyState.classList.remove('show');
            this.taskList.style.display = 'block';
        }
    }

    saveToStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }

    successAnimation(element) {
        element.classList.add('success');
        setTimeout(() => element.classList.remove('success'), 300);
    }

    // Export tasks to JSON
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-tasks.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    // Import tasks from JSON
    importTasks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    this.tasks = importedTasks;
                    this.renderTasks();
                    this.updateStats();
                    this.saveToStorage();
                    this.showEmptyState();
                    this.showNotification('Tasks imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showNotification('Error importing tasks!', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        todoApp.addTask();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        todoApp.taskInput.value = '';
        todoApp.taskInput.blur();
    }
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}


// Footer Modal Functions
function showAbout() {
    const modal = createModal('About Modern To-Do List', `
        <div class="modal-body">
            <p>Modern To-Do List is a beautiful and feature-rich task management application designed to help you stay organized and productive.</p>
            
            <h3><i class="fas fa-star"></i> Key Features</h3>
            <ul>
                <li>✨ Beautiful modern design with glass-morphism effects</li>
                <li>🎬 Animated background video for visual appeal</li>
                <li>📱 Fully responsive design for all devices</li>
                <li>💾 Automatic local storage for data persistence</li>
                <li>🚫 Duplicate task prevention</li>
                <li>📊 Real-time task statistics</li>
                <li>⌨️ Keyboard shortcuts for productivity</li>
                <li>🔔 Success and error notifications</li>
                <li>📤 Export/Import functionality</li>
            </ul>
            
            <h3><i class="fas fa-code"></i> Technology</h3>
            <p>Built with vanilla HTML, CSS, and JavaScript for optimal performance and compatibility.</p>
            
            <h3><i class="fas fa-heart"></i> Version</h3>
            <p>Version 2.0 - Enhanced with footer and improved functionality</p>
        </div>
    `);
    document.body.appendChild(modal);
}

function showHelp() {
    const modal = createModal('Help & Instructions', `
        <div class="modal-body">
            <h3><i class="fas fa-plus"></i> Adding Tasks</h3>
            <ul>
                <li>Type your task in the input field</li>
                <li>Press <span class="keyboard-shortcut">Enter</span> or click "Add Task"</li>
                <li>Tasks are automatically saved to your browser</li>
            </ul>
            
            <h3><i class="fas fa-check"></i> Managing Tasks</h3>
            <ul>
                <li>Click the <i class="fas fa-check" style="color: #28a745;"></i> button to mark as complete</li>
                <li>Click the <i class="fas fa-trash" style="color: #dc3545;"></i> button to delete a task</li>
                <li>Click on task text to toggle completion status</li>
            </ul>
            
            <h3><i class="fas fa-broom"></i> Bulk Actions</h3>
            <ul>
                <li><strong>Clear Completed:</strong> Removes all completed tasks</li>
                <li><strong>Clear All:</strong> Removes all tasks (with confirmation)</li>
            </ul>
            
            <h3><i class="fas fa-download"></i> Export/Import</h3>
            <ul>
                <li><strong>Export:</strong> Download your tasks as a JSON file</li>
                <li><strong>Import:</strong> Upload a previously exported JSON file</li>
            </ul>
            
            <h3><i class="fas fa-shield-alt"></i> Data Safety</h3>
            <p>Your tasks are stored locally in your browser and never sent to external servers. Always export important tasks as backup!</p>
        </div>
    `);
    document.body.appendChild(modal);
}

function showKeyboardShortcuts() {
    const modal = createModal('Keyboard Shortcuts', `
        <div class="modal-body">
            <h3><i class="fas fa-keyboard"></i> Available Shortcuts</h3>
            <ul>
                <li><span class="keyboard-shortcut">Enter</span> - Add new task (when input is focused)</li>
                <li><span class="keyboard-shortcut">Ctrl + Enter</span> - Add task from anywhere</li>
                <li><span class="keyboard-shortcut">Escape</span> - Clear input field and unfocus</li>
                <li><span class="keyboard-shortcut">Tab</span> - Navigate between elements</li>
                <li><span class="keyboard-shortcut">Space</span> - Activate focused button</li>
            </ul>
            
            <h3><i class="fas fa-mouse"></i> Mouse Actions</h3>
            <ul>
                <li><strong>Click task text:</strong> Toggle completion</li>
                <li><strong>Hover buttons:</strong> See interactive animations</li>
                <li><strong>Right-click task:</strong> Context menu (browser default)</li>
            </ul>
            
            <h3><i class="fas fa-mobile-alt"></i> Touch Gestures</h3>
            <ul>
                <li><strong>Tap:</strong> Same as click</li>
                <li><strong>Long press:</strong> Context menu on supported devices</li>
            </ul>
            
            <p><em>Tip: Use keyboard shortcuts to boost your productivity!</em></p>
        </div>
    `);
    document.body.appendChild(modal);
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-info-circle"></i> ${title}</h2>
                <span class="close">&times;</span>
            </div>
            ${content}
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
    
    // Close modal events
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        }
    };
    
    // Close with Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
            document.removeEventListener('keydown', escapeHandler);
        }
    });
    
    return modal;
}

// Enhanced TodoApp class with better error handling
class EnhancedTodoApp extends TodoApp {
    constructor() {
        super();
        this.initializeEnhancedFeatures();
    }
    
    initializeEnhancedFeatures() {
        // Add error boundary
        window.addEventListener('error', (e) => {
            console.error('TodoApp Error:', e.error);
            this.showNotification('An error occurred. Please refresh the page.', 'error');
        });
        
        // Add unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            this.showNotification('An error occurred. Please try again.', 'error');
        });
    }
    
    // Override addTask with enhanced error handling
    addTask() {
        try {
            const taskText = this.taskInput.value.trim();
            
            if (!taskText) {
                this.showNotification('Please enter a task!', 'error');
                this.shakeElement(this.taskInput);
                this.taskInput.focus();
                return;
            }

            if (taskText.length > 100) {
                this.showNotification('Task is too long! Maximum 100 characters.', 'error');
                this.shakeElement(this.taskInput);
                return;
            }

            // Check for duplicate tasks
            if (this.isDuplicateTask(taskText)) {
                this.showNotification('This task already exists!', 'error');
                this.shakeElement(this.taskInput);
                this.taskInput.focus();
                return;
            }

            const task = {
                id: this.taskIdCounter++,
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.tasks.unshift(task);
            this.taskInput.value = '';
            
            this.renderTasks();
            this.updateStats();
            this.saveToStorage();
            this.showEmptyState();
            
            this.showNotification('Task added successfully!', 'success');
            this.successAnimation(this.addTaskBtn);
            
            // Focus back to input for better UX
            setTimeout(() => this.taskInput.focus(), 100);
            
        } catch (error) {
            console.error('Error adding task:', error);
            this.showNotification('Failed to add task. Please try again.', 'error');
        }
    }
    
    // Enhanced saveToStorage with error handling
    saveToStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Error saving to storage:', error);
            this.showNotification('Failed to save tasks. Storage may be full.', 'error');
        }
    }
}

// Replace the original TodoApp initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.todoApp = new EnhancedTodoApp();
    } catch (error) {
        console.error('Failed to initialize TodoApp:', error);
        // Fallback to basic functionality
        window.todoApp = new TodoApp();
    }
});

// Add smooth scrolling to footer links
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll to top when clicking logo in footer
    const footerLogo = document.querySelector('.footer-section h3');
    if (footerLogo) {
        footerLogo.style.cursor = 'pointer';
        footerLogo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

