// require native modules
// const fs = require("fs");
// const path = require("path");
import fs, { read } from "fs";
import path from "path";
import { fileURLToPath } from 'url';

import percentPassing from '../lib/percent-pass.js';
import testGenerator from '../lib/test-generator.js';
import { dir } from "console";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = JSON.parse(fs.readFileSync(path.normalize(path.join(__dirname, '..', 'config.json')), 'utf-8'));

// declare constants
const EXERCISES_DIR = path.normalize(path.join(__dirname, '..', config.path));
const PARENT_DIR = path.normalize(path.join(__dirname, '..'));

// make sure the exercises directory exists
try {
  fs.accessSync(EXERCISES_DIR);
} catch (err) {
  console.log(`--- creating ${config.path} directory ---`);
  fs.mkdirSync(EXERCISES_DIR);
};

// a function for prettier logs, not very important
const removeDirname = dirName => dirName.split(PARENT_DIR).join('  ...  ');

// the function that will create an object with the same file paths as your /exercises folder
const register = async function (dirPath) {
  const dirs = [];

  // get an array of all file names in the directory
  const paths = fs.readdirSync(dirPath);

  for (let nextPath of paths) {

    // is the next path a directory or a file?
    const isDirectory = fs.statSync(path.normalize(path.join(dirPath, nextPath))).isDirectory();
    // if it is a file, and not a javascript file, or md file, skip it
    if (nextPath.includes('.git')) { continue };

    let subDirReport = {};
    if (isDirectory) {

      const subPath = path.normalize(path.join(dirPath, nextPath));
      const readmePath = path.normalize(path.join(subPath, 'README.md'));
      const indexPath = path.normalize(path.join(subPath, 'index.js'));
      const starterPath = path.normalize(path.join(subPath, 'starter.js'));
      const hasIndex = fs.existsSync(indexPath);
      const hasReadme = fs.existsSync(readmePath);
      const hasStarterFile = fs.existsSync(starterPath);


      let exercise = null;
      if (hasIndex) {
        try {
          exercise = (await import(indexPath)).default;
        } catch (err) {
          console.error(err)
        }
      }

      if (exercise) {
        subDirReport = {
          // readme: hasReadme,
          solution: exercise.solution && typeof exercise.solution === 'function',
          args: exercise.args && typeof exercise.args === 'function',
          starter: (exercise.starter && typeof exercise.starter === 'string')
            ? 'snippet'
            : hasStarterFile
              ? 'file'
              : 'none',
          // name: typeof exercise.name === 'string' ? exercise.name : undefined,
        };
      }

      if (subDirReport.solution && subDirReport.args) {
        const tests = testGenerator({ solution: exercise.solution, args: exercise.args, length: 100 });
        if (subPath.includes('concatenate')) {
          console.log(JSON.stringify(tests, null, '  '));
        }
        const score = percentPassing(exercise.solution, tests);
        subDirReport.passing = score;

      }


      if (hasReadme) {
        const percent = subDirReport.passing;
        const newReport = '\n'
          // + (subDirReport.name ? `> - name: ${subDirReport.name} \n` : '')
          + `> - solution: ${subDirReport.solution ? 'ok' : 'not a function'} \n`
          + `> - args: ${subDirReport.args ? 'ok' : 'not a function'} \n`
          + `> - passing: ${typeof percent === 'number'
            ? percent + '%'
            : 'N/A'} \n`
          + (subDirReport.starter ? `> - starter: ${subDirReport.starter} \n` : '')
          + `> - ${(new Date()).toLocaleString()}\n`;

        const readme = fs.readFileSync(readmePath, 'utf-8');

        const reportRegex = /(<!--[ \t]*BEGIN REPORT[ \t]*-->)([^;]*)(<!--[ \t]*END REPORT[ \t]*-->)/;
        const reportReplacer = `<!-- BEGIN REPORT -->${newReport}<!-- END REPORT -->`;
        const newReadme = readme.match(reportRegex)
          ? readme.replace(reportRegex, reportReplacer)
          : `${reportReplacer}\n\n${readme}`;

        fs.writeFileSync(readmePath, newReadme);
      }

      // recursively register the path if it's a directory
      //  this will create a virtual folder structure for this path
      const subDir = await register(path.normalize(path.join(dirPath, nextPath)));
      if (exercise && subDirReport.args && subDirReport.solution) {
        subDir.isExercise = true;
      }
      subDir.report = subDirReport;
      if (subDir) {
        // add the registered sub-directory to the current virtual directory
        dirs.push(subDir);
      };

    }
  };
  // create the new virtual directory object
  const virDir = {
    //  convert the absolute path to a relative path using unix file separators
    path: '/' + dirPath
      .split(path.sep).join('/')
      .split('/').pop(),
  };

  // add the virtual files & sub-directories if they exist
  if (dirs.length > 0) { virDir.dirs = dirs; }

  // return the new virtual directory
  return virDir;
};


console.log('\n--- registering .js files in ' + removeDirname(EXERCISES_DIR) + ' ---\n');

// register the /exercises directory
register(EXERCISES_DIR)
  .then(registered => {
    // merge the repository config into the virtual directory
    registered.config = config;
    // set the date/time of last build
    registered.lastBuild = (new Date()).toJSON();

    console.log('\n--- writing /index.json ---\n');

    // write the file
    const stringifiedReg = JSON.stringify(registered, null, '  ');
    fs.writeFileSync(path.normalize(path.join('index.json')), stringifiedReg);
  })
  .catch(err => console.error(err));
