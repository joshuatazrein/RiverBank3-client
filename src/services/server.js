import initialData from '../assets/json/initialData.json';
const Axios = require('axios');

export function uploadSettings() {
  // upload settings to mySQL
  Axios.post('http://localhost:3001/uploadsettings', {
    username: window.username,
    encryptedPassword: window.password,
    data: window.data.settings,
  });
}

export function uploadTasks() {
  // upload all tasks
  Axios.post('http://localhost:3001/uploadtasks', {
    username: window.username,
    encryptedPassword: window.password,
    data: window.data.tasks,
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
  localStorage.setItem('data', JSON.stringify(window.data));
}