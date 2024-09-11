import { Button, Grid, makeStyles, TextField, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Import Google login components

import { login, googleLogin } from '../actions/userActions'; // Import googleLogin action
import FormContainer from '../components/FormContainer';
import PasswordInput from '../components/inputs/PasswordInput';
import Loader from '../components/Loader';
import Message from '../components/Message';
import UserContext from '../context/UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1),
    '& > *': {
      margin: theme.spacing(1),
      width: '100%',
    },
  },
}));

const LoginScreen = ({ location, history }) => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const {
    userLogin: { loading, error, userInfo },
  } = useContext(UserContext);

  const redirect = location.search ? location.search.split('=')[1] : '/';

  const btnSubmitIsDisabled = email === '' || password === '';

  useEffect(() => {
    if (userInfo) {
      history.push(redirect);
    }
  }, [history, userInfo, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  const handleGoogleSuccess = async (response) => {
    const { credential } = response;
    await dispatch(googleLogin(credential));
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
  };

  return (
    <FormContainer>
      {loading && <Loader open={loading} />}
      <form className={classes.root} autoComplete="off">
        <Typography variant="h5" style={{ marginTop: '25px', textAlign: 'center', color: '#4682B4' }}>
          SIGN IN
        </Typography>
        <TextField
          required
          variant="outlined"
          id="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
        />
        <PasswordInput
          id="password"
          label="Password"
          variant="outlined"
          handleOnChange={setPassword}
          value={password}
        />
        {error && <Message severity="error">{error}</Message>}
        <Button
          variant="contained"
          style={{ color: '#8FBC8B' }}
          onClick={submitHandler}
          disabled={btnSubmitIsDisabled}
          type="submit"
        >
          <b>Sign In</b>
        </Button>

        {/* Google Login Button */}
        <Grid container justify="center" style={{ paddingTop: '10px' }}>
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onFailure={handleGoogleFailure}
              buttonText="Login with Google"
              className={classes.googleButton}
            />
          </GoogleOAuthProvider>
        </Grid>

        <Grid item style={{ textAlign: 'center', paddingTop: '5px' }}>
          New Customer?
          <span>
            <Link style={{ textDecoration: 'none', color: '#4682B4' }} to={redirect ? `/register?redirect=${redirect}` : '/register'}>
              {' '}
              Register
            </Link>
          </span>
        </Grid>
      </form>
    </FormContainer>
  );
};

export default LoginScreen;
