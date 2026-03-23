import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const NavBars = () => {
    return (
        <Navbar bg="light" variant="lightblue">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    ShopBike
                </Navbar.Brand>

                <Nav>
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavBars;