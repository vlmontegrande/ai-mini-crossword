// *****HELPER FUNCTIONS FOR CROSSWORD***** //

// Return a random word from the data
function findRandomWord(data) {
  const keys = Object.keys(data);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return randomKey;
}
// Return an array of words that contain the letter
function findWordsThatMatchOneLetter(data, letter) {
  const keys = Object.keys(data);
  const matches = [];
  let done = false;
  let lowerBound = 0;
  let upperBound = keys.length - 1;
  let index = Math.floor((lowerBound + upperBound) / 2);;
  let currentWord = keys[index];
  let count = 0;

  // Binary search for the first word that matches the letter
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
      let error = new Error("No matches found for letter");
      handleError(error);
      throw error;
    }
    if(count > 100) {
      console.log(currentWord + " " + letter + " " + index + " " + keys.length + " " );
      let error = new Error("Infinite loop");
      handleError(error);
      throw error;
    }
  }

  // Find all words that match the letter
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

// Return an array of words that contain the two letters
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

// Return the word if it exists in the data
function findWord(data, letters) {
  if(data[letters] !== undefined) {
    return [letters];
  }
  return [];
}

// Check if the word exists in the data
function checkWord(data, word) {
  return data[word] !== undefined;
}

// *****CROSSWORD GENERATION***** // 

// Generate a crossword puzzle with words that fit together
function fillCrossword(data) {
  // ORDER: top row, left column, middle row, middle column, right column, bottom row
  let done = false;
  let counter = 0;
  let crossword = [];

  while(!done) {
    let newData = {...data};
    counter++;

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

  console.log(counter);
  return crossword;
}

// *****FUNCTIONS FOR FETCHING DATA***** //

// Fetch the JSON file at the given path and return the crossword
function fetchJSONFile(path) {
  return fetch(path)
    .then(response => {
      if (!response.ok) {
        let error = new Error("Network response was not ok.");
        handleError(error);
        throw error;     
      }
      return response.json();
    })
    .then(data => {
      let crossword = fillCrossword(data);      
      return crossword; 
    })
    .catch(error => {
      handleError(error);
      throw error;
    });
}

// Fetch the crossword clues for the given words
async function fetchClues(words) {
  let clues = [];
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ words })
    });

    // Handle server-side errors
    if (!response.ok) {
      const errorMessage = await response.json();
      let error = new Error(errorMessage.error);
      handleError(error);
      throw error;
    }
  
    clues.push(await response.json());
    } catch (error) {
      handleError(error);
      throw error;
    }
  return clues;
}

// *****HELPER FUNCTIONS FOR CROSSWORD INPUT***** //

// Highlight the word that the cell is a part of horizontally
function highlightWordHorizontally(cell) {
  const row = cell.parentElement;
  row.querySelectorAll(".crossword-cell").forEach(cell => {
    cell.classList.add("highlighted");
    cell.style.backgroundColor = "rgba(19, 255, 0, 0.25)";
  });
  cell.style.backgroundColor = "rgba(0, 181, 255, 0.25)";
}

// Highlight the word that the cell is a part of vertically
function highlightWordVertically(cell) {
  const column = cell.id[1];
  const wordCells = document.querySelectorAll(`[id*="${column}"]`);
  wordCells.forEach((wordCell) => {
    wordCell.classList.add("highlighted");
    wordCell.style.backgroundColor = "rgba(19, 255, 0, 0.25)";
  });
  cell.style.backgroundColor = "rgba(0, 181, 255, 0.25)";
}

// Remove highlights from all cells
function removeHighlights() {
  const cells = document.querySelectorAll(".crossword-cell");
  cells.forEach((cell) => {
    cell.classList.remove("highlighted");
    cell.style.backgroundColor = "";
  });
}

// Highlight the word that the cell is a part of and show the clue
function highlightWord(cell, horizontal) {
  removeHighlights();
  if (horizontal) 
    highlightWordHorizontally(cell);
  else 
    highlightWordVertically(cell);
}

// Show the clue for the word that the cell is a part of
// ORDER OF WORDS IN CROSSWORD ARRAY: top row, left column, middle row, middle column, right column, bottom row
function showClues(cell, horizontal, clues, crossword, win) {
  if (crossword.length === 0 || win === true) {
    return;
  }
  let clueMessage = "";
  let word = "";
  let id = cell.id;
  if (horizontal) {
    switch (id[0]) {
      case "1":
        word = crossword[0];
        break;
      case "2":
        word = crossword[2];
        break;
      case "3":
        word = crossword[5];
        break;
    }
  } else {
    switch (id[1]) {
      case "A":
        word = crossword[1];
        break;
      case "B":
        word = crossword[3];
        break;
      case "C":
        word = crossword[4];
        break;
    }
  }

  clueIndex = crossword.indexOf(word);
  clueMessage = clues[clueIndex].clue;
  document.getElementById("clueMessage").innerHTML = clueMessage;
}

// Check if the crossword is complete and correct
function checkWin(crossword) {
  if (crossword.length === 0) {
    return false;
  }

  const rowWords = [crossword[0], crossword[2], crossword[5]];
  const firstInputWord = document.getElementById("1A").value + document.getElementById("1B").value + document.getElementById("1C").value;
  const secondInputWord = document.getElementById("2A").value + document.getElementById("2B").value + document.getElementById("2C").value;
  const thirdInputWord = document.getElementById("3A").value + document.getElementById("3B").value + document.getElementById("3C").value;
  const inputWords = [firstInputWord, secondInputWord, thirdInputWord];
  


  for (let i = 0; i < rowWords.length; i++) {
    if (rowWords[i].toLowerCase() !== inputWords[i].toLowerCase()) {
      return false;
    }
  }
  return true;
}



// *****SETUP CROSSWORD INPUT***** //

