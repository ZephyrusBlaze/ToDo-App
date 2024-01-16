document.addEventListener('DOMContentLoaded', function () {

    /* Event Functions In Edit Form */

    // Triggered when a task is updated
    function updateEvent(event) {
        event.preventDefault();

        const taskCard = event.target.closest('.taskCard');

        const editForm = taskCard.querySelector('.editForm');
        const taskDetails = taskCard.querySelector('.taskDetails');
        const taskActions = taskCard.querySelector('.taskActions');

        const updatedTask = {
            title: editForm.querySelector('#edit_title').value,
            description: editForm.querySelector('#edit_description').value,
            due_date: editForm.querySelector('#edit_due_date').value,
            category: editForm.querySelector('#edit_category').value.trim(),
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
                // Display a success in the console
                console.log(data.message);

                // Reflect the changes in the task details
                taskCard.querySelector('h3').textContent = updatedTask.title;
                taskCard.querySelector('.taskDetails p:nth-child(1)').innerHTML = `<strong>Description:</strong> ${updatedTask.description}`;

                const dueDate = new Date(updatedTask.due_date);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDueDate = dueDate.toLocaleDateString('en-US', options);
                // Set the formatted date in the HTML element
                taskCard.querySelector('.taskDetails p:nth-child(2)').innerHTML = `<strong>Due Date:</strong> ${formattedDueDate}`;

                taskCard.querySelector('.taskDetails p:nth-child(3)').innerHTML = `<strong>Category:</strong> ${updatedTask.category}`;
                taskCard.querySelector('.taskDetails p:nth-child(4)').innerHTML = `<strong>Priority:</strong> ${updatedTask.priority}`;
                // Show time only if not null
                taskCard.querySelector('.taskDetails p:nth-child(5)').innerHTML = '<strong>Time Taken:</strong> ' + (updatedTask.time_taken ? `${updatedTask.time_taken} minutes` : 'Undefined');

                // Hide the edit form and show the task details
                taskDetails.style.display = 'block';
                taskActions.style.display = 'flex';
                editForm.style.display = 'none';

                updateCategoryFilter();
            })
            .catch(error => {
                console.error('Error updating task:', error);
            });
    }

    // Triggered when the cancel button in the edit form is clicked 
    function cancelEvent(event) {
        const taskCard = event.target.closest('.taskCard');

        const editForm = taskCard.querySelector('.editForm');
        const taskDetails = taskCard.querySelector('.taskDetails');
        const taskActions = taskCard.querySelector('.taskActions');

        taskActions.style.display = 'flex';
        taskDetails.style.display = 'block';
        editForm.style.display = 'none';
    }

    /* Button Click Events */

    // Function to handle the 'Edit' button click
    function handleEditClick(event) {
        const taskCard = event.target.closest('.taskCard');

        const taskActions = taskCard.querySelector('.taskActions');
        taskActions.style.display = 'none';

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

        // Parse and format the due date
        const dueDateText = taskCard.querySelector('.taskDetails p:nth-of-type(2)').textContent.replace('Due Date: ', '');
        const dueDateParts = dueDateText.split(' '); // Split by space
        const monthName = dueDateParts[0]; // Month name
        const day = dueDateParts[1].slice(0, -1); // Day without the comma
        const year = dueDateParts[2]; // Year
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.indexOf(monthName); // Get the month index

        if (monthIndex !== -1) {
            // If the month is found in the array
            const formattedDueDate = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
            dueDateInput.value = formattedDueDate;
        } else {
            dueDateInput.value = ''; // If any error
        }

        categoryInput.value = taskCard.querySelector('.taskDetails p:nth-of-type(3)').textContent.replace('Category: ', '');
        priorityInput.value = taskCard.querySelector('.taskDetails p:nth-of-type(4)').textContent.replace('Priority: ', '');
        timeTakenInput.value = taskCard.querySelector('.taskDetails p:nth-of-type(5)').textContent.replace('Time Taken: ', '').replace(' minutes', '');

        const cancelButton = editForm.querySelector('.cancelBtn');
        cancelButton.addEventListener('click', cancelEvent);
    }

    // Function to handle the 'Delete' button click
    function handleDeleteClick(event) {
        const taskCard = event.target.closest('.taskCard');
        const taskId = taskCard.dataset.id;

        // Send AJAX request to delete the task
        fetch(`/delete_task/${taskId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                // Display a success message in the console
                console.log(data.message);

                // Remove the task card from the list
                taskCard.remove();
                const taskList = document.getElementById('taskList');
                if (taskList.childElementCount == 1) { // only no task para child and no task card
                    document.getElementById("no-task").style.display = 'block';
                }
                updateCategoryFilter();
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
    }

    // Function to handle the 'Done' button click
    function handleDoneClick(event) {
        const taskCard = event.target.closest('.taskCard');
        const taskId = taskCard.dataset.id;

        // Get the completion status of the task
        const isCompleted = taskCard.querySelector('.taskDetails p:last-of-type').textContent === 'Completed: Yes';

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
                // Display a success message in the console
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

    // Function to handle the 'Add Task' form submission
    function handleAddTask(event) {
        event.preventDefault();

        const formElements = event.target.elements;
        const time_taken_value = formElements.time_taken.value;
        const time_taken = time_taken_value !== null && !isNaN(time_taken_value) ? parseInt(time_taken_value) : null;

        const newTask = {
            title: formElements.title.value,
            description: formElements.description.value,
            due_date: formElements.due_date.value,
            category: formElements.category.value.trim(),
            priority: formElements.priority.value,
            time_taken: time_taken,
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
                // Display a success message in the console
                console.log(data.message);
                // Update the task list on the page with the new task
                if (data.task) {
                    const taskList = document.getElementById('taskList');
                    const newTaskCard = createTaskCard(data.task);
                    taskList.appendChild(newTaskCard);
                    document.getElementById("no-task").style.display = "none";
                }

                // Clear the form fields
                formElements.title.value = '';
                formElements.description.value = '';
                formElements.due_date.value = '';
                formElements.category.value = '';
                formElements.priority.value = 'Low';
                formElements.time_taken.value = '';

                updateCategoryFilter();
                checkAllTasksHidden();
            })
            .catch(error => {
                console.error('Error adding task:', error);
            });
    }

    /* Helper Functions */

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

    // Seach task based on title or description
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

    // Function to create a new task card element
    function createTaskCard(task) {
        const taskCard = document.createElement('li');
        taskCard.classList.add('taskCard');
        taskCard.classList.add('incompletedTask');
        taskCard.dataset.id = task.id;

        const dueDate = new Date(task.due_date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDueDate = dueDate.toLocaleDateString('en-US', options);

        taskCard.innerHTML = `
          <h3>${task.title}</h3>
          <div class="taskDetails">
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Due Date:</strong> ${formattedDueDate}</p>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Time Taken:</strong> ${task.time_taken ? `${task.time_taken} minutes` : 'Undefined'}</p>
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
                <input type="text" id="edit_title" name="edit_title" autocomplete="off" required value="${task.title}">
              </div>
              <div>
                <label for="edit_description">Description:</label>
                <input type="text" id="edit_description" name="edit_description" autocomplete="off" required value="${task.description}">
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
                  <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
                  <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
                </select>
              </div>
              <div>
                <label for="edit_time_taken">Time Taken (in minutes):</label>
                <input type="number" id="edit_time_taken" name="edit_time_taken" value="${task.time_taken}">
              </div>
              <button type="button" class="cancelBtn">Cancel</button>
              <button type="submit" class="updateBtn">Update</button>
            </form>
          </div>
        `;

        const editBtn = taskCard.querySelector('.editBtn');
        const deleteBtn = taskCard.querySelector('.deleteBtn');
        const doneBtn = taskCard.querySelector('.doneBtn');
        const editForm = taskCard.querySelector('.editForm');
        const taskDetails = taskCard.querySelector('.taskDetails');
        const taskActions = taskCard.querySelector('.taskActions');

        editBtn.addEventListener('click', handleEditClick);
        deleteBtn.addEventListener('click', handleDeleteClick);
        doneBtn.addEventListener('click', handleDoneClick);

        const cancelButton = editForm.querySelector('.cancelBtn');
        cancelButton.addEventListener('click', cancelEvent);

        // Add event listener to submit event on edit form
        editForm.querySelector('form').addEventListener('submit', updateEvent);

        return taskCard;
    }

    function updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');

        // Get all unique categories from the task list
        const categories = Array.from(
            document.querySelectorAll('.taskCard .taskDetails p:nth-of-type(3)')
        ).map(category => category.textContent.replace('Category: ', ''));

        const uniqueCategories = Array.from(new Set(categories));

        // Clear all existing options in the select element except for the 'All' option
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }

        // Populate the category options
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /* Initializing JS */

    // Loop through each task card and add the edit form event listener
    const taskCards = document.querySelectorAll('.taskCard');
    taskCards.forEach(taskCard => {
        const editForm = taskCard.querySelector('.editForm')
        editForm.querySelector('form').addEventListener('submit', updateEvent);
    });

    /* Adding handle events to the search and filters */

    const taskSearchInput = document.getElementById('taskSearch');
    const filterElements = document.querySelectorAll('#categoryFilter, #priorityFilter, #statusFilter');

    filterElements.forEach(filterElement => {
        filterElement.addEventListener('change', filterTasks);
    });

    taskSearchInput.addEventListener('input', searchTasks);


    /* Adding handle events to the buttons */

    const editButtons = document.querySelectorAll('.editBtn');
    const deleteButtons = document.querySelectorAll('.deleteBtn');
    const doneButtons = document.querySelectorAll('.doneBtn');
    const addTaskForm = document.getElementById('addTaskForm');

    editButtons.forEach(editBtn => {
        editBtn.addEventListener('click', handleEditClick);
    });

    deleteButtons.forEach(deleteBtn => {
        deleteBtn.addEventListener('click', handleDeleteClick);
    });

    doneButtons.forEach(doneBtn => {
        doneBtn.addEventListener('click', handleDoneClick);
    });

    addTaskForm.removeEventListener('submit', handleAddTask);
    addTaskForm.addEventListener('submit', handleAddTask);

    /* Initializing category filter's options */
    updateCategoryFilter();

    /* Display 'No Task' if there is literally no task */
    checkAllTasksHidden();
});
