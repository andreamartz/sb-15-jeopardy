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
  const url = "http://jservice.io/api/categories?count=100";
  const res = await axios.get(url);
  let categories = res.data.map((category) => ({
    id: category.id,
    title: category.title,
  }));
  categories = shuffle(categories, numCategories);
  return categories;
}

/** Return object with data about a single category:
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
  clues = clues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  clues = shuffle(clues, numQsInCateg);
  return { title, clues };
}

async function makeGameInMemory() {
  // const categories = [];
  // create an array of category objects: [ {id: 11496, title: "Show title"}, {...}, ..., {...}]
  const catInfo = await getCategoryIds();

  // for each category, run getCategory(catId) and push categ object w/ q & a { title: "Math", clues: clue-array } onto gameInMemory

  for (let cat of catInfo) {
    categories.push(await getCategory(cat.id));
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

async function fillTable() {
  const $body = $("body");
  const $h1 = $("<h1>", { id: "title", text: "Jeopardy!" });
  $body.prepend($h1);
  // $table.before($h1);
  $("#title").after("<button id='start'>Start Game!</button>");

  const $table = $("<table>", { id: "boardHTML" });
  $("#start").after($table);
  const $tr = $("<tr>");
  const $thead = $("<thead>");
  const $tbody = $("<tbody>");
  $tr.appendTo($thead);
  for (let y = 0; y < numQsInCateg; y++) {
    let $row = $("<tr>", { id: `row${y}` }).appendTo($tbody);

    for (let x = 0; x < numCategories; x++) {
      $("<td>", { id: `${y}-${x}`, text: "?" })
        .attr("data-showing", "null")
        .appendTo($row);
    }
  }
  $thead.appendTo($table);
  $tbody.appendTo($table);

  const categories = await makeGameInMemory();
  console.log("categories: ", categories);
  // loop through categories array and populate thead tr th's with categ names
  for (let category of categories) {
    const catTitle = category.title.toUpperCase();
    const $th = $("<th>").text(`${catTitle}`);
    $th.appendTo($tr);
  }
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
  console.log("this: ", this);
  console.log("target: ", tgt);
  // get target id.  ids are 'y-x', so the x value tells us the index of the object in categories array
  const $tgtId = $(tgt).attr("id");
  const $tgtIdX = $tgtId[2];
  const $tgtIdY = $tgtId[0];
  console.log("targetId: ", $tgtId);
  // for that object, get the clues array
  const clues = categories[$tgtIdX].clues;
  console.log("clues: ", clues);
  // the 'y' part of the target id tells us the index of the corresponding clue
  // check the .showing property of the clue:
  //   if null:
  //     show question
  //     set clue.showing to "question" in categories data structure (a.k.a., gameInMemory)
  //   if question:
  //     show answer
  //     set clue.showing to "answer"
  //   if answer:
  //     return (ignore click)
  const showing = clues[$tgtIdY].showing;
  console.log("showing: ", clues[$tgtIdY].showing);
  if (clues[$tgtIdY].showing === "answer") {
    return;
  }
  if (clues[$tgtIdY].showing === null) {
    clues[$tgtIdY].showing = "question";
    $(tgt).text(`${clues[$tgtIdY].question}`);
  } else if (clues[$tgtIdY].showing === "question") {
    clues[$tgtIdY].showing = "answer";
    $(tgt).text(`${clues[$tgtIdY].answer}`);
  }
}

$("body").on("click", "td", handleClick);

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  // $board.empty();
  // show loading spinner ????
}

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
