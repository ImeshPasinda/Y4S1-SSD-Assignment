import React, { useEffect } from 'react';
import { Button, Grid, makeStyles, Typography } from '@material-ui/core';
import { Form, Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Import new Google Login component

import { register, googleLogin } from '../actions/userActions'; // Import googleLogin action
import FormContainer from '../components/FormContainer';
import { FormikPasswordInputField as PasswordInput } from '../components/inputs/FormikPasswordInputField';
import { FormikTextField as TextField } from '../components/inputs/FormikTextField';
import Loader from '../components/Loader';
import isEmail from '../utils/validations/isEmail';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1),
    '& > *': {
      margin: theme.spacing(1),
      width: '100%',
    },
  },
  title: {
    marginTop: '25px',
    textAlign: 'center',
    color: '#4682B4',
  },
  button: {
    color: '#8FBC8B',
  },
  link: {
    textDecoration: 'none',
  },
}));

const RegisterScreen = ({ location, history }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const userRegister = useSelector((state) => state.userRegister);

  const { loading, userInfo } = userRegister;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      history.push(redirect);
    }
  }, [history, userInfo, redirect]);

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
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
        validate={(values) => {
          const errors = {};
  
          if (!values.name) {
            errors.name = 'Required';
          } else if (values.name.length < 4) {
            errors.name = 'Min length is 4 characters';
          }
  
          if (!values.email) {
            errors.email = 'Required';
          } else if (!isEmail(values.email)) {
            errors.email = 'Invalid email address';
          }
  
          if (!values.password) {
            errors.password = 'Required';
          }
          if (!values.confirmPassword) {
            errors.confirmPassword = 'Required';
          }
          if (values.password !== values.confirmPassword) {
            errors.password = 'Passwords do not match';
          }
          if (values.password.length < 6) {
            errors.password = 'Min length is 6 characters';
          }
  
          return errors;
        }}
        onSubmit={async ({ name, email, password }, { setSubmitting }) => {
          setSubmitting(true);
          await dispatch(register(name, email, password));
        }}
      >
        {() => (
          <Form className={classes.root} autoComplete="off">
            <Typography variant="h5" className={classes.title}>
              <b>SIGN UP</b>
            </Typography>
            <TextField required variant="outlined" id="name" name="name" label="Name" />
            <TextField required variant="outlined" id="email" name="email" label="Email Address" />
            <PasswordInput id="password" name="password" label="Password" variant="outlined" />
            <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm password" variant="outlined" />
  
            <Grid container direction="column" alignItems="center" spacing={2}>
              {/* Register Button */}
              <Grid item>
                <Button type="submit" variant="contained" className={classes.button}>
                  Register
                </Button>
              </Grid>
  
              {/* Divider text or spacer */}
              <Grid item>
                <Typography variant="body1" align="center">
                  or
                </Typography>
              </Grid>
  
              {/* Google Register Button */}
              <Grid item>
                <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onFailure={handleGoogleFailure}
                    buttonText="Register with Google"
                    className={classes.googleButton} // You can style it similarly to the Register button
                  />
                </GoogleOAuthProvider>
              </Grid>
            </Grid>
  
            <Grid container justify="center" style={{ paddingTop: '10px' }}>
              <Grid item>
                Have an Account? 
                <span>
                  <Link className={classes.link} to={redirect ? `/login?redirect=${redirect}` : '/login'}>
                    Login
                  </Link>
                </span>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </FormContainer>
  );
};

export default RegisterScreen;
