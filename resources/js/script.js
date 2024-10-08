// *****HELPER FUNCTIONS FOR CROSSWORD***** //

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
      handleError(new Error("No matches found for letter"));
      throw new Error("No matches found for letter");
    }
    if(count > 100) {
      console.log(currentWord + " " + letter + " " + index + " " + keys.length + " " );
      handleError(new Error("Infinite loop"));
      throw new Error("Infinite loop");
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

function findWord(data, letters) {
  if(data[letters] !== undefined) {
    return [letters];
  }
  return [];
}

function checkWord(data, word) {
  return data[word] !== undefined;
}

// *****CROSSWORD GENERATION***** // 

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

function fetchJSONFile(path) {
  return fetch(path)
    .then(response => {
      if (!response.ok) {
        handleError(new Error("Network response was not ok."));
        throw new Error("Network response was not ok.");     
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

    if (!response.ok) {
      const errorMessage = await response.json();
      handleError(new Error(errorMessage.error));
      throw new Error(errorMessage.error);
    }
  
    clues.push(await response.json());
    } catch (error) {
      handleError(error);
      throw error;
    }
  return clues;
}

// *****HELPER FUNCTIONS FOR CROSSWORD INPUT***** //

function highlightWordHorizontally(cell) {
  const row = cell.parentElement;
  row.querySelectorAll(".crossword-cell").forEach(cell => {
    cell.classList.add("highlighted");
    cell.style.backgroundColor = "rgba(19, 255, 0, 0.25)";
  });
  cell.style.backgroundColor = "rgba(0, 181, 255, 0.25)";
}

function highlightWordVertically(cell) {
  const column = cell.id[1];
  const wordCells = document.querySelectorAll(`[id*="${column}"]`);
  wordCells.forEach((wordCell) => {
    wordCell.classList.add("highlighted");
    wordCell.style.backgroundColor = "rgba(19, 255, 0, 0.25)";
  });
  cell.style.backgroundColor = "rgba(0, 181, 255, 0.25)";
}

function removeHighlights() {
  const cells = document.querySelectorAll(".crossword-cell");
  cells.forEach((cell) => {
    cell.classList.remove("highlighted");
    cell.style.backgroundColor = "";
  });
}

function highlightWord(cell, horizontal) {
  removeHighlights();
  if (horizontal) 
    highlightWordHorizontally(cell);
  else 
    highlightWordVertically(cell);
}

// ORDER: top row, left column, middle row, middle column, right column, bottom row
function showClues(cell, horizontal, clues, crossword) {
  if (crossword.length === 0) {
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

// *****SETUP CROSSWORD INPUT***** //

function setupCrosswordInput(crossword = [], clues = JSON.parse(`{"clues": []}`)) {
  const cells = document.querySelectorAll(".crossword-cell");
  const gridSize = 3; 
  let horizontal = true;
  let currentCell = cells[0];

  cells.forEach((cell, index) => {
    cell.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          if (index % gridSize > 0) {
            currentCell = cells[index - 1];
            currentCell.focus();
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword);
          } else {
            if (horizontal)
              horizontal = false;
            else
              horizontal = true;
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword);
          }
          e.preventDefault();
          break;
        case "ArrowRight":
          if (index % gridSize < gridSize - 1) {
            currentCell = cells[index + 1];
            currentCell.focus();
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword);
          } else {
            if (horizontal)
              horizontal = false;
            else
              horizontal = true;
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword);
          }
          e.preventDefault();
          break;
        case "ArrowUp":
          if (index >= gridSize) {
            currentCell = cells[index - gridSize];
            currentCell.focus();
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword);
          } else {
            if (horizontal)
              horizontal = false;
            else
              horizontal = true;
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword);
          }
          e.preventDefault();
          break;
        case "ArrowDown":
          if (index < cells.length - gridSize) {
            currentCell = cells[index + gridSize];
            currentCell.focus();
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword);
          } else {
            if (horizontal)
              horizontal = false;
            else
              horizontal = true;
            highlightWord(currentCell, horizontal);
            showClues(currentCell, horizontal, clues, crossword);
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
              showClues(currentCell, horizontal, clues, crossword);
            } else {
              currentCell = cells[index + 1];
              currentCell.focus();
              highlightWord(currentCell, horizontal);
              showClues(currentCell, horizontal, clues, crossword);
            }
          } else {
            if (index > gridSize ** 2 - gridSize - 1) {
              currentCell = cells[(index % gridSize + 1) % gridSize];
              currentCell.focus();
              highlightWord(currentCell, horizontal);
              showClues(currentCell, horizontal, clues, crossword);
            } else {
              currentCell = cells[index + gridSize];
              currentCell.focus();
              highlightWord(currentCell, horizontal);
              showClues(currentCell, horizontal, clues, crossword);
            }
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

    cell.addEventListener("input", () => {
      // Allow only a single character
      cell.value = cell.value.toUpperCase().substring(0, 1);
    });

    cell.addEventListener("mousedown", (e) => {
      // Move cursor to the end of the input
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
      showClues(currentCell, horizontal, clues, crossword);
    });
  });
}

function handleError(error) {
  console.error("Error:", error);
  document.getElementById("errorMessage").innerHTML = "Error: " + error.message;
}

// *****MAIN***** //

document.addEventListener("DOMContentLoaded", (event) => {
  setupCrosswordInput();
  fetchJSONFile("data/easy_list.json")
    .then(crossword => {
      if (crossword) {
        console.log(crossword);
        let data = fetchClues(crossword);
        return Promise.all([data, crossword]);
      } else {
        handleError(new Error("Crossword generation failed."));
        throw new Error("Crossword generation failed.");
      }
    })
    .then(arr => {
      data = arr[0];
      crossword = arr[1];
      parsed = JSON.parse(data[0].text);
      document.getElementById("clueMessage").innerHTML = "Clues loaded!";
      setupCrosswordInput(crossword, parsed);
    })
    .catch(error => {
      handleError(error); 
      throw error;
    });
});