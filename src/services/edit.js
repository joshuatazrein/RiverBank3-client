import * as display from './display';
import * as util from './util';
import * as server from './server';
import Task from '../components/Task/Task';
import List from '../components/List/List';
import TaskList from '../components/TaskList/TaskList';
import Frame from '../components/Frame/Frame';

// TODO: move to saving or somewhere else

export function save(task, saveType) {
  // save the new window.data
  var saveObject;
  if (saveType === 'list') {
    saveObject = task.props.parent;
  } else {
    saveObject = task;
  }
  var subtasks;
  if (saveObject.subtasksCurrent) subtasks = saveObject.subtasksCurrent;
  else subtasks = saveObject.state.subtasks;
  try {
    window.data.tasks[util.stripR(saveObject.props.id)] = {
      title: saveObject.state.title,
      info: saveObject.state.info, subtasks: subtasks
    };
  } catch (err) {
    return;
  }
  server.uploadTasks();
}

export function saveSetting(setting, value) {
  window.data.settings[setting] = value;
  server.uploadSettings();
}

export function saveUndo() {
  window.undoData = JSON.parse(JSON.stringify(window.data));
}

export function undo() {
  window.data = window.undoData;
  server.uploadData();
  setTimeout(() => window.location.reload(), 500);
}

// main funcs

export function deleteTask() {
  if (window.selected && window.selected instanceof Task) {
    saveUndo();
    window.selected.deleteThis();
  }
}

export function newTask(type) {
  // create new task after window.selected
  if (!window.selected || window.preventReturn) return;

  const today = new Date();
  const now = today.getTime();
  const newTask = String(now);
  window.data.tasks[newTask] = {
    info: { complete: '', startDate: '', endDate: '' },
    title: '',
    subtasks: [],
  };
  window.copiedTask = newTask;
  pasteTask(type);
}

export function selectTask(el, force) {
  // make this task window.selected
  if (window.preventSelect) return
  if (el instanceof TaskList) {
    return
  }
  window.preventSelect = true;
  setTimeout(function () { window.preventSelect = false }, 100);
  if (window.selected) {
    save(window.selected, 'task');
  }
  if (window.selected === el && !force) {
    return;
  }
  if (window.selected instanceof Task && window.selected !== el) {
    window.selected.displayOptions({ target: undefined }, 'hide');
  }
  window.selected = el;
  if (el instanceof Task) {
    el.editBar.current.focus();
  } else if (el instanceof List) {
    el.listInput.current.focus();
  }
}

export function cutTask() {
  if (!window.selected || window.selected instanceof List) return;
  copyTask();
  window.selected.deleteThis(false);
  saveUndo();
}

export function copyTask(mirror) {
  if (!window.selected || window.selected instanceof List) return;
  save(window.selected);
  if (mirror) {
    window.copiedTask = window.selected.props.id;
  } else {
    // only copy window.data
    const today = new Date();
    const now = today.getTime();
    const newTask = String(now);
    window.data.tasks[newTask] = { ...window.data.tasks[util.stripR(window.selected.props.id)] };
    window.copiedTask = newTask;
  }
}

export function pasteTask(type) {
  if (!window.selected || !window.copiedTask) return;
  saveUndo();
  if (window.selected instanceof List || type === 'task') {
    const subtasks = window.selected.state.subtasks;
    subtasks.splice(0, 0, window.copiedTask);
    window.selected.setState({ subtasks: subtasks });
    save(window.selected, 'task');
  } else if (window.selected instanceof Task || type === 'list') {
    const subtasks = window.selected.state.parent.state.subtasks;
    const insertIndex = subtasks.findIndex(x => x === window.selected.props.id) + 1;
    subtasks.splice(insertIndex, 0, window.copiedTask);
    window.selected.state.parent.setState({ subtasks: subtasks });
    save(window.selected, 'list');
  }
}

