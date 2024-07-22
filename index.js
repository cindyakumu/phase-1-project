const apiBaseUrl = 'http://localhost:3000/'; // Ensure this matches your local server URL
const predefinedMenus = ['breakfast', 'lunch', 'dinner', 'dessert', 'drinks'];
let menuData = {};

// Fetch menu data from the API
function fetchMenuData() {
  Promise.all(predefinedMenus.map(menu => 
    fetch(`${apiBaseUrl}${menu}`)
      .then(response => {
        console.log(`Fetching: ${apiBaseUrl}${menu}`); // Log URL being fetched
        if (!response.ok) {
          throw new Error(`Network response was not ok for ${menu}: ${response.statusText}`);
        }
        return response.json();
      })
  ))
  .then(data => {
    console.log("Menu data received:", data); // Log data received from API
    predefinedMenus.forEach((menu, index) => {
      menuData[menu] = data[index];
    });
    createMenuButtons(); // Create buttons after data is loaded
  })
  .catch(handleError);
}

// Handle errors and display an alert
function handleError(error) {
  console.error("Error:", error);
  alert("An error occurred. Please try again later.");
}

// Function to create menu buttons
function createMenuButtons() {
  const menuList = document.getElementById("menu-list");
  menuList.innerHTML = ""; // Clear existing items
  predefinedMenus.forEach(menuName => {
    const button = document.createElement("button");
    button.textContent = `${menuName.charAt(0).toUpperCase() + menuName.slice(1)} Menu`;
    button.id = `${menuName}-button`;
    button.classList.add("menu-button");
    button.addEventListener("click", () => showMenuCategory(menuName));
    menuList.appendChild(button);
  });
}

// Function to show menu category
function showMenuCategory(menuName) {
  const menuContainer = document.querySelector(".menu-container");
  menuContainer.style.display = "block";
  populateMenuCategory(menuName);
  document.getElementById("add-item-button").style.display = "none";
}

// Function to populate menu category with items
function populateMenuCategory(menuName) {
  const menuList = document.getElementById(`${menuName}-details`);
  if (!menuList) return; // Exit if the element does not exist
  menuList.innerHTML = ""; // Clear existing items
  const menuItems = menuData[menuName];
  if (menuItems) {
    menuItems.forEach(item => {
      const li = document.createElement("li");

      // Add meal image
      const img = document.createElement("img");
      img.src = item.image || 'default-image.jpg'; // Use default image if none provided
      img.alt = item.name;
      img.classList.add("menu-item-image");

      // Add meal details
      const text = document.createElement("div");
      text.innerHTML = `<strong>${item.name}</strong>: ${item.description}`;

      // Create a container for image and text
      const container = document.createElement("div");
      container.classList.add("menu-item-container");
      container.appendChild(img);
      container.appendChild(text);
      li.appendChild(container);

      // Add edit and delete buttons
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => editMeal(item, menuName));
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteMeal(menuName, item.id));

      li.appendChild(editButton);
      li.appendChild(deleteButton);
      menuList.appendChild(li);
    });
  } else {
    console.log(`No items found for ${menuName}`);
  }
}

// Function to go back to the home page
function goBackToHomePage() {
  document.querySelectorAll(".menu-details").forEach(detail => {
    detail.innerHTML = ""; // Clear existing items
  });
  document.querySelector(".menu-container").style.display = "none";
  document.getElementById("add-item-button").style.display = "block";
  document.querySelector(".add-item-container").style.display = "none";
  document.querySelector(".edit-item-container").style.display = "none";
}

// Add event listeners
document.getElementById("back-to-menu-button").addEventListener("click", goBackToHomePage);

function addMeal() {
  const mealName = document.getElementById("meal-name").value;
  const mealDescription = document.getElementById("meal-description").value;
  const mealImage = document.getElementById("meal-image").value;
  const menuName = document.getElementById("menu-name").value;

  if (mealName && mealDescription && mealImage && menuName) {
    const newMeal = { name: mealName, description: mealDescription, image: mealImage };
    fetch(`${apiBaseUrl}${menuName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMeal)
    })
    .then(response => response.json())
    .then(() => {
      fetchMenuData(); // Refresh the data
      document.getElementById("meal-name").value = "";
      document.getElementById("meal-description").value = "";
      document.getElementById("meal-image").value = "";
      alert("Meal added successfully!");
    })
    .catch(handleError);
  } else {
    alert("Please fill in all fields.");
  }
}

function editMeal(meal, menuName) {
  document.querySelector(".edit-item-container").style.display = "block";
  document.getElementById("back-to-menu-button").style.display = "block";
  document.getElementById("edit-meal-name").value = meal.name;
  document.getElementById("edit-meal-description").value = meal.description;
  document.getElementById("edit-meal-image").value = meal.image;
  document.getElementById("update-meal-button").dataset.menu = menuName;
  document.getElementById("update-meal-button").dataset.id = meal.id; // Set ID for update
}

function updateMeal() {
  const updatedMealName = document.getElementById("edit-meal-name").value;
  const updatedMealDescription = document.getElementById("edit-meal-description").value;
  const updatedMealImage = document.getElementById("edit-meal-image").value;
  const menuName = document.getElementById("update-meal-button").dataset.menu;
  const mealId = parseInt(document.getElementById("update-meal-button").dataset.id, 10); // Get ID from dataset

  if (!updatedMealName || !updatedMealDescription || !updatedMealImage) {
    alert("Please fill in all fields.");
    return;
  }

  const updatedMeal = { name: updatedMealName, description: updatedMealDescription, image: updatedMealImage };
  fetch(`${apiBaseUrl}${menuName}/${mealId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedMeal)
  })
  .then(response => response.json())
  .then(() => {
    fetchMenuData(); // Refresh the data
    alert("Meal updated successfully!");
    document.querySelector(".edit-item-container").style.display = "none";
    document.getElementById("back-to-menu-button").style.display = "none";
  })
  .catch(handleError);
}

function deleteMeal(menuName, mealId) {
  if (confirm("Are you sure you want to delete this meal?")) {
    fetch(`${apiBaseUrl}${menuName}/${mealId}`, {
      method: 'DELETE'
    })
    .then(() => {
      fetchMenuData(); // Refresh the data
      alert("Meal deleted successfully!");
    })
    .catch(handleError);
  }
}

document.getElementById("add-item-button").addEventListener("click", function() {
  document.querySelector(".add-item-container").style.display = "block";
  document.getElementById("add-item-button").style.display = "none";
  document.getElementById("back-to-menu-button").style.display = "block";
});

document.getElementById("update-meal-button").addEventListener("click", updateMeal);
document.getElementById("add-meal-button").addEventListener("click", addMeal);

// Fetch data initially
fetchMenuData();