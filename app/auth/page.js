'use client';

import { useState, useEffect } from 'react';
import { Required, StrongPassword, ValidEmail, ValidEmailOrPhone, ValidName } from '../../lib/validation.js';
import './auth.css';
import { GoogleLogin } from '@react-oauth/google';

let ExInput, ExButton, ExForm,ExDivider;
export default function AuthPage() {
  const [mode, setMode] = useState('register');
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@bhavinpatel57/element-x').then(mod => {
        ExInput = mod.ExInput;
        ExButton = mod.ExButton;
        ExForm = mod.ExForm;
                ExForm = mod.ExForm;
        ExDivider = mod.ExDivider;
        setIsReady(true);
      });
    }
  }, []);

  const toggleMode = () => setMode(prev => (prev === 'login' ? 'register' : 'login'));

  const handleRegisterChange = (key, value) =>
    setRegisterData(prev => ({ ...prev, [key]: value }));

  const handleLoginChange = (key, value) =>
    setLoginData(prev => ({ ...prev, [key]: value }));




  const handleSubmit = async () => {
    const body = mode === 'register' ? registerData : loginData;
    const endpoint = `/api/auth/${mode}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.error || 'Failed!');
    }

    const json = await res.json();
    alert(json.message || 'Success!');
  };

  if (!isReady) return null;

  return (
    <div className="auth-container">
    <div className={`auth-wrapper ${mode}`}>
      <div className="auth-slide login-slot">
        <div className="auth-inner">
          <LoginForm
            data={loginData}
            onChange={handleLoginChange}
            onSuccess={handleSubmit}
          />
        </div>
      </div>

      <div className="auth-slide register-slot">
        <div className="auth-inner">
          <RegisterForm
            data={registerData}
            onChange={handleRegisterChange}
            onSuccess={handleSubmit}
          />
        </div>
      </div>

      <div className="auth-overlay">
      <div className="auth-info">
            <h2>{mode === 'login' ? 'New Here?' : 'Welcome Back'}</h2>
            <h5>{mode === 'login' ? 'Sign up and get started' : 'Already have an account?'}</h5>
            <button className="toggle-btn" onClick={toggleMode}>
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </div>
      </div>
    </div></div>
  );
}


function RegisterForm({ data, onChange, onSuccess }) {
  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Register</h2>
        <h5>Create your account below</h5>
      </div>
      <ExDivider />
      <ExForm
        formId="registerForm"
        onformSubmit={e => {
          e.preventDefault();
          if (e.detail.success) onSuccess();
        }}
      >
        <div className="auth-fields">
          <ExInput
            placeholder="John Doe"
            required
            value={data.name}
            validations={[Required,ValidName]}
            onvalueChanged={e => onChange('name', e.detail.value)}
          />
          <ExInput
            placeholder="you@example.com"
            required
            value={data.email}
            validations={[Required,ValidEmail]}
            onvalueChanged={e => onChange('email', e.detail.value)}
          />
          <ExInput
            type="password"
            placeholder="Password"
            required
            value={data.password}
            validations={[Required,StrongPassword]}
            onvalueChanged={e => onChange('password', e.detail.value)}
          />
          <ExButton variant="primary" type="submit" formId="registerForm">Register</ExButton>
        </div>
      </ExForm>
    </div>
  );
}

function LoginForm({ data, onChange, onSuccess }) {
  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Login</h2>
        <h5>Welcome back! Please login to continue</h5>
      </div>
      <ExDivider />
      <ExForm
        formId="loginForm"
        onformSubmit={e => {
          e.preventDefault();
          if (e.detail.success) onSuccess();
        }}
      >
        <div className="auth-fields">
          <ExInput
            placeholder="you@example.com"
            required
            value={data.email}
            validations={[Required,ValidEmailOrPhone]}
            onvalueChanged={e => onChange('email', e.detail.value)}
          />
          <ExInput
            type="password"
            placeholder="Password"
            required
            value={data.password}
            validations={[Required]}
            onvalueChanged={e => onChange('password', e.detail.value)}
          />
          <ExButton variant="primary" type="submit" formId="loginForm">Login</ExButton>
          <GoogleLogin
  onSuccess={async (credentialResponse) => {
    const token = credentialResponse.credential;

    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const json = await res.json();
    if (res.ok) {
      alert(`Welcome ${json.user.name}`);
      // save token / redirect
    } else {
      alert(json.error || 'Google Login Failed');
    }
  }}
  onError={() => {
    alert('Google Login Failed');
  }}
/>
        </div>
      </ExForm>
    </div>
  );
}

