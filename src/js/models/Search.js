import axios from 'axios';
import  {key, proxy} from '../config';
import {recipes} from './data';

export default class Search {
    constructor(query) {
        this.query = query;

    }

    async getResults() {

        const res = axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
        //return res;

        res.then(res => {
             this.result = res.data.recipes;

             console.log(this.result);

            }).catch(function (error) {
                alert(error);
            })

        //this.result = recipes;

    }
}


// const data = getResults('tomato pasta')
//     .then(function (res) {
//         try{
//             const recipes = res.data.recipes;
//             console.log(recipes);
//         }catch(error) {
//
//         }
//
//     }).catch(function (error) {
//         alert(error);
//     })