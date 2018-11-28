import axios from 'axios';
import  {key, proxy} from '../config';
import {recipe} from './data';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {

        /*
* *
* due to API low limit, cant use it. hence reading data from data.js
* *
*/
        // try {
        //     // For now recipe coming from file data
        //     this.title = recipe.title;
        //     this.author = recipe.publisher;
        //     this.img = recipe.image_url;
        //     this.url = recipe.source_url;
        //     this.ingredients = recipe.ingredients;
        //
        // } catch (e) {
        //     console.log(e);
        //     alert(e);
        // }

        console.log(this.title);
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            console.log('inside recipe');
            console.log(title);
            console.log(this);

            console.log(res.data.recipe);

        } catch (error) {
            console.log(error);
        }
    }

    calcTime() {
        // Assume that we need 15 min for each 3 ingredients

        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        const newIngredients = this.ingredients.map(el => {

            // 1. Uniform Units

            let ingredient = el.toLowerCase();

            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);

            });

            // 2. Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3. Parse ingredients into count, unit and ingredient

            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                // There is a unit
                // Ex. 4 1/2 cups, arrCount is [4,1/3] --> eval("4+1/2") gives 4.5
                // Ex. 4 cups, arrCount is [4]

                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if (parseInt(arrIng[0], 10)) {
                // There is no unit but the first element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            } else if (unitIndex === -1) {
                // There is no unit and no number in 1st position

                objIng = {
                    count: 1,
                    unit: '',
                    ingredient // this will convert into ingredient:ingredient
                }
            }

            return objIng;

        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1: this.servings +1;

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}