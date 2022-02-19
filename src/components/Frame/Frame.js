import React from 'react';
import './Frame.css';
import * as display from '../../services/display';
import * as util from '../../services/util';
import List from '../List/List';
import $ from 'jquery';

export default class Frame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subtasks: props.subtasks, info: props.info,
      width: display.processWidth(props.info.focused),
      zoomed: '',
    };
    if (props.id === 'river') {
      this.state.repeats = window.data.settings.repeats;
      this.state.shownIndex = this.todayIndex();
    } else if (props.id === 'bank') {
      this.state.shownIndex = 0;
    }
  }

  // find index of today in shownLists
  todayIndex = () => {
    const today = new Date();
    return this.state.subtasks.findIndex(x => {
      const now = new Date(window.data.tasks[x].title);
      return now.getDate() === today.getDate() &&
        now.getMonth() === today.getMonth() &&
        now.getFullYear() === today.getFullYear()
    })
  }

  // create a new list
  addList = (id) => {
    // add a new list
    var title;
    if (this.props.id === 'river') {
      const lastDate = new Date(
        window.data.tasks[this.state.subtasks[this.state.subtasks.length - 1]].title);
      lastDate.setDate(lastDate.getDate() + 1);
      title = lastDate.toDateString();
    } else {
      title = '';
    }

    const subtasks = this.state.subtasks;
    if (!id) id = String(new Date().getTime());
    else id = String(id);
    window.data.tasks[id] = {
      title: title, subtasks: [], info: {}
    }
    subtasks.push(id);
    this.setState({subtasks: subtasks});
    setTimeout(() => {
      this.frames[this.frames.length - 1].current.listInput.current.focus();
    }, 100);
  }

  addLists = () => {
    if (this.props.id === 'river') {
      const id = new Date().getTime();
      for (let i = 0; i < 7; i ++) {
        this.addList(String(id + i));
      }
    } else {
      this.addList();
    }
  }

  changeIndex = async (val, set) => {
    var newIndex;
    if (set === true) {
      newIndex = val;
    } else {
      newIndex = this.state.info.index + val;
    }
    if (!this.frame) return;

    const finish = () => {
      const children = $(this.frame.current).children();
      if (children[newIndex]) {
        children[newIndex].scrollIntoView();
      }
    }

    this.setState({
      info: {...this.state.info, index: newIndex}
    }, finish);
  }

  updatePosition = () => {
    if (this.state.focused === 'focused') return;
    if (this.props.id !== 'river') return;
    if (this.scrollPos === undefined) this.scrollPos = 
      Math.floor($(this.frameContainer.current).scrollLeft() / 300) * 300;
    let position = $(this.frameContainer.current).scrollLeft();
    if (position < 0) position = 0;
    if (Math.abs(position - this.scrollPos) > 300) {
      this.scrollPos = Math.floor(position / 300) * 300;
      // this.setState({ index: this.state.shownIndex + 
      //   Math.floor(scrollPos / 300) });
      this.setState({ info: 
        {
          ...this.state.info, 
          index: this.state.shownIndex + Math.floor(this.scrollPos / 300)
        }
      });
    }
  }

  componentDidMount() {
    this.updatePosition();
  }

  render() {
    var resizeCheck = () => {
      if (this.state.width !== display.processWidth(this.state.info.focused)) {
        this.setState({ width: display.processWidth(this.state.info.focused) });
      }
    }
    let endIndex = this.state.info.index + this.state.width;
    this.frames = [];
    window.addEventListener('resize', resizeCheck);
    const shownLists = this.state.subtasks.slice(
      this.state.shownIndex
    );
    this.frame = React.createRef();
    this.frameContainer = React.createRef();
    return (
      <div className={`frameContainer 
        ${this.state.info.focused} ${this.state.zoomed} ${this.props.id}`}
        onScroll={this.updatePosition} ref={this.frameContainer}>
        {this.props.id === 'river' &&
        this.state.info.focused !== 'focused' &&
        <div className='monthYear'>
          <span>{
            window.data.tasks[this.state.subtasks[this.state.info.index]]
              .title.slice(4, 8)}</span>
          <span>{
            window.data.tasks[this.state.subtasks[this.state.info.index]]
              .title.slice(11)}</span>
        </div>}
        <div id={this.props.id}
          className={'frame'} ref={this.frame}>
          {shownLists.map(x => {
            this.frames.push(React.createRef());
            const task = window.data.tasks[x];
            if (this.props.id === 'river') {
              // render state correctly in original lists
              return (
                <List key={x} id={x} title={task.title}
                  subtasks={task.subtasks} parent={this}
                  deadlines={this.props.deadlines[task.title]}
                  startdates={this.props.startdates[task.title]}
                  repeats={this.state.repeats[util.dateFormat(task.title)
                    .slice(0, 3)]}
                  ref={this.frames[this.frames.length - 1]} />
              )
            } else {
              return (
                <List key={x} id={x} title={task.title}
                  subtasks={task.subtasks} parent={this}
                  ref={this.frames[this.frames.length - 1]} />
              )
            }
          })}
          <button className='changeButton' title='add list or date'
            onClick={() => this.addLists()}>+</button>
        </div>
      </div>
    );
  }
}