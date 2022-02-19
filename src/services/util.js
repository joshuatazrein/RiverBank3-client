import Task from '../components/Task/Task';

export function getFrame(task) {
  let parent = task;
  while (parent.props.parent) {
    parent = parent.props.parent;
  }
  return parent;
}

export function getList(task) {
  let parent = task;
  while (parent instanceof Task) {
    parent = parent.props.parent;
  }
  return parent;
}

export function stripR(x) {
  if (x.charAt(0) === 'R') {
    return x.slice(1);
  } else {
    return x;
  }
}

export function consoleLog(x) {
  console.log(x);
}

export function getSubtasks(object) {
  if (object.subtasksCurrent) return object.subtasksCurrent;
  else return object.state.subtasks;
}

export function dateFormat(title) {
  // reformat dateString (Day Mon -- ----) to usable title
  return title.slice(0, 4) +
    title.slice(8, 10);
}

export function getTime(timeList) {
  let currentTime = timeList[0] * 60 + timeList[1];
  if (currentTime <= 180) currentTime += 1440;
  return currentTime;
}