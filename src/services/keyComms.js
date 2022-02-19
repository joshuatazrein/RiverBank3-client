import * as display from './display';
import * as edit from './edit';
import $ from 'jquery';
import Task from '../components/Task/Task';
import List from '../components/List/List';

export function keyComms(ev) {
  if (!ev.ctrlKey) {
    if (ev.key === 'Enter' && !window.preventReturn) {
      ev.preventDefault();
      if (ev.shiftKey) {
        edit.newTask('task');
      } else {
        edit.newTask();
      }
      return;
    } else if (ev.key === 'Escape' && !window.preventReturn) {
      ev.preventDefault();
      if (window.app.current.state.displayTable !== 'none') display.displayTable();
      document.activeElement.blur();
      if (window.selected) {
        edit.save(window.selected, 'task');
        if (window.selected instanceof Task &&
          window.selected.state.displayOptions === 'show') {
          window.selected.displayOptions('hide');
        } else {
          window.selected = undefined;
        }
      }
      return;
    }
  }
  if (ev.ctrlKey && ev.shiftKey) {
    switch (ev.key) {
      case 'V':
        edit.pasteTask('task');
        break;
      case 'N':
        edit.newTask('task');
        break;
      case 'F':
        ev.preventDefault();
        display.zoom();
        break;
      case 'C':
        // mirror task
        edit.copyTask(true);
        break;
      default:
        break;
    }
  } else if (ev.ctrlKey) {
    switch (ev.key) {
      case 'x':
        ev.preventDefault();
        edit.cutTask();
        break;
      case 'c':
        ev.preventDefault();
        edit.copyTask();
        break;
      case 'v':
        ev.preventDefault();
        edit.pasteTask();
        break;
      case 'n':
        ev.preventDefault();
        edit.newTask();
        break;
      case ']':
        ev.preventDefault();
        edit.indentTask();
        break;
      case '[':
        ev.preventDefault();
        edit.indentTask(true);
        break;
      case 'f':
        ev.preventDefault();
        display.focus();
        break;
      case 'z':
        ev.preventDefault();
        edit.undo();
        break;
      case 'r':
        ev.preventDefault();
        display.updateAllSizes();
        break;
      case 'Backspace':
        ev.preventDefault();
        if (window.selected && window.selected instanceof Task) {
          window.selected.deleteThis();
        } else if (window.selected && window.selected instanceof List &&
          window.selected.props.parent.props.id === 'bank') {
          const confirm = window.confirm('delete this list?');
          if (confirm) {
            const subtasks = window.selected.props.parent.state.subtasks;
            edit.saveUndo();
            subtasks.splice(
              subtasks.findIndex(x => x === window.selected.props.id), 1);
            window.selected.props.parent.setState({ subtasks: subtasks });
          }
        }
        break;
      case 'w':
        ev.preventDefault();
        if (window.selected.props.parent.props.id !== 'river') {
          edit.moveTask(-1);
        }
        break;
      case 's':
        ev.preventDefault();
        if (window.selected.props.parent.props.id !== 'river') {
          edit.moveTask(1);
        }
        break;
      case 'a':
        ev.preventDefault();
        display.switchView(-1);
        break;
      case 'd':
        ev.preventDefault();
        display.switchView(1);
        break;
      case 'h':
        ev.preventDefault();
        window.app.current.toggleComplete();
        break;
      case 't':
        ev.preventDefault();
        if (window.app.current.state.zoomed === 'zoomed') return;
        display.goToToday();
        break;
      case '1':
        ev.preventDefault();
        if (window.selected instanceof Task) {
          window.selected.toggleComplete(false);
        }
        break;
      case '2':
        ev.preventDefault();
        if (window.selected instanceof Task) {
          window.selected.toggleImportant(false);
        }
        break;
      case '3':
        ev.preventDefault();
        if (window.selected instanceof Task) {
          window.selected.toggleMaybe(false);
        }
        break;
      case 'i':
        ev.preventDefault();
        if (window.selected && window.selected instanceof Task) {
          window.selected.displayOptions({ target: $('<p></p>') });
          if (window.selected.state.displayOptions === 'hide') {
            window.selected.editBar.current.focus();
          }
        };
        break;
      default:
        break;
    }
  }
}