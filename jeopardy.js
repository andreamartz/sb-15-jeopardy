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

const numCategories = 6;
const numQsInCateg = 5;
let categories = [];

// Here is a helper function to shuffle an array (uses Fisher Yates algo)
// Given an array of six items or longer, it shuffles that array and
// returns the first six items as an array.

function shuffle(array, numToKeep) {
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
  return array.slice(0, numToKeep);
}

/** Get NUM_CATEGORIES random category from API.
 * Returns array of category ids
 */

async function getCategoryIds() {
  const url = "https://jservice.io/api/categories?count=100";
  const res = await axios.get(url);
  let categories = res.data.map((category) => ({
    id: category.id,
    title: category.title,
  }));
  categories = shuffle(categories, numCategories);
  return categories;
}

/** Return object with data about a single category:
 *  Returns { title: "Math", clues: clue-array }
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const url = `https://jservice.io/api/category?id=${catId}`;
  const res = await axios.get(url);
  let {
    title,
    clues
  } = res.data;
  clues = clues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  clues = shuffle(clues, numQsInCateg);
  return {
    title,
    clues
  };
}

async function getGameData() {
  const categoryIds = await getCategoryIds();
  // update categories data: for each category,
  // add object w/ q's & a's { title: "Math", clues: clue-array }
  for (let categ of categoryIds) {
    categories.push(await getCategory(categ.id));
  }
  return categories;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable(callback) {
  // ******** CREATE THE TABLE HEAD ********
  let $thead = $("<thead>");
  let $tr = $("<tr>");
  $tr.appendTo($thead);

  // populate table header row with categ names
  const categories = await getGameData();

  for (let category of categories) {
    const catTitle = category.title.toUpperCase();
    const $th = $("<th>").text(`${catTitle}`);
    $th.appendTo($tr);
  }

  // ********* CREATE THE TABLE BODY *************
  const $tbody = $("<tbody>");
  // add numQsInCateg rows to table body (tbody)
  for (let y = 0; y < numQsInCateg; y++) {
    let $row = $("<tr>", {
      id: `row${y}`
    }).appendTo($tbody);

    for (let x = 0; x < numCategories; x++) {
      $("<td>", {
        id: `${y}-${x}`,
        text: "?"
      }).appendTo($row);
    }
  }

  // ******* CREATE AND PLACE THE TABLE *************
  const $table = $("<table>", {
    id: "boardHtml"
  });
  $thead.appendTo($table);
  $tbody.appendTo($table);
  $("#start").after($table);

  // ****** ADD CLICK EVENT LISTENER ***********
  $("#boardHtml").on("click", "td", handleClick);

  // ******* RUN CALLBACK *******
  callback();
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const tgt = evt.target;
  // get target id.  ids are 'y-x', so the x value tells us the index of the object in categories array
  const $tgtId = $(tgt).attr("id");
  const $tgtIdX = $tgtId[2];
  const $tgtIdY = $tgtId[0];
  // for that object, get the clues array
  const clues = categories[$tgtIdX].clues;
  // the 'y' in the target id is the index of the corresponding clue
  // check the .showing property of the clue:
  //   if null: show question & set clue.showing to "question"
  //   if question: show answer & set clue.showing to "answer"
  //   if answer: return (ignore click)
  if (clues[$tgtIdY].showing === "answer") return;
  if (clues[$tgtIdY].showing === null) {
    clues[$tgtIdY].showing = "question";
    $(tgt).text(`${clues[$tgtIdY].question}`);
  } else if (clues[$tgtIdY].showing === "question") {
    clues[$tgtIdY].showing = "answer";
    $(tgt).text(`${clues[$tgtIdY].answer}`);
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  // remove table and reset categories to be []
  $("#boardHtml").remove();
  categories = [];
  // remove button event listener -- WHY??
  $("body").off("click", "#start", setupAndStart);
  // create loading spinner
  let $spinner = `<div id="spinner"><img src="spinner-1s-457px.gif" alt="" /></div>`;
  $("#start").after($spinner);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#spinner").remove();
  $("body").on("click", "#start", setupAndStart);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart(evt) {
  showLoadingView();
  await fillTable(hideLoadingView);
}

const $body = $("body");
const $h1 = $("<h1>", {
  id: "title",
  text: "Jeopardy!"
});
$body.prepend($h1);
$("#title").after("<button id='start'>Start Game!</button>");
/** On click of start / restart button, set up game. */
$("body").on("click", "#start", setupAndStart); // WHY did I not need "await" here right before fcn name?  Why does it not work when I add it?

/** On page load, add event handler for clicking clues */

// TODO