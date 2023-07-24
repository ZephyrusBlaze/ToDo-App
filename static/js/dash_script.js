document.addEventListener('DOMContentLoaded', function () {

    // Get the categoryFilter element
    const categoryFilter = document.getElementById('categoryFilter');

    // Get all unique categories from the task list
    const categories = Array.from(
        document.querySelectorAll('.taskCard .taskDetails p:nth-of-type(3)')
    ).map(category => category.textContent.replace('Category: ', ''));

    // Remove duplicates from categories array
    const uniqueCategories = Array.from(new Set(categories));

    // Populate the category options
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Get the taskList element
    const taskList = document.getElementById('taskList');

    // Function to check if all task list items have display none
    function checkAllTasksHidden() {
        const tasks = taskList.querySelectorAll('.taskCard');
        const allHidden = Array.from(tasks).every(task => task.style.display === 'none');
        const noTaskElement = document.getElementById('no-task');

        if (allHidden) {
            noTaskElement.style.display = 'block';
        } else {
            noTaskElement.style.display = 'none';
        }
    }

    // Function to filter tasks based on the selected filters
    function filterTasks() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        const tasks = taskList.querySelectorAll('.taskCard');

        tasks.forEach(task => {
            const category = task.querySelector('.taskDetails p:nth-of-type(3)').textContent.replace('Category: ', '');
            const priority = task.querySelector('.taskDetails p:nth-of-type(4)').textContent.replace('Priority: ', '');
            const isCompleted = task.querySelector('.taskDetails p:last-of-type').textContent === 'Completed: Yes';

            const isVisible = (categoryFilter === '' || category === categoryFilter)
                && (priorityFilter === '' || priority === priorityFilter)
                && (statusFilter === '' || (statusFilter === 'completed' && isCompleted) || (statusFilter === 'uncompleted' && !isCompleted));

            task.style.display = isVisible ? 'block' : 'none';
        });
        checkAllTasksHidden();
    }

    // Add event listeners to the filter elements
    const filterElements = document.querySelectorAll('#categoryFilter, #priorityFilter, #statusFilter');
    filterElements.forEach(filterElement => {
        filterElement.addEventListener('change', filterTasks);
    });

    function searchTasks() {
        const taskSearch = document.getElementById('taskSearch').value.toLowerCase();
        const tasks = taskList.querySelectorAll('.taskCard');

        tasks.forEach(task => {
            const title = task.querySelector('h3').textContent.toLowerCase();
            const description = task.querySelector('.taskDetails p:nth-of-type(1)').textContent.replace('Description: ', '').toLowerCase();

            const isVisible = title.includes(taskSearch) || description.includes(taskSearch);

            task.style.display = isVisible ? 'block' : 'none';
        });
        checkAllTasksHidden();
    }

    // Add event listener to the search input
    const taskSearchInput = document.getElementById('taskSearch');
    taskSearchInput.addEventListener('input', searchTasks);

    const editButtons = document.querySelectorAll('.editBtn');

    editButtons.forEach(editBtn => {
        editBtn.addEventListener('click', handleEditClick);
    });

    // Function to handle the 'Edit' button click
    function handleEditClick(event) {
        // Get the parent 'li' element containing the task
        const taskCard = event.target.closest('.taskCard');

        // Hide the task actions
        const taskActions = taskCard.querySelector('.taskActions');
        taskActions.style.display = 'none';

        // Hide the task details
        const taskDetails = taskCard.querySelector('.taskDetails');
        taskDetails.style.display = 'none';

        // Show the edit form
        const editForm = taskCard.querySelector('.editForm');
        editForm.style.display = 'block';

        // Retrieve previous task information and populate the edit form
        const titleInput = editForm.querySelector('#edit_title');
        const descriptionInput = editForm.querySelector('#edit_description');
        const dueDateInput = editForm.querySelector('#edit_due_date');
        const categoryInput = editForm.querySelector('#edit_category');
        const priorityInput = editForm.querySelector('#edit_priority');
        const timeTakenInput = editForm.querySelector('#edit_time_taken');

        titleInput.value = taskCard.querySelector('h3').textContent;
        descriptionInput.value = taskCard.querySelector('.taskDetails p:nth-of-type(1)').textContent.replace('Description: ', '');
        dueDateInput.value = taskCard.querySelector('.taskDetails p:nth-of-type(2)').textContent.replace('Due Date: ', '');
        categoryInput.value = taskCard.querySelector('.taskDetails p:nth-of-type(3)').textContent.replace('Category: ', '');
        priorityInput.value = taskCard.querySelector('.taskDetails p:nth-of-type(4)').textContent.replace('Priority: ', '');
        timeTakenInput.value = taskCard.querySelector('.taskDetails p:nth-of-type(5)').textContent.replace('Time Taken: ', '').replace(' minutes', '');

        // Get 'Cancel' and 'Update' buttons in the edit form
        const cancelButton = editForm.querySelector('.cancelBtn');
        const updateButton = editForm.querySelector('.updateBtn');

        // Add event listener to 'Cancel' button to revert changes and hide the edit form
        cancelButton.addEventListener('click', function () {
            taskActions.style.display = 'block';
            taskDetails.style.display = 'block';
            editForm.style.display = 'none';
        });

        // Add event listener to 'Update' button to send AJAX request to update task
        updateButton.addEventListener('click', function () {
            const updatedTask = {
                title: titleInput.value,
                description: descriptionInput.value,
                due_date: dueDateInput.value,
                category: categoryInput.value,
                priority: priorityInput.value,
                time_taken: parseInt(timeTakenInput.value),
            };

            const taskId = taskCard.dataset.id;

            // Send AJAX request to update the task
            fetch(`/update_task/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            })
                .then(response => response.json())
                .then(data => {
                    // Display a success message to the user
                    console.log(data.message);

                    // Reflect the changes in the task details
                    taskCard.querySelector('h3').textContent = updatedTask.title;
                    taskCard.querySelector('.taskDetails p:nth-of-type(1)').textContent = `Description: ${updatedTask.description}`;
                    taskCard.querySelector('.taskDetails p:nth-of-type(2)').textContent = `Due Date: ${updatedTask.due_date}`;
                    taskCard.querySelector('.taskDetails p:nth-of-type(3)').textContent = `Category: ${updatedTask.category}`;
                    taskCard.querySelector('.taskDetails p:nth-of-type(4)').textContent = `Priority: ${updatedTask.priority}`;
                    taskCard.querySelector('.taskDetails p:nth-of-type(5)').textContent = `Time Taken: ${updatedTask.time_taken} minutes`;

                    // Hide the edit form and show the task actions and details
                    taskActions.style.display = 'block';
                    taskDetails.style.display = 'block';
                    editForm.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error updating task:', error);
                });
        });
    }

    const deleteButtons = document.querySelectorAll('.deleteBtn');

    deleteButtons.forEach(deleteBtn => {
        deleteBtn.addEventListener('click', handleDeleteClick);
    });

    // Function to handle the 'Delete' button click
    function handleDeleteClick(event) {
        // Get the parent 'li' element containing the task
        const taskCard = event.target.closest('.taskCard');
        const taskId = taskCard.dataset.id;

        // Send AJAX request to delete the task
        fetch(`/delete_task/${taskId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                // Display a success message to the user
                console.log(data.message);

                // Remove the task card from the list
                taskCard.remove();
                const taskList = document.getElementById('taskList');
                if (taskList.childElementCount == 1) { // only no task para child and no task card
                    document.getElementById("no-task").style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
    }

    // Get the 'addTaskForm' element
    const addTaskForm = document.getElementById('addTaskForm');

    // Remove the existing event listener for the 'submit' event on the 'addTaskForm'
    addTaskForm.removeEventListener('submit', handleAddTask);

    // Add event listener to the 'addTaskForm' submit event
    addTaskForm.addEventListener('submit', handleAddTask);

    // Function to handle the 'Add Task' form submission
    function handleAddTask(event) {
        event.preventDefault();

        const formElements = event.target.elements;

        const newTask = {
            title: formElements.title.value,
            description: formElements.description.value,
            due_date: formElements.due_date.value,
            category: formElements.category.value,
            priority: formElements.priority.value,
            time_taken: parseInt(formElements.time_taken.value),
        };

        // Send AJAX request to add the new task
        fetch('/add_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
        })
            .then(response => response.json())
            .then(data => {
                // Display a success message to the user
                console.log(data.message);
                // Update the task list on the page with the new task
                if (data.task) {
                    const taskList = document.getElementById('taskList');
                    const newTaskCard = createTaskCard(data.task); // Create a new task card element
                    taskList.appendChild(newTaskCard); // Add the new task card to the task list
                    document.getElementById("no-task").style.display = "none";
                }

                // Clear the form fields
                formElements.title.value = '';
                formElements.description.value = '';
                formElements.due_date.value = '';
                formElements.category.value = '';
                formElements.priority.value = 'low';
                formElements.time_taken.value = '';
            })
            .catch(error => {
                console.error('Error adding task:', error);
            });
    }

    const doneButtons = document.querySelectorAll('.doneBtn');

    // Add event listener to each 'doneBtn'
    doneButtons.forEach(doneBtn => {
        doneBtn.addEventListener('click', handleDoneClick);
    });

    // Function to handle the 'Done' button click
    function handleDoneClick(event) {
        // Get the parent 'li' element containing the task
        const taskCard = event.target.closest('.taskCard');
        const taskId = taskCard.dataset.id;

        // Get the completion status of the task
        const isCompleted = taskCard.querySelector('.taskDetails p:last-of-type').textContent === 'Completed: Yes';

        // Create an object to represent the updated completion status of the task
        const updatedTask = {
            completed: isCompleted ? 0 : 1,
        };

        // Send AJAX request to update the completion status of the task
        fetch(`/update_task/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        })
            .then(response => response.json())
            .then(data => {
                // Display a success message to the user
                console.log(data.message);

                // Update the completion status in the task details
                taskCard.querySelector('.taskDetails p:last-of-type').innerHTML = `<strong>Completed</strong>: <b>${updatedTask.completed ? 'Yes' : 'No'}</b>`;

                if (updatedTask.completed) {
                    taskCard.classList.add('completedTask');
                    taskCard.classList.remove('incompletedTask');
                }
                else {
                    taskCard.classList.add('incompletedTask');
                    taskCard.classList.remove('completedTask');
                }
            })
            .catch(error => {
                console.error('Error updating task:', error);
            });
    }

    // Function to create a new task card element
    function createTaskCard(task) {
        const taskCard = document.createElement('li');
        taskCard.classList.add('taskCard');
        taskCard.classList.add('incompletedTask');
        taskCard.dataset.id = task.id;

        taskCard.innerHTML = `
          <h3>${task.title}</h3>
          <div class="taskDetails">
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Due Date:</strong> ${task.due_date}</p>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Time Taken:</strong> ${task.time_taken} minutes</p>
            <p><strong>Completed:</strong> <b>${task.completed ? 'Yes' : 'No'}</b></p>
          </div>
          <div class="taskActions">
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
            <button class="doneBtn">Done</button>
          </div>
          <div class="editForm" style="display: none;">
            <form>
              <div>
                <label for="edit_title">Title:</label>
                <input type="text" id="edit_title" name="edit_title" required value="${task.title}">
              </div>
              <div>
                <label for="edit_description">Description:</label>
                <input type="text" id="edit_description" name="edit_description" required value="${task.description}">
              </div>
              <div>
                <label for="edit_due_date">Due Date:</label>
                <input type="date" id="edit_due_date" name="edit_due_date" required value="${task.due_date}">
              </div>
              <div>
                <label for="edit_category">Category:</label>
                <input type="text" id="edit_category" name="edit_category" value="${task.category}">
              </div>
              <div>
                <label for="edit_priority">Priority:</label>
                <select id="edit_priority" name="edit_priority">
                  <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                  <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
              </div>
              <div>
                <label for="edit_time_taken">Time Taken (in minutes):</label>
                <input type="number" id="edit_time_taken" name="edit_time_taken" value="${task.time_taken}">
              </div>
              <button type="button" class="cancelBtn">Cancel</button>
              <button type="button" class="updateBtn">Update</button>
            </form>
          </div>
        `;

        const editBtn = taskCard.querySelector('.editBtn');
        const deleteBtn = taskCard.querySelector('.deleteBtn');
        const doneBtn = taskCard.querySelector('.doneBtn');
        const editForm = taskCard.querySelector('.editForm');
        const taskDetails = taskCard.querySelector('.taskDetails');

        editBtn.addEventListener('click', handleEditClick);
        deleteBtn.addEventListener('click', handleDeleteClick);
        doneBtn.addEventListener('click', handleDoneClick);

        const cancelButton = editForm.querySelector('.cancelBtn');
        cancelButton.addEventListener('click', function () {
            taskDetails.style.display = 'block';
            editForm.style.display = 'none';
        });

        const updateButton = editForm.querySelector('.updateBtn');
        updateButton.addEventListener('click', function () {
            const updatedTask = {
                title: editForm.querySelector('#edit_title').value,
                description: editForm.querySelector('#edit_description').value,
                due_date: editForm.querySelector('#edit_due_date').value,
                category: editForm.querySelector('#edit_category').value,
                priority: editForm.querySelector('#edit_priority').value,
                time_taken: parseInt(editForm.querySelector('#edit_time_taken').value),
            };

            const taskId = taskCard.dataset.id;

            // Send AJAX request to update the task
            fetch(`/update_task/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            })
                .then(response => response.json())
                .then(data => {
                    // Display a success message to the user
                    console.log(data.message);

                    // Reflect the changes in the task details
                    taskCard.querySelector('h3').textContent = updatedTask.title;
                    taskCard.querySelector('.taskDetails p:nth-child(1)').innerHTML = `<strong>Description:</strong> ${updatedTask.description}`;
                    taskCard.querySelector('.taskDetails p:nth-child(2)').innerHTML = `<strong>Due Date:</strong> ${updatedTask.due_date}`;
                    taskCard.querySelector('.taskDetails p:nth-child(3)').innerHTML = `<strong>Category:</strong> ${updatedTask.category}`;
                    taskCard.querySelector('.taskDetails p:nth-child(4)').innerHTML = `<strong>Priority:</strong> ${updatedTask.priority}`;
                    taskCard.querySelector('.taskDetails p:nth-child(5)').innerHTML = `<strong>Time Taken:</strong> ${updatedTask.time_taken} minutes`;

                    // Hide the edit form and show the task details
                    taskDetails.style.display = 'block';
                    editForm.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error updating task:', error);
                });
        });

        return taskCard;
    }
});
