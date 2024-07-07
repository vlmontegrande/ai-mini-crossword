// Import the data from the JSON file
// 'data\\hard_list.json' is the path to the JSON file

// *****HELPER FUNTIONS FOR CROSSWORD***** //

function findRandomWord(data) {
  const keys = Object.keys(data);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return randomKey;
}

function findWordsThatMatchOneLetter(data, letter) {
  // Return an array of words that contain the letter
  const keys = Object.keys(data);
  const matches = [];
  let done = false;
  let lowerBound = 0;
  let upperBound = keys.length - 1;
  let index = Math.floor((lowerBound + upperBound) / 2);;
  let currentWord = keys[index];
  let count = 0;

  while(!done) {
    count++;
    if(currentWord.charAt(0) > letter) {
      upperBound = index - 1;
    } else if(currentWord.charAt(0) < letter) {
      lowerBound = index + 1;
    }
    index = Math.floor((lowerBound + upperBound) / 2);
    currentWord = keys[index];
    if(currentWord.charAt(0) === letter){
      done = true;
    }
    if((index === 0 || index === keys.length - 1) && !done) {
      throw new Error('No matches found for letter');
    }
    if(count > 100) {
      console.log(currentWord + ' ' + letter + ' ' + index + ' ' + keys.length + ' ' );
      throw new Error('Infinite loop');
    }
  }

  done = false;
  let i = index;
  while(!done) {
    matches.push(currentWord);
    i--;
    if(i < 0 || keys[i].charAt(0) !== letter) {
      done = true;
    } else {
      currentWord = keys[i];
    }
  }

  done = false;
  i = index + 1;
  if(i >= keys.length) {
    done = true;
  }
  currentWord = keys[i];
  while(!done) {
    matches.push(currentWord);
    i++;
    if(i >= keys.length || keys[i].charAt(0) !== letter) {
      done = true;
    } else {
      currentWord = keys[i];
    }
  }

  return matches;
}

function findWordsThatMatchTwoLetters(data, letters) {
  let matchesFirstLetter = findWordsThatMatchOneLetter(data, letters.charAt(0));
  let matches = [];
  for(let i = 0; i < matchesFirstLetter.length; i++) {
    if(matchesFirstLetter[i].charAt(1) === letters.charAt(1)) {
      matches.push(matchesFirstLetter[i]);
    }
  }
  return matches;
}

/*function findWordsThatMatchThreeLetters(data, letters) {
  let matchesFirstLetter = findWordsThatMatchOneLetter(data, letters.charAt(0));
  let matches = [];
  for(let i = 0; i < matchesFirstLetter.length; i++) {
    if(matchesFirstLetter[i] === letters) {
      matches.push(matchesFirstLetter[i]);
      return matches;
    }
  }
  return matches;
}*/

function findWord(data, letters) {
  if(data[letters] !== undefined) {
    return [letters];
  }
  return [];
}

function checkWord(data, word) {
  // Return true if word is in the data, return false otherwise
  return data[word] !== undefined;
}

function fillCrossword(data) {
  // Add top row word
  // Add left column word with same first letter
  // Add middle row word with same first letter
  // Check if any words exist for middle column
  // Check if any words that complete right column and bottom row
  // If not, repeat

  // ORDER: top row, left column, middle row, middle column, right column, bottom row
  let done = false;
  let counter = 0;
  let crossword = [];

  while(!done) {
    let newData = {...data};
    counter++;
    console.log(counter);

    crossword = [];
    let topRowWord = findRandomWord(newData);
    crossword.push(topRowWord);
    delete newData[topRowWord];

    let leftColumnWords = findWordsThatMatchOneLetter(newData, topRowWord.charAt(0));
    let leftColumnWord = leftColumnWords[Math.floor(Math.random() * leftColumnWords.length)];
    crossword.push(leftColumnWord);
    delete newData[leftColumnWord];

    let middleRowWords = findWordsThatMatchOneLetter(newData, leftColumnWord.charAt(1));
    let middleRowWord = middleRowWords[Math.floor(Math.random() * middleRowWords.length)];
    crossword.push(middleRowWord);
    delete newData[middleRowWord];

    let middleColumnWords = findWordsThatMatchTwoLetters(newData, topRowWord.charAt(1) + middleRowWord.charAt(1));
    if(middleColumnWords.length === 0) {
      continue;
    }
    let middleColumnWord = middleColumnWords[Math.floor(Math.random() * middleColumnWords.length)];
    crossword.push(middleColumnWord);
    delete newData[middleColumnWord];

    let rightColumnWords = findWordsThatMatchTwoLetters(newData, topRowWord.charAt(2) + middleRowWord.charAt(2));
    if(rightColumnWords.length === 0) {
      continue;
    }
    let rightColumnWord = rightColumnWords[Math.floor(Math.random() * rightColumnWords.length)];
    crossword.push(rightColumnWord);
    delete newData[rightColumnWord];
    
    if(checkWord(newData, crossword[1].charAt(2) + crossword[3].charAt(2) + crossword[4].charAt(2))) {
      crossword.push(crossword[1].charAt(2) + crossword[3].charAt(2) + crossword[4].charAt(2));
      done = true;
    }
  }

  return crossword;
}

