import { useEffect, useState } from "react";
import { getBikes } from "../services/api";
import { Card, Container, Row, Col } from "react-bootstrap";

// 👉 define type
type Bike = {
    id: number;
    name: string;
    price: number;
};

function HomePage() {
    const [bikes, setBikes] = useState<Bike[]>([]);

    useEffect(() => {
        getBikes()
            .then((data) => {
                console.log("Bikes:", data); // debug
                setBikes(data);
            })
            .catch((err) => console.error(err));
    }, []);

    return (
        <Container className="mt-4">
            <Row>
                {bikes.map((bike) => (
                    <Col md={4} key={bike.id}>
                        <Card className="mb-3">
                            <Card.Body>
                                <Card.Title>{bike.name}</Card.Title>
                                <Card.Text>Price: ${bike.price}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default HomePage;