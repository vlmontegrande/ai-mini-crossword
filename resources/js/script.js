// Import the data from the JSON file
// 'data\\hard_list.json' is the path to the JSON file

// *****HELPER FUNTIONS FOR CROSSWORD***** //

function findRandomWord(data) {
  const keys = Object.keys(data);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return randomKey;
}

function findWordsThatMatch(data, wordlet) {
  // Return an array of words that match the letters of wordlet
  // UGHHHHH i have to make a binary search function since everything is sorted
  const keys = Object.keys(data);
  const letters = wordlet.split('');
  const matches = [];
  let done = false;
  let index = Math.floor(keys.length / 2);
  let currentWord = keys[index];
  while(!done) {
    
  }
}

function checkWord(data, word) {
  // Return true if word is in the data, return false otherwise
}

function fillCrossword(data) {
  // Add top row word
  // Add left column word with same first letter
  // Add middle row word with same first letter
  // Check if any words exist for middle column
  // Check if any words that complete right column and bottom row
  // If not, repeat
}

function fetchJSONFile(path) {
  fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // TODO: Do something with the data
      console.log(findRandomWord(data));
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

fetchJSONFile('data\\hard_list.json');