/*function fetchJSONFile(path) {
  fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      let crossword = fillCrossword(data);
      document.getElementById('1A').value = crossword[0].charAt(0);
      document.getElementById('1B').value = crossword[0].charAt(1);
      document.getElementById('1C').value = crossword[0].charAt(2);

      document.getElementById('2A').value = crossword[2].charAt(0);
      document.getElementById('2B').value = crossword[2].charAt(1);
      document.getElementById('2C').value = crossword[2].charAt(2);

      document.getElementById('3A').value = crossword[5].charAt(0);
      document.getElementById('3B').value = crossword[5].charAt(1);
      document.getElementById('3C').value = crossword[5].charAt(2);
      console.log(crossword);
      return crossword;
      
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}*/

// NEW
function fetchJSONFile(path) {
  return fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      let crossword = fillCrossword(data);
      document.getElementById('1A').value = crossword[0].charAt(0);
      document.getElementById('1B').value = crossword[0].charAt(1);
      document.getElementById('1C').value = crossword[0].charAt(2);

      document.getElementById('2A').value = crossword[2].charAt(0);
      document.getElementById('2B').value = crossword[2].charAt(1);
      document.getElementById('2C').value = crossword[2].charAt(2);

      document.getElementById('3A').value = crossword[5].charAt(0);
      document.getElementById('3B').value = crossword[5].charAt(1);
      document.getElementById('3C').value = crossword[5].charAt(2);
      
      return crossword; // Make sure to return the crossword
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      return null; // Return null or some value to indicate failure
    });
}


async function fetchClues(crossword) {
  let clues = [];
  for(let i = 0; i < crossword.length; i++) {
    let word = crossword[i];
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word })
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.error);
      }
  
      clues.push(await response.json());
    } catch (error) {
      handleError(error);
    }
  }
  return clues;
}

function setupCrosswordInput() {
  const cells = document.querySelectorAll('.crossword-cell');
  const gridSize = 3; // Assuming a 5x5 grid

  cells.forEach((cell, index) => {
    cell.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (index % gridSize > 0) {
            cells[index - 1].focus();
          }
          e.preventDefault();
          break;
        case 'ArrowRight':
          if (index % gridSize < gridSize - 1) {
            cells[index + 1].focus();
          }
          e.preventDefault();
          break;
        case 'ArrowUp':
          if (index >= gridSize) {
            cells[index - gridSize].focus();
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
          if (index < cells.length - gridSize) {
            cells[index + gridSize].focus();
          }
          e.preventDefault();
          break;
        case 'Backspace':
          break;
        case 'Tab':
          if (index == gridSize ** 2 - 1) {
            cells[0].focus();
          } else {
            cells[index + 1].focus();
          }
          e.preventDefault();
          break;
        default:
          // Prevent entering more than one character
          if (!/^[a-zA-Z]$/.test(e.key)) {
            e.preventDefault();
          } else {
            cell.value = e.key.toUpperCase();
          }
          break;
      }
    });

    cell.addEventListener('input', () => {
      // Allow only a single character
      cell.value = cell.value.toUpperCase().substring(0, 1);
    });

    cell.addEventListener('mousedown', (e) => {
      // Move cursor to the end of the input
      e.preventDefault();
      cell.focus();
      cell.selectionStart = cell.selectionEnd = cell.value.length;
    });
  });
}

function handleError(error) {
  console.error('Error:', error);
  document.getElementById('errorMessage').innerHTML = 'Error: ' + error.message;
}


document.addEventListener('DOMContentLoaded', (event) => {
  fetchJSONFile('data/easy_list.json')
    .then(crossword => {
      if (crossword) { // Ensure crossword is not undefined
        console.log(crossword);
        return fetchClues(crossword);
      } else {
        handleError(new Error('Crossword generation failed.'));
        throw new Error('Crossword generation failed.');
      }
    })
    .then(clues => {
      console.log(clues);
    })
    .catch(error => {
      console.error('Error initializing crossword:', error);
    });
  setupCrosswordInput();
});

/*document.getElementById('inputForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = document.getElementById('textData').value;

  const response = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });

  const result = await response.json();
  document.getElementById('result').innerText = result.text;*/