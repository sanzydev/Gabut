import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";
import chalk from "chalk";
import boxen from "boxen";

const path = "./data.json";
const TOTAL_COMMITS = 1000;

const displayUI = (message, type = "info") => {
  const colors = {
    info: "blue",
    success: "green",
    warning: "yellow",
    error: "red",
  };
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: colors[type],
    backgroundColor: "#555555",
  };
  
  console.log(boxen(chalk[colors[type]](message), boxenOptions));
};

const createSANZYPattern = () => {
  displayUI(`🚀 Creating SANZY pattern with exactly ${TOTAL_COMMITS} commits...`, "info");
  
  const pattern = [
    [1,1,1,1,0,0,1,1,1,0,0,1,0,0,1,0,1,1,1,1,0,1,0,0,1],
    [1,0,0,0,0,1,0,0,1,0,1,1,0,1,0,0,0,0,1,0,0,1,0,1,0],
    [1,1,1,1,0,1,1,1,1,0,1,0,1,0,0,0,0,1,0,0,0,0,1,0,0],
    [0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1,0,0,0,0,1,0,1,0],
    [1,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,1,0,1,0,0,1,0]
  ];
  
  let activeCount = 0;
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[0].length; col++) {
      if (pattern[row][col] === 1) {
        activeCount++;
      }
    }
  }
  
  const commitsPerCell = Math.floor(TOTAL_COMMITS / activeCount);
  const extraCommits = TOTAL_COMMITS - (commitsPerCell * activeCount);
  
  displayUI(`Pattern has ${activeCount} active cells. Each will get ${commitsPerCell} commits.`, "info");
  if (extraCommits > 0) {
    displayUI(`${extraCommits} extra commits will be distributed to the first cells.`, "info");
  }
  
  const startDate = moment().subtract(44, "weeks");
  let cellsDone = 0;
  let commitsDone = 0;
  
  const processCells = () => {
    const activeCells = [];
    
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[0].length; col++) {
        if (pattern[row][col] === 1) {
          activeCells.push({row, col});
        }
      }
    }
    
    processNextCell(activeCells, 0);
  };
  
  const processNextCell = (cells, index) => {
    if (index >= cells.length || commitsDone >= TOTAL_COMMITS) {
      displayUI(`🎉 All ${commitsDone} commits completed!`, "success");
      simpleGit().push();
      return;
    }
    
    const cell = cells[index];
    const { row, col } = cell;
    const date = moment(startDate).add(col, "weeks").add(row, "days").format();
    
    const thisCellCommits = index < extraCommits 
      ? commitsPerCell + 1 
      : commitsPerCell;
    
    cellsDone++;
    
    displayUI(`Processing cell [${row},${col}] (${cellsDone}/${cells.length}) with ${thisCellCommits} commits`, "info");
    
    makeCommitsForCell(date, row, col, thisCellCommits, 0, () => {
      processNextCell(cells, index + 1);
    });
  };
  
  const makeCommitsForCell = (date, row, col, total, current, callback) => {
    if (current >= total || commitsDone >= TOTAL_COMMITS) {
      callback();
      return;
    }
    
    commitsDone++;
    current++;
    
    const data = {
      date: date,
      commit: {
        message: `SANZY ${commitsDone}/${TOTAL_COMMITS}`,
        author: "latesturltech@gmail.com",
        branch: "main",
      },
    };
    
    process.stdout.write(`\r${chalk.cyan('➜')} Commit ${chalk.yellow(commitsDone)}/${chalk.green(TOTAL_COMMITS)} for cell [${row},${col}]`);
    
    jsonfile.writeFile(path, data, () => {
      simpleGit().add([path]).commit(data.commit.message, { "--date": date }, () => {
        if (commitsDone % 50 === 0) {
          simpleGit().push().then(() => {
            setTimeout(() => makeCommitsForCell(date, row, col, total, current, callback), 100);
          });
        } else {
          setTimeout(() => makeCommitsForCell(date, row, col, total, current, callback), 50);
        }
      });
    });
  };
  
  processCells();
};

displayUI(
  "🚀 Starting SANZY Pattern Generator\n" +
    chalk.yellow(`Target: Exactly ${TOTAL_COMMITS} commits\n`) +
    chalk.yellow("Author: latesturltech@gmail.com\n") +
    chalk.yellow("Version: 4.0.0"),
  "info"
);

createSANZYPattern();