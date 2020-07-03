// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

// let categories = [];

// Here is a helper function to shuffle an array (uses Fisher Yates algo)
// Given an array of six items or longer, it shuffles that array and
// returns the first six items as an array.

function chooseCategs(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  // Keep only the first six in array
  return array.slice(0, 6);
}

/** Get NUM_CATEGORIES random category from API.
 * Returns array of category ids
 */

async function getCategoryIds() {
  const url = "http://jservice.io/api/categories?count=100";
  const res = await axios.get(url);
  console.log(res.data);
  const categories = res.data.map((category) => ({
    id: category.id,
    title: category.title,
  }));
  console.log("catIds: ", categories);
  return chooseCategs(categories);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const url = `http://jservice.io/api/category?id=${catId}`;
  const res = await axios.get(url);
  let { title, clues } = res.data;
  const cluesInfo = clues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return { title, cluesInfo };
}

async function makeGameInMemory() {
  const categories = [];
  // getCategoryIds returns an array of category objects: [ {id: 11496, title: "Show title"}]
  const catInfo = await getCategoryIds();
  console.log("catInfo: ", catInfo);

  // getCategory(catId) takes an id and returns categ object w/ q & a { title: "Math", clues: clue-array }

  // for each category, run getCategory(catId) and push the resulting object onto gameInMemory
  for (let cat of catInfo) {
    categories.push(await getCategory(cat.id));
  }
  return categories;
}

// let table = $('<table></table>');
// <table>
// <thead>
//   <tr>
//     <th></th>
//     <th></th>
//   </tr>
// </thead>
// <tbody>
//   <tr>
//     <td></td>
//     <td></td>
//   </tr>
// </tbody>
// </table>

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

function setupAndStart() {}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO
