document.addEventListener('DOMContentLoaded', function () {
    loadItems();

    document.getElementById('addItemForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('itemName').value;
        const description = document.getElementById('itemDescription').value;
        const addStock = parseInt(document.getElementById('addStock').value, 10) || 0;

        if (addStock < 0) {
            alert('Stock cannot be less than 0');
            return;
        }

        fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, description, addStock})
        })
            .then(response => response.json())
            .then(data => {
                loadItems();
                document.getElementById('addItemForm').reset();
                document.getElementById('addStock').value = 0; // Reset addStock input to 0 after successful submission

                // Display success alert
                alert('Item added successfully.');
            })
            .catch(error => {
                console.error('Error:', error);

                // Display error alert
                alert('Error adding item.');
            });
    });

    const deleteSelectedButton = document.getElementById('deleteSelected');
    if (deleteSelectedButton) {
        deleteSelectedButton.addEventListener('click', function () {
            const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');

            if (selectedCheckboxes.length === 0) {
                alert('No items selected for deletion');
                return;
            }

            const selectedIds = Array.from(selectedCheckboxes).map(checkbox => {
                return checkbox.id.split('_')[1];
            });

            if (confirm('Are you sure you want to delete selected items?')) {
                deleteSelectedItems(selectedIds);
            }
        });
    }

    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const searchTerm = document.getElementById('searchInput').value;
            if (searchTerm.trim() !== '') {
                searchItemsByName(searchTerm);
            } else {
                alert('Please enter a search term');
            }
        });
    }

    function deleteSelectedItems(ids) {
        fetch('/api/items/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ids})
        })
            .then(() => {
                loadItems(); // Reload items after deleting
            })
            .catch(error => console.error('Error:', error));
    }

    function searchItemsByName(name) {
        const itemList = document.getElementById('itemList');

        fetch(`/api/items/search?name=${encodeURIComponent(name)}`)
            .then(response => response.json())
            .then(data => {
                itemList.innerHTML = '';

                if (Array.isArray(data) && data.length > 0) {
                    // Add items to the DOM
                    data.forEach(item => {
                        addItemToDOM(item);
                    });
                } else {
                    // Show alert if no items are found
                    alert('No items found.');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function loadItems() {
        fetch('/api/items')
            .then(response => response.json())
            .then(data => {
                const itemList = document.getElementById('itemList');
                itemList.innerHTML = ''; // Clear existing items

                data.forEach(item => {
                    addItemToDOM(item);
                });

                const editButtons = document.querySelectorAll('.edit-button');
                const deleteButtons = document.querySelectorAll('.delete-button');

                editButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const itemId = button.closest('.card').querySelector('span').id.split('_')[1];
                        const itemName = button.closest('.card').querySelector('h5').innerText;
                        const itemDescription = button.closest('.card').querySelector('p.card-text').innerText;
                        const itemStock = parseInt(button.closest('.card').querySelector('span').innerText, 10) || 0;
                        editItem(itemId, itemName, itemDescription, itemStock);
                    });
                });

                deleteButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const itemId = button.closest('.card').querySelector('span').id.split('_')[1];
                        deleteItem(itemId);
                    });
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function addItemToDOM(item) {
        const itemList = document.getElementById('itemList');

        const cardHtml = `
        <div class="col mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <p class="card-text">Stock: <span id="itemStock_${item._id}">${item.stock || 0}</span></p>
                    <input type="checkbox" id="checkbox_${item._id}">
                    <div class="card-footer text-muted">
                        Created: ${formatDate(item.createdAt)}<br>
                        Edited: ${formatDate(item.updatedAt)}
                    </div>
                    <button class="btn btn-warning me-2 edit-button">Edit</button>
                    <button class="btn btn-danger delete-button">Delete</button>
                </div>
            </div>
        </div>
    `;
        itemList.innerHTML += cardHtml;

        const editButton = itemList.querySelector(`#itemStock_${item._id}`).closest('.card').querySelector('.edit-button');
        const deleteButton = itemList.querySelector(`#itemStock_${item._id}`).closest('.card').querySelector('.delete-button');

        editButton.addEventListener('click', () => {
            editItem(item._id, item.name, item.description, item.stock);
        });

        deleteButton.addEventListener('click', () => {
            deleteItem(item._id);
        });
    }

    function editItem(id, name, description, stock) {
        const newName = prompt('Edit Name:', name);

        // Check if the user clicked "Cancel" or did not provide a new name
        if (newName === null || newName.trim() === '') {
            return;
        }

        const newDescription = prompt('Edit Description:', description);
        const newStock = parseInt(prompt('Edit Stock:', stock), 10) || 0;

        fetch(`/api/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: newName, description: newDescription, stock: newStock})
        })
            .then(response => response.json())
            .then((data) => {
                loadItems(); // Reload items after editing
            })
            .catch(error => console.error('Error:', error));
    }

    function deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            fetch(`/api/items/${id}`, {
                method: 'DELETE'
            })
                .then(() => {
                    loadItems(); // Reload items after deleting
                })
                .catch(error => console.error('Error:', error));
        }
    }

    function formatDate(dateString) {
        if (!dateString) {
            return 'N/A';
        }

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };

        try {
            const formattedDate = new Date(dateString);

            if (isNaN(formattedDate.getTime())) {
                return 'N/A';
            }

            const datePart = formattedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const timePart = formattedDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });

            return `${datePart} ${timePart}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Error';
        }
    }
});
