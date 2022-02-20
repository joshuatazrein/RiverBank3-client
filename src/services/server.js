import initialData from '../assets/json/initialData.json';
const Axios = require('axios');

export function uploadSettings() {
  // upload settings to mySQL
  console.log('uploading data...');
  Axios.post('/server/uploadsettings', {
    username: window.username,
    encryptedPassword: window.password,
    data: window.data.settings,
  }).then((result) => {
    console.log(result.data);
  }).catch((err) => {
    console.log(err);
  });
}

export function uploadTasks() {
  // upload all tasks
  console.log('uploading tasks...', window.password, window.username, window.data.tasks);
  Axios.post('/server/uploadtasks', {
    username: window.username,
    encryptedPassword: window.password,
    data: window.data.tasks,
  }).then((result) => {
    console.log(result.data);
  }).catch((err) => {
    console.log(err);
  });
}

export function uploadData() {
  // upload data to mySQL
  uploadSettings();
  uploadTasks();
}

export function initializeData() {
  // upload a clean copy of the data to the server
  window.data = initialData;
  // fix the date view to include today's date instead of the initial one
  window.data.tasks['1'].title = new Date().toDateString();
  // upload to thing
  uploadData();
}

export function testLargeData() {
  Axios.post('/server/largeposttest', {
    username: window.username,
    encryptedPassword: window.password,
    data: window.data.tasks,
  }).then((result) => {
    console.log(result.data);
  }).catch((err) => {
    console.log(err);
  });
}