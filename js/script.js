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

// script.js
(function() {
    // Example usage
    let registration = 'user123';
    let error = null;

    if (registration) {
        console.log('Registered:', registration);
    } else {
        error = 'No registration found';
        console.error(error);
    }
})();