export function indentTask(unindent) {
  // umm fix sometime
  if (!window.selected) return;
  const lastSelected = window.selected;
  save(window.selected);
  const subtasks =
    window.selected.props.parent.taskList.current.subtaskObjects;
  const here = subtasks
    .findIndex(x => 
    util.stripR(x.current.props.id) === util.stripR(window.selected.props.id));
    if (unindent !== true) {
    if (here === 0) return;
    const taskAbove = subtasks[here - 1].current;
    const theseSubtasks = util.getSubtasks(taskAbove);
    theseSubtasks.push(window.selected.props.id);
    const previousSubtasks = util.getSubtasks(window.selected.props.parent);
    previousSubtasks.splice(here, 1);
        taskAbove.setState( { subtasks: theseSubtasks });
        lastSelected.props.parent.setState({ subtasks: previousSubtasks });
        save(taskAbove);
        save(lastSelected.props.parent);
      } else {
    if (window.selected.props.parent.props.parent instanceof Frame) return;
    const subtasks = window.selected.props.parent.props.parent
      .taskList.current.subtaskObjects;
    const here = subtasks.findIndex(
      x => x.current.props.id === window.selected.props.parent.props.id);
    const theseSubtasks = window.selected.props.parent.props.parent.state.subtasks;
    theseSubtasks.splice(here + 1, 0, window.selected.props.id);
        window.selected.props.parent.props.parent.setState({ subtasks: theseSubtasks });
    save(window.selected.props.parent.props.parent);
    const parentSubtasks = util.getSubtasks(lastSelected.props.parent);
    parentSubtasks.splice(parentSubtasks.findIndex(x => 
      x === lastSelected.props.id), 1);
    lastSelected.props.parent.setState({ subtasks: parentSubtasks });
    save(lastSelected.props.parent);
  }
}

export function moveTask(direction) {
  if (!window.selected) return;
  var subtasks;
  if (window.selected.props.parent.subtasksCurrent) {
    subtasks = window.selected.props.parent.subtasksCurrent.concat();
  } else {
    subtasks = window.selected.props.parent.state.subtasks;
  }
  let selectedPlace =
    subtasks.findIndex(x => x === window.selected.props.id);
  if (selectedPlace === 0 && direction === -1) return;
  else if (selectedPlace === subtasks.length
    && direction === 1) return;
  var subtasksChopped;
  if (direction === -1) {
    subtasksChopped = subtasks.slice(0, selectedPlace).reverse();
  } else {
    subtasksChopped = subtasks.slice(selectedPlace + 1);
  }
  var insertPlace;
  if (window.data.settings.hideComplete === 'hideComplete') {
    insertPlace = (subtasksChopped.findIndex(x =>
      window.data.tasks[util.stripR(x)].info.complete !== 'complete') + 1) * direction;
  } else {
    insertPlace = 1 * direction;
  }
  const spliceTask = subtasks.splice(selectedPlace, 1)[0];
  subtasks.splice(selectedPlace + insertPlace, 0, spliceTask);
  window.selected.props.parent.setState({ subtasks: subtasks });
  save(window.selected.props.parent, 'task');
}

export function listEdit(type) {
  if (!window.selected) {
    alert('select a list');
    return;
  }
  if (type === 'migrate' && util.getFrame(window.selected).props.id === 'bank') {
    alert('select a date');
    return;
  }
  var incompleteTasks = [];
  var subtasksCurrent = util.getList(window.selected).subtasksCurrent;
  function addIncomplete(task) {
    for (let x of task.taskList.current.subtaskObjects) {
      addIncomplete(x.current);
      if (x.current.state.info.complete !== 'complete') {
        if (type === 'clear') {
          x.current.toggleComplete();
          x.current.displayOptions({target: undefined}, 'hide');
          save(x.current);
        } else if (type === 'migrate' && 
          x.current.props.id.charAt(0) !== 'R') {
          incompleteTasks.push(x.current.props.id);
          subtasksCurrent.splice(subtasksCurrent
            .findIndex(y => y === x.current.props.id), 1);
        }
      }
    }
  }
  addIncomplete(util.getList(window.selected));
  if (type === 'migrate') {
    const tomorrow = new Date(util.getList(window.selected).state.title);
    tomorrow.setDate(tomorrow.getDate() + 1);
    util.getList(window.selected).setState({
      subtasks: subtasksCurrent
    });
    save(util.getList(window.selected));
    display.searchDate(tomorrow.toDateString());
    setTimeout(() => {
      window.selected.setState(
        { subtasks: window.selected.subtasksCurrent.concat(incompleteTasks) });
      save(window.selected);
    }, 500);
  }
}