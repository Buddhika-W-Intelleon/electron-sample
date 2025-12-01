import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <h2 className="mb-4">Welcome!</h2>

      <Button
        variant="primary"
        size="lg"
        className="mb-3 w-50"
        onClick={() => navigate("/database")}
      >
        Use Database
      </Button>

      <Button
        variant="success"
        size="lg"
        className="w-50"
        onClick={() => navigate("/upload")}
      >
        Upload File
      </Button>
    </Container>
  );
};

export default HomePage;
