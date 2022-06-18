import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const { name, email, password } = formData;

  const navigate = useNavigate();

  const handleChange = (e) => {
    const {name, value} = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
        </header>
        <main>
          <form>
            <input
              type="text"
              className="nameInput"
              placeholder="Enter your email address here"
              value={name}
              name="name"
              onChange={handleChange}
            />
            <input
              type="email"
              className="emailInput"
              placeholder="Enter your email address here"
              value={email}
              name="email"
              onChange={handleChange}
            />

            <div className="passwordInputDiv">
              <input
                type={showPassword ? "text" : "password"}
                className="passwordInput"
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={handleChange}
              />
              <img
                src={visibilityIcon}
                alt="show password"
                className="showPassword"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            </div>

            <Link to="/forgot-password" className="forgotPasswordLink">
              Forgot Password
            </Link>

            <div className="signUpBar">
              <p className="signUpText">Sign Up</p>
              <button className="signUpButton">
                <ArrowRightIcon fill="#ffffff" width="34px" height="34px" />
              </button>
            </div>
          </form>
          {/* Google OAuth Component */}
          <Link to="/sign-in" className="registerLink">Sign In Instead</Link>
        </main>
      </div>
    </>
  );
};

export default SignUp;
