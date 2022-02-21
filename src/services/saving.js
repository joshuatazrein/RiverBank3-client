import $ from 'jquery';
import * as util from './util';
import * as server from './server';

export function reset() {
  var accept = window.confirm('Are you sure you want to reset all data?');
  if (accept) {
    server.initializeData();
    setTimeout(function () { window.location.reload() }, 200);
  }
}

export function restore() {
  window.preventReturn = true;
  const textarea = $('<textarea class="restore"></textarea>');
  $('#root').append(textarea);
  textarea.on('keydown', ev => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      try {
        window.data = JSON.parse(textarea.val());
      } catch (err) {
        alert('invalid JSON syntax');
        return;
      }
      // server.testLargeUpload();
      server.uploadData();
      setTimeout(window.location.reload, 500);
    } else if (ev.key === 'Escape') {
      textarea.remove();
      setTimeout(() => window.preventReturn = false, 100);
    }
  });
}

export function backup() {
  alert('open console to copy data (file download option will be added soon)');
  util.consoleLog(JSON.stringify(window.data));
}

export function clean() {
  // clean out tasks which aren't in lists
  for (let id of Object.keys(window.data.tasks).filter(x =>
    !['river', 'bank'].includes(x))) {
    let found = false;
    for (let containerId of Object.keys(window.data.tasks)) {
      if (
        window.data.tasks[containerId].subtasks.map(x =>
        util.stripR(x)).includes(id)
      ) {
        found = true;
        break;
      }
    }
    if (found === false) {
      server.removeTaskData(id);
    }
  }

  // clean out empty dates in the river view
  const dates = window.data.tasks['river'].subtasks;
  let i = dates.length - 1;
  const today = new Date().toDateString();

  while(window.data.tasks[dates[i]].subtasks.length === 0) {
    i --;
    const now = window.data.tasks[dates[i]].title;
    if (i == 0 || now === today) break;
  }
  if (i < dates.length - 1) {
    server.setTaskData(
      'river',
      { ...window.data.tasks['river'], subtasks: dates.slice(0, i + 1) }
    )
  }
}