import initialData from '../assets/json/initialData.json';
const Axios = require('axios');
var fs = require('browserify-fs');

export function uploadSettings() {
  // upload settings to mySQL
  uploadData();
}

export function uploadTasks() {
  // upload all tasks
  uploadData();
}

export function uploadData() {
  // upload data to mySQL
  console.log('uploading data...');
  fs.writeFile(`/data/${window.password}.json`, JSON.stringify(window.data));
  console.log('uploaded data', window.data);
}

export function initializeData() {
  // upload a clean copy of the data to the server
  window.data = initialData;
  // fix the date view to include today's date instead of the initial one
  window.data.tasks['1'].title = new Date().toDateString();
  // upload to thing
  uploadData();
}

export function loadData() {
  // load data
  const data = fs.readFile(`/data/${window.password}.json`).toString();
  window.data = JSON.parse(data);
  console.log('downloaded data');
}