const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const searchName = document.getElementById("search-name");
const searchBtn = document.getElementById("search-btn");
const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById("meal-info");

getRandomMeal();
fetchFavoriteMeals();

async function getRandomMeal() {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
        );
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    // console.log(randomMeal);

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

async function getMealsBySearch(name) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + name);

    const respData = await resp.json();
    const meals = respData.meals;

    // console.log(meals);

    return meals;
}

function addMeal(mealData, random = false) {
    // console.log(mealData);

    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `
            <span class="random">
                Random Recipe
            </span>` : ''
            }
            <img 
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
            >
        </div>
        <div class="meal-body">
                <h4>${mealData.strMeal}</h4>
                <button class="favorite-btn">
                    <i class="fas fa-heart"></i>
                </button>
        </div>
    `;

    // Add like to your favorite meal, with "const btn" solution to selection the button
    const btn = meal.querySelector(".meal-body .favorite-btn");

    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealFromLocalStorage(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealToLocalStorage(mealData.idMeal);
            btn.classList.add("active");
        }
        
        fetchFavoriteMeals();
    });

    mealsEl.appendChild(meal);
}

function addMealToLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
};

function removeMealFromLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
};

function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
};

async function fetchFavoriteMeals() {
    // clean the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsFromLocalStorage();

    for(let i=0; i<mealIds.length; i++) {
        const mealId = mealIds[i];
        let meal = await getMealById(mealId);

        addMealToFavorite(meal);
    }
};

function addMealToFavorite(mealData) {

    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button class="clear">
        <i class="fas fa-window-close"></i>
    </button>
    `;

    const btn = favMeal.querySelector(".clear");

    btn.addEventListener("click", () => {
        removeMealFromLocalStorage(mealData.idMeal);

        // remove from favorite meals
        fetchFavoriteMeals();
    });

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update meal info
    const mealEl = document.createElement("div");

    const ingredients = [];

    // get ingredients and measures
    for(let i=1; i<=20; i++) {
        if(mealData["strIngredient" + i]) {
            ingredients.push(`${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`);
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="">
        <p>
            ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
    // clean the container
    mealsEl.innerHTML = "";

    const searchValue = searchName.value;
    const meals = await getMealsBySearch(searchValue);

    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        });
    }

});

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});