// Set up crossword input event listeners to highlight words and show clues
function setupCrosswordInput(crossword = [], clues = JSON.parse(`{"clues": []}`)) {
  const cells = document.querySelectorAll(".crossword-cell");
  const gridSize = 3; 
  let horizontal = true;
  let currentCell = cells[0];
  let win = false;

  // Check if the crossword is complete and show a message if it is
  // This is an internal function to be able to access the cells and win variable
  function handleWin() {
    if (checkWin(crossword)) {
      win = true;
      document.getElementById("clueMessage").innerHTML = "You win!";
      cells.forEach(cell => {
        cell.removeEventListener("keydown", keydownHandler);
        cell.removeEventListener("input", inputHandler);
        cell.removeEventListener("mousedown", mousedownHandler);
      });

    }
  }

  // Handle cursor movement and input
  function keydownHandler(e) {
    const cell = e.target;
    const index = Array.from(cells).indexOf(cell);
    switch (e.key) {
      // Move cursor and highlight word
      // If the cursor is at the edge of the grid, switch direction
      case "ArrowLeft":
        if (index % gridSize > 0) {
          currentCell = cells[index - 1];
          currentCell.focus();
          highlightWord(currentCell, horizontal);
          showClues(currentCell, horizontal, clues, crossword, win);
        } else {
          if (horizontal)
            horizontal = false;
          else
            horizontal = true;
          highlightWord(currentCell, horizontal);
          showClues(currentCell, horizontal, clues, crossword, win);
        }
        e.preventDefault();
        break;

      case "ArrowRight":
        if (index % gridSize < gridSize - 1) {
          currentCell = cells[index + 1];
          currentCell.focus();
          highlightWord(currentCell, horizontal);
          showClues(currentCell, horizontal, clues, crossword, win);
        } else {
          if (horizontal)
            horizontal = false;
          else
            horizontal = true;
          highlightWord(currentCell, horizontal);
          showClues(currentCell, horizontal, clues, crossword, win);
        }
        e.preventDefault();
        break;

      case "ArrowUp":
        if (index >= gridSize) {
          currentCell = cells[index - gridSize];
          currentCell.focus();
          highlightWord(currentCell, horizontal);
          showClues(currentCell, horizontal, clues, crossword, win);
        } else {
          if (horizontal)
            horizontal = false;
          else
            horizontal = true;
          highlightWord(currentCell, horizontal);
          showClues(currentCell, horizontal, clues, crossword, win);
        }
        e.preventDefault();
        break;

      case "ArrowDown":
        if (index < cells.length - gridSize) {
          currentCell = cells[index + gridSize];
          currentCell.focus();
          highlightWord(currentCell, horizontal);
          showClues(currentCell, horizontal, clues, crossword, win);
        } else {
          if (horizontal)
            horizontal = false;
          else
            horizontal = true;
          highlightWord(currentCell, horizontal);
          showClues(currentCell, horizontal, clues, crossword, win);
        }
        e.preventDefault();
        break;

      case "Backspace":
        break;

      case "Tab":
        if (horizontal) {
          if (index == gridSize ** 2 - 1) {
            currentCell = cells[0];
            currentCell.focus();
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword, win);
          } else {
            currentCell = cells[index + 1];
            currentCell.focus();
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword, win);
          }
        } else {
          if (index > gridSize ** 2 - gridSize - 1) {
            currentCell = cells[(index % gridSize + 1) % gridSize];
            currentCell.focus();
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword, win);
          } else {
            currentCell = cells[index + gridSize];
            currentCell.focus();
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword, win);
          }
        }
        e.preventDefault();
        break;

      default:
        // Prevent entering non-alphabetic characters
        if (!/^[a-zA-Z]$/.test(e.key)) {
          e.preventDefault();
        } else {
          cell.value = e.key.toUpperCase();
          handleWin();
        }
        break;
    }
  }

  // Prevent entering more than one character
  function inputHandler(e) {
    const cell = e.target;
    cell.value = cell.value.toUpperCase().substring(0, 1);
  }

  // Handle mouse input
  // If the cell is clicked, focus on it and highlight the word/switch direction
  function mousedownHandler(e) {
    const cell = e.target;
    e.preventDefault();
    cell.focus();
    cell.selectionStart = cell.selectionEnd = cell.value.length;
    if (currentCell === cell && horizontal) {
      horizontal = false;
    } else if (currentCell === cell){
      horizontal = true;
    }
    currentCell = cell;
    highlightWord(currentCell, horizontal);
    showClues(currentCell, horizontal, clues, crossword, win);
  }

  cells.forEach((cell) => {
    cell.addEventListener("keydown", keydownHandler);
    cell.addEventListener("input", inputHandler);
    cell.addEventListener("mousedown", mousedownHandler);
  });
}

// *****ERROR HANDLING***** //

function handleError(error) {
  console.error("Error:", error);
  document.getElementById("errorMessage").innerHTML = "Error: " + error.message;
}

// *****MAIN***** //

document.addEventListener("DOMContentLoaded", (event) => {
  setupCrosswordInput(); // 
  fetchJSONFile("data/easy_list.json")
    .then(crossword => {
      if (crossword) {
        console.log(crossword);
        let data = fetchClues(crossword);
        return Promise.all([data, crossword]);
      } else {
        let error = new Error("Crossword generation failed.");
        handleError(error);
        throw error;
      }
    })
    .then(arr => {
      data = arr[0];
      crossword = arr[1];
      parsed = JSON.parse(data[0].text);
      document.getElementById("clueMessage").innerHTML = "Clues loaded!";
      
      setTimeout(() => {
        setupCrosswordInput(crossword, parsed);
      }, 1000);

    })
    .catch(error => {
      handleError(error); 
      throw error;
    });
});