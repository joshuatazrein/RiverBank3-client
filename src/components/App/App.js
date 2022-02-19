import React from 'react';
import './App.css';
import popSnd from '../../assets/snd/pop.mp3';
import * as edit from '../../services/edit';
import * as display from '../../services/display';
import * as util from '../../services/util';
import Frame from '../Frame/Frame';
import StatusBar from '../StatusBar/StatusBar';
import Task from '../Task/Task';
import List from '../List/List';

// main app, governs everything
export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hideComplete: window.data.settings.hideComplete,
      bank: React.createRef(),
      river: React.createRef(),
      theme: window.data.settings.theme,
      mode: window.data.settings.mode,
      focused: window.data.settings.focused,
      popSnd: new Audio(popSnd),
      zoomed: '',
      disableSelect: '',
      contextMenu: React.createRef(),
      deadlines: window.data.settings.deadlines,
      startdates: window.data.settings.startdates,
      displayTable: 'none',
    };
  }

  // hide/show completes
  toggleComplete() {
    var hideComplete;
    if (this.state.hideComplete === '') {
      hideComplete = 'hideComplete';
    } else {
      hideComplete = '';
    }
    this.setState({ hideComplete: hideComplete });
    edit.saveSetting('hideComplete', hideComplete);
    display.updateAllSizes();
  }

  render() {

    this.statusBar = React.createRef();
    return (
      <>
        <StatusBar parent={this} ref={this.statusBar} 
          deadlines={this.state.deadlines} 
          startdates={this.state.startdates} />
        <div className={'container ' + this.state.hideComplete + ' ' +
          this.state.zoomed + ' ' + this.state.disableSelect}>
          <Frame id='bank' info={{
            ...window.data.tasks['bank'].info,
            focused: window.data.settings.focused
          }}
            subtasks={window.data.tasks['bank'].subtasks} ref={this.state.bank} />
          <Frame id='river' info={{
            ...window.data.tasks['river'].info,
            focused: window.data.settings.focused,
          }}
            deadlines={this.state.deadlines}
            startdates={this.state.startdates}
            subtasks={window.data.tasks['river'].subtasks} ref={this.state.river} />
        </div>
        <SelectMenu ref={this.state.contextMenu}/>
        {window.selected && this.state.displayTable !== 'none' &&
          <TableDisplay />}
      </>
    )
  }
}

// extra function menu tacked on after the drag/drop context
class SelectMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { display: 'none', top: '0', left: '0' };
  }
  render() {
    this.self = React.createRef();
    return (
      <div className='selectMenu' ref={this.self} style={{ display: this.state.display,
        top: this.state.top, left: this.state.left }}>
        <p className='centerAlign'><b>edit</b></p>
        <p onClick={() => edit.newTask()}>
          new task<span className='rightAlign'>(return)</span></p>
        <p onClick={() => edit.newTask('task')}>
          new subtask <span className='rightAlign'>(shift-return)</span></p>
        <p onClick={() => edit.cutTask()}>
          cut <span className='rightAlign'>(ctrl-x)</span></p>
        <p onClick={() => edit.copyTask()}>
          copy <span className='rightAlign'>(ctrl-c)</span></p>
        <p onClick={() => edit.copyTask(true)}>
          mirror <span className='rightAlign'>(ctrl-shift-C)</span></p>
        <p onClick={() => edit.pasteTask()}>
          paste <span className='rightAlign'>(ctrl-v)</span></p>
        <p onClick={() => edit.pasteTask("task")}>
          paste as subtask (ctrl-shift-V)</p>
        <p onClick={() => {
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
        }}>
          delete <span className='rightAlign'>(ctrl-delete)</span></p>
        <p  className='centerAlign' style={{marginTop:'5px'}}><b>move</b></p>
        <p onClick={() => edit.moveTask(1)}>
          move down <span className='rightAlign'>(ctrl-s)</span></p>
        <p onClick={() => edit.moveTask(-1)}>
          move up <span className='rightAlign'>(ctrl-w)</span></p>
        <p onClick={() => display.switchView(1)}>
          following week/lists <span className='rightAlign'>(ctrl-d)</span></p>
        <p onClick={() => display.switchView(-1)}>
          previous week/lists <span className='rightAlign'>(ctrl-a)</span></p>
        <p onClick={() => edit.listEdit('migrate')}>
          migrate date</p>
        <p onClick={() => edit.listEdit('clear')}>
          clear list</p>
        <p onClick={() => display.displayTable()}>
          display as table</p>
      </div>
    )
  } 
}

class TableDisplay extends React.Component {
  render() {
    return (
      <table className='table'>
        <thead></thead>
        <tbody>
          {window.data.tasks[util.stripR(window.selected.props.id)].subtasks.map(x => (
            <tr key={x}>
              <td>{
                window.data.tasks[util.stripR(x)].title
              }</td>
              {window.data.tasks[x].subtasks.map(y => (
                <td key={y}>
                  {window.data.tasks[util.stripR(y)].title
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}