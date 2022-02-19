import $ from 'jquery';
import * as edit from './edit';
import * as util from './util';
import * as server from './server';
import Task from '../components/Task/Task';

export function checkTimes() {
  const today = new Date();
  const now = [today.getHours(), today.getMinutes()];
  const dateString = today.toDateString();
  const list = window.data.tasks[Object.keys(window.data.tasks)
    .find(x => window.data.tasks[x].title === dateString)];
  if (!list) return;
  const todayList = list.subtasks;
  for (let task of todayList) {
    const taskEntry = window.data.tasks[util.stripR(task)];
    if (taskEntry.info.type === 'event' &&
      taskEntry.info.complete !== 'complete' &&
      !taskEntry.info.startDate.includes('--')) {
      if (
        taskEntry.info.startDate[0] === now[0] &&
        taskEntry.info.startDate[1] === now[1]
      ) {
        Notification.requestPermission();
        new Notification('Event: ' + taskEntry.title);
        break;
      } else {
        const newDate = new Date();
        newDate.setHours(taskEntry.info.startDate[0]);
        newDate.setMinutes(taskEntry.info.startDate[1]);
        newDate.setMinutes(newDate.getMinutes() - 15);
        if (
          taskEntry.info.type === 'event' && 
          newDate.getHours() === now[0] &&
          newDate.getMinutes() === now[1]
        ) {
          Notification.requestPermission();
          new Notification('in 15: ' + taskEntry.title);
        }
      }
    }
  }
}

export function switchView(direction) {
  if (!window.selected) return;
  let parent = window.selected;
  while (parent instanceof Task) {
    parent = parent.props.parent;
  }
  parent.props.parent.changeIndex(direction);
  updateAllSizes();
}

export function toggleMode() {
  if (window.data.settings.mode === 'night') {
    window.data.settings.mode = 'day';
  } else {
    window.data.settings.mode = 'night';
  }
  setTheme(window.data.settings.theme);
  server.uploadSettings();
}

export function toggleSounds() {
  if (window.data.settings.sounds === 'false') {
    window.data.settings.sounds = 'true';
    alert('sounds on');
  } else {
    window.data.settings.sounds = 'false';
    alert('sounds off');
  }
}

export function focus(set) {
  var focusSet;
  if (set !== undefined) {
    focusSet = set;
  } else {
    if (window.app.current.state.bank.current.state.info.focused === 'focused') {
      focusSet = '';
    } else {
      focusSet = 'focused';
    }
  }
  if (window.selected) {
    // set the index of the focused list to the window.selected list
    let focusView = window.selected
    while (focusView instanceof Task) {
      focusView = focusView.props.parent;
    }
    focusView.props.parent.changeIndex(focusView.props.parent.frames
      .findIndex(x => x.current.props.id === focusView.props.id));
  }
  window.app.current.state.bank.current.setState(prevState => (
    {
      info: {
        ...prevState.info,
        focused: focusSet,
      },
      width: processWidth(focusSet)
    }));
  window.app.current.state.river.current.setState(prevState => (
    {
      info: {
        ...prevState.info,
        focused: focusSet,
      },
      width: processWidth(focusSet),
    }));
  edit.saveSetting('focused', focusSet);
  updateAllSizes();
}

export function updateAllSizes() {
  function update(list) {
    if (list.current instanceof Task) { list.current.updateHeight(); }
    for (let task of list.current.taskList.current.subtaskObjects) {
      update(task);
    }
  }
  const riverLists = window.app.current.state.river.current.frames;
  const bankLists = window.app.current.state.bank.current.frames;
  for (let list of riverLists.concat(bankLists)) {
    update(list);
  }
}

export function setTheme(theme) {
  const newTheme = window.themes[theme + '-' +
    window.data.settings.mode];
  for (let key of Object.keys(newTheme)) {
    document.documentElement.style.setProperty(
      key, newTheme[key]
    );
  }
  window.data.settings.theme = theme;
  server.uploadSettings();
  setTimeout(updateAllSizes, 100);
}

export function displayTable() {
  if (window.app.current.state.displayTable === 'none' && window.selected) {
    window.app.current.setState({displayTable: 'true'});
  } else {
    window.app.current.setState({displayTable: 'none'});
  }
}

export function playSound(sound) {
  if (window.data.settings.sounds === 'true') {
    sound.play();
  }
}

export function processWidth(focused) {
  var width;
  if (focused !== 'focused') {
    width = Math.floor(window.innerWidth / 250);
    $(':root').css('--frameWidth',
      ((window.innerWidth - 40) / width) + 'px');
  } else {
    // focus mode
    width = 1;
    $(':root').css('--frameWidth', 'calc(100% - 24px)');
  }
  return width;
}

export function goToToday() {
  searchDate(new Date().toDateString());
}

export function searchDate(text, type) {
  setTimeout(() => {
    window.app.current.statusBar.current.search({ target: { value: text } });
    window.app.current.statusBar.current.goToFirst();
  }, 100);
}

export function zoom() {
  // zoom everything upwards
  var zoomedSetting;
  if (window.app.current.state.zoomed === 'zoomed') {
    zoomedSetting = '';
  } else {
    zoomedSetting = 'zoomed';
    if (!window.selected) { return }; // no zoomie
  }
  var zoomFrame = util.getFrame(window.selected);
  zoomFrame.setState({ zoomed: zoomedSetting });
  window.app.current.setState({ zoomed: zoomedSetting });
  if (!window.zoomed) {
    // unzoom
    window.zoomed = window.selected;
  } else {
    window.zoomed = undefined;
  }
  setTimeout(
    updateAllSizes, 200
  )
}