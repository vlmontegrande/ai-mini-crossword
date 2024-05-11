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
    if(count > 20) {
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
    counter++;
    console.log(counter);
    if(counter > 100) {
      throw new Error('Infinite loop');
    }
    crossword = [];
    let topRowWord = findRandomWord(data);
    crossword.push(topRowWord);

    let leftColumnWords = findWordsThatMatchOneLetter(data, topRowWord.charAt(0));
    let leftColumnWord = leftColumnWords[Math.floor(Math.random() * leftColumnWords.length)];
    crossword.push(leftColumnWord);

    let middleRowWords = findWordsThatMatchOneLetter(data, leftColumnWord.charAt(1));
    let middleRowWord = middleRowWords[Math.floor(Math.random() * middleRowWords.length)];
    crossword.push(middleRowWord);

    let middleColumnWords = findWordsThatMatchTwoLetters(data, topRowWord.charAt(1) + middleRowWord.charAt(1));
    if(middleColumnWords.length === 0) {
      continue;
    }
    let middleColumnWord = middleColumnWords[Math.floor(Math.random() * middleColumnWords.length)];
    crossword.push(middleColumnWord);

    let rightColumnWords = findWordsThatMatchTwoLetters(data, topRowWord.charAt(2) + middleRowWord.charAt(2));
    if(rightColumnWords.length === 0) {
      continue;
    }
    let rightColumnWord = rightColumnWords[Math.floor(Math.random() * rightColumnWords.length)];
    crossword.push(rightColumnWord);
    
    if(checkWord(data, crossword[1].charAt(2) + crossword[3].charAt(2) + crossword[4].charAt(2))) {
      crossword.push(crossword[1].charAt(2) + crossword[3].charAt(2) + crossword[4].charAt(2));
      done = true;
    }
  }

  return crossword;
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
      console.log(fillCrossword(data));
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

fetchJSONFile('data\\hard_list.json');