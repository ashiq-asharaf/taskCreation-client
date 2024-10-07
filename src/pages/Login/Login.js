import React, { useContext } from "react";
import { TextField, Button, Snackbar } from "@mui/material";
import { Facebook, Google, LinkedIn } from "@mui/icons-material";
import style from "./Login.module.scss";
import { ApiContext, DataContext } from "../../context/MyContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setpassword,
    name,
    setName,
    isSignUp,
    setIsSignUp,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
  } = useContext(DataContext);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };


  const { publicApiRequest } = useContext(ApiContext);

  const navigate = useNavigate();

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const login = async () => {
    try {
      const response = await publicApiRequest({
        cmd: "auth/login",
        args: { email, password },
        method: "POST",
      });

      console.log(response.rsp.statusCode, "response")

      if (response.rsp.statusCode === 1) {
        localStorage.setItem('x-access-token', response.rsp.accessToken);
        localStorage.setItem('userId', response.rsp.userId); 
        navigate("/Home");
      } else {
        setSnackbarMessage(response.rsp.statusMessage);
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("An error occurred. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const registerUser = async () => {
    try {
      const response = await publicApiRequest({
        cmd: "auth/register",
        args: { email, password },
        method: "POST",
      });

      if (response.rsp.statusCode === 1) {
        setSnackbarMessage(response.rsp.statusMessage);
        setSnackbarOpen(true);
        setIsSignUp(false)
      } else {
        setSnackbarMessage(response.rsp.statusMessage);
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("An error occurred. Please try again.");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className={style.loginWrapper}>
      <div
        className={`${style.container} ${
          isSignUp ? style.rightPanelActive : ""
        }`}
        id="container"
      >
        <div className={`${style.formContainer} ${style.signUpContainer}`}>
          <form>
            <h1>Create Account</h1>
            <div className={style.socialContainer}>
              <span className={style.social}>
                <Facebook />
              </span>
              <span className={style.social}>
                <Google />
              </span>
              <span className={style.social}>
                <LinkedIn />
              </span>
            </div>
            <span>or use your email for registration</span>
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" fullWidth onClick={registerUser}>
              Sign Up
            </Button>
          </form>
        </div>

        <div className={`${style.formContainer} ${style.signInContainer}`}>
          <form>
            <h1>Sign in</h1>
            <div className={style.socialContainer}>
              <span className={style.social}>
                <Facebook />
              </span>
              <span className={style.social}>
                <Google />
              </span>
              <span className={style.social}>
                <LinkedIn />
              </span>
            </div>
            <span>or use your account</span>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <span>Forgot your password?</span>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className={style.btnWrapper}
              onClick={login}
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className={style.overlayContainer}>
          <div className={style.overlay}>
            <div className={`${style.overlayPanel} ${style.overlayLeft}`}>
            <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <Button className={style.ghost} onClick={toggleForm}>
                Sign Up
              </Button>
            </div>
            <div className={`${style.overlayPanel} ${style.overlayRight}`}>
            <h1>Welcome Back!</h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <Button className={style.ghost} onClick={toggleForm}>
                Sign In
              </Button>
             
            </div>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
};

export default Login;
