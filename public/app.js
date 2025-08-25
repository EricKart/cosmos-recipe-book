document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const form = document.getElementById('recipe-form');
    const formTitle = document.getElementById('form-title');
    const nameInput = document.getElementById('name-input');
    const courseInput = document.getElementById('course-input');
    const ingredientsInput = document.getElementById('ingredients-input');
    const instructionsInput = document.getElementById('instructions-input');
    const recipeList = document.getElementById('recipe-list');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const formButtons = document.querySelector('.form-buttons');
    const themeToggle = document.getElementById('theme-toggle');

    // --- State Management ---
    let isEditing = false;
    let editingId = null;
    const cardColors = ['card-color-1', 'card-color-2', 'card-color-3', 'card-color-4', 'card-color-5'];

    // --- API Functions ---
    const fetchRecipes = async () => {
        try {
            const response = await fetch('/api/recipes');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const recipes = await response.json();
            renderRecipes(recipes);
        } catch (error) {
            console.error("Could not fetch recipes:", error);
        }
    };

    const addRecipe = async (recipeData) => {
        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeData)
            });
            if (response.ok) {
                form.reset();
                fetchRecipes();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Could not add recipe:", error);
        }
    };

    const updateRecipe = async (id, recipeData) => {
        try {
            const response = await fetch(`/api/recipes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeData)
            });
            if (response.ok) {
                resetForm();
                fetchRecipes();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Could not update recipe:", error);
        }
    };

    const deleteRecipe = async (id, course) => {
         try {
            const response = await fetch(`/api/recipes/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course: course })
            });
            if (response.ok) {
                fetchRecipes();
            } else {
                 throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Could not delete recipe:", error);
        }
    };

    // --- UI Functions ---
    const renderRecipes = (recipes) => {
        recipeList.innerHTML = '';
        recipes.forEach((recipe, index) => {
            const colorClass = cardColors[index % cardColors.length];
            const card = document.createElement('div');
            card.className = `recipe-card ${colorClass}`;
            card.innerHTML = `
                <div class="card-header">
                    <h3>${recipe.name}</h3>
                    <small>Course: ${recipe.course}</small>
                </div>
                <div class="card-body">
                    <h4>Ingredients</h4>
                    <pre>${recipe.ingredients}</pre>
                    <h4>Instructions</h4>
                    <pre>${recipe.instructions}</pre>
                </div>
                <div class="card-footer">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            card.querySelector('.edit-btn').addEventListener('click', () => startEdit(recipe));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteRecipe(recipe.id, recipe.course));
            recipeList.appendChild(card);
        });
    };

    const startEdit = (recipe) => {
        isEditing = true;
        editingId = recipe.id;

        formTitle.textContent = "Edit Recipe";
        nameInput.value = recipe.name;
        courseInput.value = recipe.course;
        ingredientsInput.value = recipe.ingredients;
        instructionsInput.value = recipe.instructions;

        courseInput.disabled = true;

        submitBtn.textContent = 'Update Recipe';
        formButtons.style.gridTemplateColumns = '1fr 1fr';
        cancelBtn.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        isEditing = false;
        editingId = null;

        form.reset();
        formTitle.textContent = "My Recipe Book";
        courseInput.disabled = false;
        submitBtn.textContent = 'Add Recipe';
        formButtons.style.gridTemplateColumns = '1fr';
        cancelBtn.classList.add('hidden');
    };

    // --- Theme Switcher Logic ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    };

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- Event Listeners ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const recipeData = {
            name: nameInput.value,
            course: courseInput.value,
            ingredients: ingredientsInput.value,
            instructions: instructionsInput.value
        };

        if (isEditing) {
            updateRecipe(editingId, recipeData);
        } else {
            addRecipe(recipeData);
        }
    });

    cancelBtn.addEventListener('click', resetForm);

    // --- Initial Load ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    fetchRecipes();
});
