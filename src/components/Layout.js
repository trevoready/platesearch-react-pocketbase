import React from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth();
  return (
    <Container>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">Plate Search</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/">Home</Nav.Link>
              {currentUser && <Nav.Link href="/search">Search</Nav.Link>}
              {!currentUser && <Nav.Link href="/signup">Signup</Nav.Link>}
              {!currentUser && <Nav.Link href="/signin">Signin</Nav.Link>}
            </Nav>
            {currentUser && (
                <>
              <Navbar.Text>Signed in as: {currentUser.email}</Navbar.Text>
              <Button variant="link" onClick={logout}>
                Log Out
                </Button>
                </>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {children}
    </Container>
  );
}
