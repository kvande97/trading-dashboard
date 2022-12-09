import React from "react";
import logo3 from "../assets/lw-bt.svg";
import {
  Container,
  Navbar,
  Nav,
  NavDropdown,
  Offcanvas,
} from "react-bootstrap";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faChartColumn
} from "@fortawesome/free-solid-svg-icons";

function Header() {
  return (
    <>
      <Navbar key={"md"} sticky="top" collapseOnSelect expand="md">
        <Container fluid>
          <Navbar.Brand className="offset-md-1" href="/">
            <img src={logo3} alt="logo" className="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls={`offcanvasToggle`} />
          <Navbar.Offcanvas
            id={`offcanvasToggle`}
            aria-labelledby={`offcanvasLabel`}
            placement="end"
          >
            <Offcanvas.Header closeButton />
            <Offcanvas.Body>
              <Nav className="col-md-6 offset-md-5 me-auto">
                <Nav.Link href="/">
                  Home <FontAwesomeIcon icon={faHouse} />
                </Nav.Link>
                <Nav.Link href="/dashboard">
                  Dashboard <FontAwesomeIcon icon={faChartColumn} />
                </Nav.Link>
                <NavDropdown title="Profile" id={`offcanvasDropdown`}>
                  <NavDropdown.Item href="login">Login</NavDropdown.Item>
                  <NavDropdown.Item href="register">Register</NavDropdown.Item>
                  <NavDropdown.Item href="account">Account</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
