'use client';

import { useState, useEffect,useRef } from 'react';
import { Required, StrongPassword, ValidEmail, ValidEmailOrPhone, ValidName } from '../../lib/validation.js';
import './auth.css';
import { GoogleLogin } from '@react-oauth/google';
import { notifyGlobal } from '../components/NotificationProvider.js';

let ExInput, ExButton, ExForm,ExDivider,ExDialog,ExOtp;
export default function AuthPage() {
  const [mode, setMode] = useState('register');
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [forgotEmailLoading, setForgotEmailLoading] = useState(false);
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);
  const [otpData, setOtpData] = useState({ userId: '' });
  const [otpValue, setOtpValue] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
const [forgotEmail, setForgotEmail] = useState('');
const forgotDialog = useRef(null);
const otpDialog = useRef(null);
const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp' | 'reset'
const [forgotUserId, setForgotUserId] = useState('');
const [forgotOtp, setForgotOtp] = useState('');
const [newPassword, setNewPassword] = useState('');


  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@bhavinpatel57/element-x').then(mod => {
        ExInput = mod.ExInput;
        ExButton = mod.ExButton;
        ExForm = mod.ExForm;
        ExDivider = mod.ExDivider;
        ExDialog = mod.ExDialog;
        ExOtp = mod.ExOtp;
        setIsReady(true);
      });
    }
  }, []);

  const toggleMode = () => setMode(prev => (prev === 'login' ? 'register' : 'login'));

  const handleRegisterChange = (key, value) =>
    setRegisterData(prev => ({ ...prev, [key]: value }));

  const handleLoginChange = (key, value) =>
    setLoginData(prev => ({ ...prev, [key]: value }));


  const handleForgotPassword = async () => {
    setForgotEmailLoading(true);
    try {
      const res = await fetch('/api/auth/forgot/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
  
      const json = await res.json();
      if (!res.ok) {
        notifyGlobal({ title: 'Error', message: json.error, type: 'alert' });
      } else {
        setForgotUserId(json.userId);
        setForgotStep('otp');
        notifyGlobal({ title: 'OTP Sent', message: json.message, type: 'success' });
      }
    } catch {
      notifyGlobal({ title: 'Error', message: 'Try again later.', type: 'alert' });
    } finally {
      setForgotEmailLoading(false);
    }
  };
  
  const handleForgotOtpVerify = async () => {
    setForgotOtpLoading(true);
    const res = await fetch('/api/auth/forgot/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: forgotUserId, otp: forgotOtp }),
    });
  
    const json = await res.json();
    setForgotOtpLoading(false);
  
    if (res.ok) {
      setForgotOtp(''); // Clear OTP field
      setForgotStep('reset');
      notifyGlobal({ title: 'OTP Verified', message: 'You can now reset password.', type: 'success' });
    } else {
      notifyGlobal({ title: 'Invalid OTP', message: json.error, type: 'alert' });
    }
  };
  
  const handleResetPassword = async () => {
    setResetPasswordLoading(true);
    const res = await fetch('/api/auth/forgot/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: forgotUserId, password: newPassword }),
    });
  
    const json = await res.json();
    setResetPasswordLoading(false);
  
    if (res.ok) {
      notifyGlobal({ title: 'Password Reset', message: 'You can now log in.', type: 'success' });
      forgotDialog.current?.close();
      setAuthMode('login');
      setForgotStep('email');
      setForgotUserId('');
    } else {
      notifyGlobal({ title: 'Error', message: json.error, type: 'alert' });
    }
  };
  
  const handleResendOtp = () => {
    handleForgotPassword(); // Re-use same call to re-trigger OTP
  };
  
  

  const handleLoginSubmit = async () => {
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
  
      const json = await res.json();
      if (!res.ok) {
        notifyGlobal({
          title: 'Login Failed',
          message: json.error || 'Invalid credentials.',
          type: 'alert',
        });
        return;
      }
  
      notifyGlobal({
        title: 'Login Successful',
        message: `Welcome ${json.user?.name || json.user?.email || 'User'}`,
        type: 'success',
      });
    } catch (err) {
      notifyGlobal({
        title: 'Error',
        message: 'Login error. Please try again.',
        type: 'alert',
      });
    } finally {
      setLoginLoading(false);
    }
  };
  
  const handleRegisterSubmit = async () => {
    setRegisterLoading(true);
    try {
      const res = await fetch('/api/auth/register/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
  
      const json = await res.json();

      if (res.ok) {
        setOtpData({ userId: json.userId }); // save for OTP form
        otpDialog.current?.show({
          overlay: true
        });           // open OTP dialog
      }

      if (!res.ok) {
        notifyGlobal({
          title: 'Register Failed',
          message: json.error || 'Please check your details.',
          type: 'alert',
        });
        return;
      }
  
      notifyGlobal({
        title: 'Registration Successful',
        message: `Welcome ${json.user?.name || json.user?.email || 'User'}`,
        type: 'success',
      });
  
      setAuthMode('login'); // Switch to login after registration
    } catch (err) {
      notifyGlobal({
        title: 'Error',
        message: 'Registration error. Please try again.',
        type: 'alert',
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleOtpVerify = async ({ userId, otp }) => {
  setRegisterOtpLoading(true);
  const res = await fetch('/api/auth/register/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp }),
  });
  const json = await res.json();
  setRegisterOtpLoading(false);

  if (res.ok) {
    notifyGlobal({ title: 'Verified', message: 'Email verified!', type: 'success' });
    setOtp('');
    otpDialog.current?.close();
    setAuthMode('login');
  } else {
    notifyGlobal({ title: 'Invalid OTP', message: json.error, type: 'alert' });
  }
};


  if (!isReady) return null;

  return (
    <div className="auth-container">
<ExDialog ref={forgotDialog} dialogPadding='10px'>
    {forgotStep === 'email' && (
      <ForgotPasswordForm
        email={forgotEmail}
        onChange={setForgotEmail}
        onSubmit={handleForgotPassword}
        loading={forgotEmailLoading}
      />
    )}

    {forgotStep === 'otp' && (
      <OtpForm
        userId={forgotUserId}
        otp={forgotOtp}
        onChange={setForgotOtp}
        onVerify={handleForgotOtpVerify}
        onResend={handleResendOtp}
        loading={forgotOtpLoading}
        formId="forgotOtpForm"
      />
    )}

    {forgotStep === 'reset' && (
      <ResetPasswordForm
        data={{ password: newPassword }}
        onChange={(key, val) => setNewPassword(val)}
        onSubmit={handleResetPassword}
        loading={resetPasswordLoading}
      />
    )}
</ExDialog>


<ExDialog ref={otpDialog} dialogPadding='10px'>
    <OtpForm
      userId={otpData.userId}
      otp={otpValue}
      onChange={setOtpValue}
      onVerify={handleOtpVerify}
      loading={registerOtpLoading}
      formId="registerOtpForm"
    />
</ExDialog>

      <div className={`auth-wrapper ${mode}`}>
  <div className='auth-slide login-slot'>
    <div className='auth-inner'>

  <LoginForm
    data={loginData}
    onChange={handleLoginChange}
    onSuccess={handleLoginSubmit}
    loading={loginLoading}
    onForgot={() => forgotDialog.current?.show({
      overlay: true,
    })} 
  />
    </div>
  </div>
        <div className='auth-slide register-slot'>
          <div className='auth-inner'>
       
          <RegisterForm
            data={registerData}
            onChange={handleRegisterChange}
            onSuccess={handleRegisterSubmit}
            loading={registerLoading}
          />
        </div>
        </div>
  
       
        {(authMode === 'login' || authMode === 'register') && (
          <div className="auth-overlay">
            <div className="auth-info">
              <h2>{authMode === 'login' ? 'New Here?' : 'Welcome Back'}</h2>
              <h5>{authMode === 'login' ? 'Sign up and get started' : 'Already have an account?'}</h5>
              <button className="toggle-btn" onClick={toggleMode}>
                {authMode === 'login' ? 'Register' : 'Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
}

function ForgotPasswordForm({ email, onChange, onSubmit, loading }) {
  return (<>
      <div slot='dialog-title'>
      <div className='dialog-title'>Forgot Password</div>
      <div className='dialog-subtitle'>Enter your email to receive reset link</div>
      </div>
      <ExForm
        formId="forgotForm"
        slot='dialog-form'
        onformSubmit={e => {
          if (e.detail.success) onSubmit();
        }}
      >
        <ExInput
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          validations={[Required, ValidEmail]}
          onvalueChanged={e => onChange(e.detail.value)}
        />
      </ExForm>
      <ExButton
        variant="transparent"
        slot='custom-buttons'
        type="submit"
        formId="forgotForm"
        loading={loading}
        disabled={loading}
      >
        Send Reset Link
      </ExButton></>
  );
}


function ResetPasswordForm({ data, onChange, onSubmit, loading }) {
  return (<>
      <div slot='dialog-title'>
      <div className='dialog-title'>Reset Password</div>
      <div className='dialog-subtitle'>Set your new password</div>
      </div>
      <ExForm
        formId="resetForm"
        slot='dialog-form'
        onformSubmit={e => {
          if (e.detail.success) onSubmit();
        }}
      >
        <ExInput
          type="password"
          placeholder="New Password"
          required
          value={data.password}
          validations={[Required, StrongPassword]}
          onvalueChanged={e => onChange('password', e.detail.value)}
        />
      </ExForm>
      <ExButton
        variant="transparent"
        slot='custom-buttons'
        type="submit"
        formId="resetForm"
        loading={loading}
        disabled={loading}
      >
        Reset Password
      </ExButton></>
  );
}



function RegisterForm({ data, onChange, onSuccess, loading }) {
  const fields = [
    {
      key: 'name',
      placeholder: 'Full Name',
      validations: [Required, ValidName],
    },
    {
      key: 'email',
      placeholder: 'you@example.com',
      validations: [Required, ValidEmail],
    },
    {
      key: 'password',
      placeholder: 'Password',
      type: 'password',
      validations: [Required, StrongPassword],
    },
  ];

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
          if (e.detail.success) onSuccess();
        }}
      >
        <div className="auth-fields">
          {fields.map(({ key, placeholder, validations, type = 'text' }) => (
            <ExInput
              key={key}
              type={type}
              placeholder={placeholder}
              required
              value={data[key]}
              validations={validations}
              onvalueChanged={e => onChange(key, e.detail.value)}
            />
          ))}
        </div>
      </ExForm>
          <ExButton
            variant="primary"
            type="submit"
            formId="registerForm"
            disabled={loading}
            loading={loading}
          >
            Register
          </ExButton>
    </div>
  );
}


function LoginForm({ data, onChange, onSuccess, loading,onForgot }) {
  const fields = [
    {
      key: 'email',
      placeholder: 'you@example.com',
      validations: [Required, ValidEmailOrPhone],
    },
    {
      key: 'password',
      placeholder: 'Password',
      type: 'password',
      validations: [Required],
    },
  ];

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
          {fields.map(({ key, placeholder, validations, type = 'text' }) => (
            <ExInput
              key={key}
              type={type}
              placeholder={placeholder}
              required
              value={data[key]}
              validations={validations}
              onvalueChanged={e => onChange(key, e.detail.value)}
            />
          ))}
        </div>
      </ExForm>
      <p className="forgot-link" onClick={onForgot} style={{ cursor: 'pointer', marginTop: '8px' }}>
  Forgot Password?
</p>
          <ExButton
            variant="primary"
            type="submit"
            formId="loginForm"
            disabled={loading}
            loading={loading}
          >
            Login
          </ExButton>

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
                notifyGlobal({
                  title: 'Welcome',
                  message: `Hello ${json.user.name}`,
                  type: 'success',
                });
              } else {
                notifyGlobal({
                  title: 'Google Login Failed',
                  message: json.error || 'Something went wrong.',
                  type: 'alert',
                });
              }
            }}
            onError={() => {
              notifyGlobal({
                title: 'Google Login Error',
                message: 'Authentication failed.',
                type: 'alert',
              });
            }}
          />
    </div>
  );
}

function OtpForm({ userId, otp, onChange, onVerify, loading,formId }) {
  return (<>
      <div slot='dialog-title'>
        <div className='dialog-title'>Email Verification</div>
        <div className='dialog-subtitle'>Enter the OTP sent to your email</div>
      </div>
      <ExForm
        formId={formId}
        onformSubmit={(e) => {
          if (e.detail.success) onVerify({ userId, otp });
        }} slot='dialog-form'
      >
        <ExOtp
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onvalueChanged={(e) => onChange(e.detail.otp)}
          required
        />
      </ExForm>
      <ExButton
        type="submit"
        slot='custom-buttons'
        variant="transparent"
        formId={formId}
        loading={loading}
        disabled={loading}
      >
        Verify OTP
      </ExButton></>
  );
}
