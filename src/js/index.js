import Search from './models/Search';
import Recipe from './models/Recipe'
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';


/** Global state of the app
 *  - Search Object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */

const state = {};

/** SEARCH CONTROLLER **/

const controlSearch = async () => {
    // 1. get query from the view
    const query = searchView.getInput(); // todo
    //const query = 'pizza'; // for testing

    if (query) {
       // 2. new search object and add to state
       state.search = new Search(query);
    }

    // 3. Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try{

        // 4. Search for recipes

        await state.search.getResults(); // assigns the results to state.search.result

        // 5. render results on UI

        // console.log(state.search);
        // console.log(state.search.query);
        // console.log(state.search.result);

        setTimeout(function () {
            clearLoader();
            searchView.renderResults(state.search.result);
            //searchView.renderResults(recipes);
        }, 3000, state.search.result);

    }catch (e) {
        console.log(e);
        clearLoader();
    }

}

elements.searchForm.addEventListener('submit',  e => {
    e.preventDefault();
    controlSearch();

});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        //console.log(goToPage);
        searchView.clearResults();
        searchView.renderResults(recipes, goToPage);
    }
});

//const search = new Search('pizza');
//search.getResults();

/**
 * RECIPE CONTROLLER
 */

// const r = new Recipe(47746);
// r.getRecipe();
// console.log(r);

const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');
    //console.log(id);

    if(id) {

        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        // TESTING
        window.r = state.recipe;

        try{

            // Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render the recipe
            //console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        }catch (e) {
           alert('Something went wrong');

        }


    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */

const controlList = () => {
    // create new list if there is none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

// Handle delete and update list item events

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the detele button
    if (e.target.matches('.shopping_delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id,val);
    }
})

/**
 * LIKE CONTROLLER
 */
state.likes = new Likes();
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

        // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// Restore liked recipes on page load

window.addEventListener('load', () => {

    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if ( e.target.matches('.btn-decrease, .btn-decrease *')) {
        console.log('decrease');
        // Decrease button is clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }

    } else if ( e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
    //console.log(state.recipe);

});

