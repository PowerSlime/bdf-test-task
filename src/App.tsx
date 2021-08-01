import { FC } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import Chart from './components/Chart';
import Header from './components/Header';

const App: FC = () => {
  return (
    <Container>
      <Row>
        <Col xs={12}>
          <Header className="mt-4" />
        </Col>
        <Col xs={12}>
          <Chart className="mt-4" />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
