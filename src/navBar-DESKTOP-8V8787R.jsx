import React from "react";
import { Link, NavLink } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css';


const NavBar = () => {
  return (
    <div className="bg-dark">
      <nav className="navbar navbar-dark navbar-expand-lg">
        <Link className="navbar-brand" to="/">
          Home
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <NavLink className="nav-item nav-link" to="/token">
              Tokens
            </NavLink>
            <NavLink className="nav-item nav-link" to="/voting">
              Voting
            </NavLink>
            <NavLink className="nav-item nav-link" to="/weightedVoting">
              Voting(Authorized)
            </NavLink>
            <NavLink className="nav-item nav-link" to="/chat">
              Chat
            </NavLink>
            <NavLink className="nav-item nav-link" to="/todo">
              Todo List
            </NavLink>
            <NavLink className="nav-item nav-link" to="/auction">
              Auction
            </NavLink>
            <NavLink className="nav-item nav-link" to="/certificate">
              Certificate
            </NavLink>
            <NavLink className="nav-item nav-link" to="/pollSurvey">
              BlockchainPoll
            </NavLink>
            <NavLink className="nav-item nav-link" to="/petAdoption">
              Pet Adoption
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
