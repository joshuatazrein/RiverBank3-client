import initialData from '../assets/json/initialData.json';
const Axios = require('axios');

// set task in window.data and mirror that on the server
export function setTaskData(id, value) {

  // set the task & upload to mySQL
  window.data.tasks[id] = value;
  Axios.post('/server/settaskdata', {
    id: id,
    value: value,
    username: window.username,
    encryptedPassword: window.password
  }).then((result) => {
    console.log('set task data', result.data);
  }).catch((err) => {
    console.log(err);
  });

}

// remove task from window.data and mirror that on the server
export function removeTaskData(id) {

  // abort if it's already gone
  if (!window.data.tasks[id]) return;

  // remove the task from deadlines if it is there
  const removeDeadline = (list) => {
    for (let x of Object.keys(list)) {
      // switch it out of things
      let deadlineList = list[x];
      if (deadlineList.includes(id)) {
        deadlineList =
          deadlineList.splice(deadlineList.findIndex(x => x === id), 1);
      }
    }
  };
  removeDeadline(window.data.settings.deadlines);
  removeDeadline(window.data.settings.startdates);

  // delete the first task & upload to mySQL
  const subtasks = window.data.tasks[id].subtasks;
  delete window.data.tasks[id];
  Axios.post('/server/removetaskdata', {
    id: id,
    username: window.username,
    encryptedPassword: window.password
  }).then((result) => {
    console.log('removed task data', result.data);
  }).catch((err) => {
    console.log(err);
  });

  // search for any subtasks and recursively delete them & their subtasks
  for (let subtask of subtasks) {
    removeTaskData(subtask);
  }
}

export function uploadSettings() {

  // upload settings to mySQL
  console.log('uploading settings...');
  Axios.post('/server/uploadsettings', {
    username: window.username,
    encryptedPassword: window.password,
    data: window.data.settings,
  }).then((result) => {
    console.log('uploaded settings', result.data);
  }).catch((err) => {
    console.log(err);
  });
}

export function uploadTasks() {

  // upload all tasks
  console.log('uploading tasks...', window.password, window.username, window.data.tasks);

  // wipe all tasks
  Axios.post('/server/uploadtasks', {
    username: window.username,
    encryptedPassword: window.password,
    data: {},
  }).then((result) => {
    console.log('uploaded tasks', result.data);
  }).catch((err) => {
    console.log(err);
  });

  // one by one update the new tasks
  for (let task of Object.keys(window.data.tasks)) {
    setTaskData(task, window.data.tasks[task]);
  }
}

export function uploadData() {

  // upload data to mySQL
  uploadSettings();
  uploadTasks();
}

// sample upload which just returns result (for testing post max size)
export function testLargeUpload() {

  // upload & return result
  console.log('testing large upload...', window.data.tasks);
  Axios.post('/server/posttest', {
    username: window.username,
    encryptedPassword: window.password,
    data: window.data.tasks,
  }).then((result) => {
    console.log('tested large upload', result.data);
  }).catch((err) => {
    console.log(err);
  });
}

// initialize new user's data
export function initializeData() {

  // upload a clean copy of the data to the server
  window.data = initialData;

  // fix the date view to include today's date instead of the initial one
  window.data.tasks['1'].title = new Date().toDateString();

  // upload to thing
  uploadData();
}