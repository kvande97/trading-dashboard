import React from "react";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
// import logo3 from "../assets/lb-bt.svg";
import logo3 from "../assets/lw-bt.svg";
import "./Header.css";
// import { Dropdown } from "react-bootstrap";

function Header() {
  return (
      <Navbar sticky="top">
        <Container fluid>
          <Navbar.Brand className="offset-1" href="/">
            <img src={logo3} alt="logo" id="logo" />
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            <NavDropdown title="Profile">
                  <NavDropdown.Item href="login">Login</NavDropdown.Item>
                  <NavDropdown.Item href="register">Register</NavDropdown.Item>
                  <NavDropdown.Item href="account">Account</NavDropdown.Item>
            </NavDropdown >
          </Nav>
        </Container>
      </Navbar>
  );
}

export default Header;
