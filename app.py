# Import necessary libraries
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import json
from datetime import datetime
import bcrypt
import os

# Initialize the Flask app
app = Flask(__name__)
app.secret_key = 'or_is_it_?'

# Database initialization and table creation


def connect_db():
    conn = sqlite3.connect('database.db')
    return conn


def init_db():
    with connect_db() as conn:
        cur = conn.cursor()
        # Create the 'users' table if it doesn't exist
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )
        ''')
        # Create the 'tasks' table if it doesn't exist
        cur.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                due_date TEXT NOT NULL,
                category TEXT,
                priority TEXT,
                time_taken INTEGER,
                completed INTEGER DEFAULT 0
            )
        ''')


def fetch_user_by_email(email):
    with connect_db() as conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM users WHERE email = ?', (email,))
        return cur.fetchone()


def fetch_user_by_id(user_id):
    with connect_db() as conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        return cur.fetchone()


def save_user(email, password):
    with connect_db() as conn:
        try:
            cur = conn.cursor()
            cur.execute(
                'INSERT INTO users (email, password) VALUES (?, ?)', (email, password))
            conn.commit()
        except sqlite3.IntegrityError:
            # Handle duplicate email entry (email should be unique)
            raise sqlite3.IntegrityError(
                "Email already exists in the database")
        return True


def fetch_tasks_by_user(user_id):
    with connect_db() as conn:
        cur = conn.cursor()

        query = 'SELECT * FROM tasks WHERE user_id = ?'
        cur.execute(query, (user_id,))
        tasks = cur.fetchall()

        tasks_data = []
        for task in tasks:
            task_data = {
                'id': task[0],
                'title': task[2],
                'description': task[3],
                'due_date': task[4],
                'category': task[5],
                'priority': task[6],
                'time_taken': task[7],
                'completed': task[8]
            }
            tasks_data.append(task_data)
        return tasks_data


def fetch_task_by_id(task_id):
    with connect_db() as conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cur.fetchone()
        if task:
            task_data = {
                'id': task[0],
                'title': task[2],
                'description': task[3],
                'due_date': task[4],
                'category': task[5],
                'priority': task[6],
                'time_taken': task[7],
                'completed': task[8]
            }
            return task_data
        return None


def save_task(user_id, task_data):
    title = task_data.get('title')
    description = task_data.get('description')
    due_date = task_data.get('due_date')
    category = task_data.get('category')
    priority = task_data.get('priority')
    time_taken = task_data.get('time_taken')
    with connect_db() as conn:
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO tasks (user_id, title, description, due_date, category, priority, time_taken) '
            'VALUES (?, ?, ?, ?, ?, ?, ?)',
            (user_id, title, description, due_date, category, priority, time_taken)
        )
        conn.commit()
        task_id = cur.lastrowid  # Fetch the last inserted row's ID
        return task_id


def update_task_sql(task_id, task_data):
    # when task is only done/undone
    if not task_data.get("title", None):
        completed = task_data.get('completed', 0)
        with connect_db() as conn:
            cur = conn.cursor()
            cur.execute(
                'UPDATE tasks SET completed = ? WHERE id = ?',
                (completed, task_id)
            )
            conn.commit()

        return

    # when whole task is updated
    title = task_data.get('title')
    description = task_data.get('description')
    due_date = task_data.get('due_date')
    category = task_data.get('category')
    priority = task_data.get('priority')
    time_taken = task_data.get('time_taken')
    completed = task_data.get('completed', 0)
    with connect_db() as conn:
        cur = conn.cursor()
        cur.execute(
            'UPDATE tasks SET title = ?, description = ?, due_date = ?, category = ?, priority = ?, '
            'time_taken = ?, completed = ? WHERE id = ?',
            (title, description, due_date, category,
             priority, time_taken, completed, task_id)
        )
        conn.commit()


def delete_task_sql(task_id):
    with connect_db() as conn:
        cur = conn.cursor()
        cur.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()


# Main routes
@app.route('/')
def index():
    if 'user_id' in session:
        user_id = session['user_id']
        user = fetch_user_by_id(user_id)
        if user:
            return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Handle user registration form submission
        email = request.form.get('email')
        password = request.form.get('password')

        try:
            # Hash the password before saving it in the database
            hashed_password = bcrypt.hashpw(
                password.encode('utf-8'), bcrypt.gensalt())

            # Save user in the database
            save_user(email, hashed_password)

            return jsonify(success=True)

        except sqlite3.IntegrityError:
            return jsonify(success=False, message='Email already exists in the database')

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Handle user login form submission
        email = request.form['email']
        password = request.form['password']

        user = fetch_user_by_email(email)

        if user and bcrypt.checkpw(password.encode('utf-8'), user[2]):
            # Password matches, store user information in the session
            session['user_id'] = user[0]

            return jsonify(success=True, message='Login successful')

        return jsonify(success=False, message='Invalid email or password')

    return render_template('login.html')


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        # Redirect to login if the user is not logged in
        return redirect(url_for('login'))

    # Fetch tasks for the logged-in user
    user_id = session['user_id']

    tasks = fetch_tasks_by_user(user_id)

    return render_template('dashboard.html', tasks=tasks)


@app.route('/add_task', methods=['POST'])
def add_task():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    # Handle task addition form submission
    user_id = session['user_id']
    task_data = json.loads(request.data)

    # Save the new task in the database and get the task ID
    task_id = save_task(user_id, task_data)

    added_task = fetch_task_by_id(task_id)

    return jsonify(message='Task added successfully', task=added_task)


@app.route('/update_task/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    # Handle task update form submission
    task_data = json.loads(request.data)

    update_task_sql(task_id, task_data)

    return jsonify(message='Task updated successfully')


@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    delete_task_sql(task_id)

    return jsonify(message='Task deleted successfully')


# Start the Flask app
if __name__ == '__main__':
    if "database.db" not in os.listdir():
        init_db()
    app.run(debug=True)
