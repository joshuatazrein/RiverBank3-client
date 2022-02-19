import './SignIn.css';
import '../App/App.css';
import * as server from '../../services/server';
import { useState } from 'react';
import Axios from 'axios';
import imgSource from '../../assets/media/logo.png';

// props has init function
export default function SignIn (props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [format, setFormat] = useState('login');

  const reset = () => {
    setPassword2('');
    setPassword('');
    setUsername('');
  }

  const login = () => {
    if (format === 'create') {
      if (password2 !== password) {
        alert('passwords must match');
        reset();
        return;
      } else if (username.length === 0) {
        alert('enter a username');
        return;
      } else if (password.length === 0) {
        alert('enter a password');
        return;
      }
      Axios.post('http://localhost:3001/createuser', {
        username: username,
        password: password,
      }).then((response) => {
        if (response.data === 'duplicate username') {
          alert('username taken');
          setUsername('');
        } else {
          // load data into window's data
          window.username = username;
          window.password = response.data.encryptedPassword;
          // reset and upload fresh data
          server.initializeData();
          confirm();
        }
      }).catch((err) => {
      });
    } else if (format === 'login') {
      if (username.length === 0) {
        alert('enter a username');
        return;
      } else if (password.length === 0) {
        alert('enter a password');
        return;
      }
      Axios.post('http://localhost:3001/login', {
        username: username,
        password: password,
      }).then((response) => {
        if (response.data === 'wrong username') {
          alert('username does not exist');
          setUsername('');
        } else if (response.data === 'wrong password') {
          alert('incorrect password');
          setPassword('');
        } else {
          // load data into window's data
          window.data = {
            settings: response.data.settings,
            tasks: response.data.tasks
          };
          window.username = username;
          window.password = response.data.encryptedPassword;
          confirm();
        }
      }).catch((err) => {
      });
    }
  }

  const confirm = () => {
    props.init();
  }

  return (
    <div className='signIn'>
      <img 
        src={imgSource}
        className='logo'
      ></img>
      <span className='title titleLarge'>
        <span className='r'>River</span>
        <span className='b'>Bank</span>
      </span>
      <p className='slogan'>go with the flow</p>
      <div className='radioButtons'>
        <button
          className={`radioButton ${format === 'login' ? 'selected' : ''}`}
          onClick={() => setFormat('login')}
        >login</button>
        <button
          className={`radioButton ${format === 'create' ? 'selected' : ''}`}
          onClick={() => setFormat('create')}
        >create account</button>
      </div>
      <input 
        className='signInput'
        placeholder='username'
        value={username}
        onChange={(ev) => {
          setUsername(ev.target.value);
        }}
      ></input>
      <input 
        type='password'
        className='signInput'
        placeholder='password'
        value={password}
        onChange={(ev) => {
          setPassword(ev.target.value);
        }}
      ></input>
      {format === 'create' &&
      <input 
      type='password'
      className='signInput'
      placeholder='password again'
      value={password2}
      onChange={(ev) => {
        setPassword2(ev.target.value);
      }}
    ></input>}
      <button 
        className='loginButton'
        onClick={login}
      >enter</button>
    </div>
  )
}