import React from 'react';
import './TaskList.css';
import * as util from '../../services/util';
import Task from '../Task/Task';

export default class TaskList extends React.Component {
  render() {
    this.subtaskObjects = [];
    // subtasks are filtered for deleted tasks
    const tasksListed = this.props.subtasks.filter(x =>
      window.data.tasks[util.stripR(x)]).map((x, index) => {
        this.subtaskObjects.push(React.createRef());
        const task = (
          <Task
            key={x}
            id={x}
            info={window.data.tasks[util.stripR(x)].info}
            title={window.data.tasks[util.stripR(x)].title}
            subtasks={window.data.tasks[util.stripR(x)].subtasks}
            parent={this.props.parent}
            ref={this.subtaskObjects[this.subtaskObjects.length - 1]}
            index={index}
          />
        )
        return task;
      })
    let parent = this.props.parent;
    let id = [];
    while (parent) {
      id.push(parent.props.id);
      parent = parent.props.parent;
    }
    id = id.reverse().join('-');
    return (
      <ul className='listContent'>
        {tasksListed}
      </ul>
    )
  }
}