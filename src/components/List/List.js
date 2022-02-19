import React from 'react';
import './List.css';
import * as display from '../../services/display';
import * as edit from '../../services/edit';
import * as util from '../../services/util';
import TaskList from '../TaskList/TaskList';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.taskList = React.createRef();
    this.state = {
      // filter subtasks here
      subtasks: props.subtasks,
      title: props.title,
      info: {}, zoomed: ''
    };
  }
  changeTitle(ev) {
    this.setState({ title: ev.target.value });
  }
  sortList() {
    // sort the given list by time
    let ordered = true;
    let currentTime = 0;
    for (let x of this.subtasksCurrent) {
      const task = window.data.tasks[util.stripR(x)];
      const thisTime = util.getTime(task.info.startDate);
      if (
        task.info.type === 'event' &&
        thisTime < currentTime
      ) {
        ordered = false;
        break;
      }
      currentTime = thisTime;
    }
    if (ordered) return;
    // sort the list
    let sortedList = [];
    let currentSort = ['start'];
    for (let task of this.subtasksCurrent) {
      const taskData = window.data.tasks[util.stripR(task)];
      if (taskData.info.type === 'event' && 
        !taskData.info.startDate.includes('--')) {
        sortedList.push(currentSort);
        currentSort = [];
        currentSort.push(task);
      } else {
        currentSort.push(task);
      }
    }
    sortedList.push(currentSort); // add last thing
    sortedList = sortedList.sort((a, b) => {
      if (a[0] === 'start' || a.length === 0) {
        a = a.splice(0, 1);
        return -1;
      } else if (b[0] === 'start' || b.length === 0) {
        b = b.splice(0, 1);
        return 1;
      } else {
        return util.getTime(window.data.tasks[util.stripR(a[0])].info.startDate) - 
          util.getTime(window.data.tasks[util.stripR(b[0])].info.startDate)
      }
    }).flat();
    this.subtasksCurrent = sortedList;
  }
  updateHeights = () => {
    return
    if (!this.taskList.current) return;
    const objects = this.taskList.current.subtaskObjects.filter(
      x => x.current.isComplete() !== 'complete'
    );
    for (
      let i = 0; i < objects.length - 1; i++
    ) {
      const thisObject = objects[i].current;
      const nextObject = objects[i + 1].current;
      let minHeight = 1;
      if (
        thisObject.state.info.type === 'event'
      ) {
        const endDate = thisObject.state.info.endDate;
        if (!endDate.includes('--')) {
          // rounded to 30 minutes
          minHeight = (endDate[0] * 60 + endDate[1]) / 60;
        } else if (nextObject.state.info.type === 'event') {
          // no end date
          const startDate = nextObject.state.info.startDate;
          if (!startDate.includes('--')) {
            const difference = 
              util.getTime(startDate) - util.getTime(thisObject.state.info.startDate);
            minHeight = difference / 60;
          }
        }
      }
      thisObject.setState({ minHeight: minHeight });
    }
    if (objects.length > 0) {
      let minHeight = 1;
      const lastObject = objects[objects.length - 1].current;
      const endDate = lastObject.state.info.endDate;
      if (lastObject.state.info.type === 'event' &&
        !endDate.includes('--')) {
        // rounded to 30 minutes
        minHeight = (endDate[0] * 60 + endDate[1]) / 60;
      }
      lastObject.setState({ minHeight: minHeight });
    }
  }
  dropTask = (ev, type) => {
    edit.selectTask(window.draggedTask);
    const listParent = window.selected.props.parent;
    edit.cutTask();
    edit.save(listParent, 'list');
    window.preventSelect = false;
    setTimeout(() => {
      edit.selectTask(this);
      if (type === 'subtask') {
        edit.pasteTask('task');
      } else if (type === 'task') {
        edit.pasteTask();
      }
    }, 100);
    this.setState({
      taskDrop: false,
      subtaskDrop: false,
    })
    ev.stopPropagation();
  }
  render() {
    var selectThis = () => {
      edit.selectTask(this);
    }
    this.changeTitle = this.changeTitle.bind(this);
    this.listInput = React.createRef();
    this.subtasksCurrent = this.state.subtasks.filter(x =>
      !(x.charAt(0) === 'R' && !this.props.repeats.includes(x)) &&
      window.data.tasks[util.stripR(x)]);
    if (this.props.parent.props.id === 'river') {
      for (let task of this.props.repeats) {
        if (!this.subtasksCurrent.includes(task) &&
          !this.subtasksCurrent.includes(util.stripR(task))) {
          this.subtasksCurrent.push(task);
        }
      }
    }
    if (util.getFrame(this).props.id === 'river') {
      this.sortList();
      setTimeout(this.updateHeights, 100);
    }
    const drop = (ev) => {
      edit.selectTask(window.draggedTask);
      const listParent = window.selected.props.parent;
      edit.cutTask();
      edit.save(listParent, 'list');
      window.preventSelect = false;
      setTimeout(() => {
        edit.selectTask(this);
        if (ev.metaKey) {
          edit.pasteTask('task');
        } else {
          edit.pasteTask();
        }
      }, 100);
      ev.stopPropagation();
    }
    const dragOver = (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'all';
    }
    const dragEnter = (ev) => {
      ev.dataTransfer.dropEffect = 'all';
    }
    const dragLeave = (ev) => {
      ev.dataTransfer.dropEffect = 'all';
    }
    return (
      <div className={'list ' + this.state.zoomed} onClick={selectThis}
        onContextMenu={selectThis}
      >
        <div className='listInputBackground'
          onDragEnter={() => {
            if (window.draggedTask.props.id === this.props.id) return;
            this.setState({taskDrop: true})
          }}
          onDragLeave={() => this.setState({taskDrop: false})}
          onDrop={(ev) => this.dropTask(ev, 'subtask')}
        >
          {this.props.parent.props.id === 'bank' ?
            <input className='listInput' value={this.state.title}
              onChange={this.changeTitle} ref={this.listInput}
              onDragOver={dragOver}
              onDragEnter={dragEnter}
              onDragLeave={dragLeave}
            ></input> :
            <input readOnly className='listInput listTitle'
              value={util.dateFormat(this.state.title)} ref={this.listInput}
              onDragOver={dragOver}
              onDragEnter={dragEnter}
            >
            </input>
          }
        </div>
        <div className='listFrame'>
          {this.props.parent.props.id === 'river' &&
            this.props.deadlines &&
            <ul>
              {this.props.deadlines.map(x => {
                try {

                return <li
                  className='deadline' key={String(x)}
                  onClick={() => display.searchDate(window.data.tasks[util.stripR(x)].title, 'start')}>
                  {window.data.tasks[util.stripR(x)].title}</li>;
                } catch {
                  return undefined;
                }
              })}
            </ul>}
          {this.props.parent.props.id === 'river' &&
            this.props.startdates &&
            <ul>
              {this.props.startdates.map(x => {
                return (<li
                  className='startdate' key={String(x)}
                  onClick={() => display.searchDate(window.data.tasks[util.stripR(x)].title,
                    'start')}>
                  {window.data.tasks[util.stripR(x)].title}</li>);
              })}
            </ul>}
          <div 
            className={`dropArea ${this.state.taskDrop ? 'droppable' : ''}`}
            onDragOver={dragOver}
          ></div>
          {<TaskList ref={this.taskList} subtasks={this.subtasksCurrent}
            parent={this} />}
        </div>
      </div>
    )
  }
}