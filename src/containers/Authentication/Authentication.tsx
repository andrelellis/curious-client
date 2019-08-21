import React, { useState, useRef } from 'react';
import Login from '../Login/Login';
import Signup from '../Signup/Signup';

import './Authentication.css';

const Authentication: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [tab, setTab] = useState('login');

  const [loginSelected, setLoginSelected] = useState('selected');

  const loginRef = useRef(null);
  const signUpRef = useRef(null);

  const handleTabToggle = (e: React.MouseEvent<HTMLElement>) => {
    if (tab === 'login' && e.target === signUpRef.current) {
      setLoginSelected('');
      setTab('signUp');
    } else if (tab === 'signUp' && e.target === loginRef.current) {
      setLoginSelected('selected');
      setTab('login');
    }
  };

  return (
    <div className="LISU__container">
      <div id="auth-heading">
        <h1>CURIOUS</h1>
        <span><h2>Because fuck school</h2></span>
      </div>
      <div className="LISU__wrapper">
        <div className="form__header">
          <button
            type="button"
            ref={loginRef}
            onClick={handleTabToggle}
            className={`login__selector ${loginSelected === 'selected' ? 'selected' : ''}`}
          >
            Login
          </button>
          <button
            type="button"
            ref={signUpRef}
            onClick={handleTabToggle}
            className={`login__selector ${loginSelected === '' ? 'selected' : ''}`}
          >
            Sign-Up
          </button>
        </div>
        {
          (tab === 'login')
            ? <Login errorMsg={errorMsg} setErrorMsg={setErrorMsg} />
            : <Signup errorMsg={errorMsg} setErrorMsg={setErrorMsg} />
        }
      </div>
    </div>
  );
};

export default Authentication;
