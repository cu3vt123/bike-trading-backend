import { Navbar, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../App.css";

function NavBars() {
    return (
        <Navbar className="navbar-custom" expand="lg">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="navbar-custom-brand">
                    SPORTBIKE
                </Navbar.Brand>
            </Container>
        </Navbar>
    )
}

export default NavBars
