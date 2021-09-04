import logo from './logo.svg';
import { Row, Col, Container, Button, Form } from 'react-bootstrap';
import './App.css';
import { MindMap } from './MindMap';

import { useEffect, useState } from 'react';
import { testData, testData2, testData3 } from "./test";

import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  const [diagram, setDiagram] = useState();
  const [clicked, toggle] = useState(false);

  function sendMindMapData(e)
  {
    e.preventDefault();
    console.clear();
    console.log(e.target[0].value);
    console.log(e.target[1].value);


    let p_c = 20
    if (e.target[2].value)
    {
      p_c = parseInt(e.target[2].value)
    }

    console.log(p_c);
    // Send it to the backend
    // if (!clicked)
    // {
    //   setDiagram(testData3);
    // } else {
    //   setDiagram();
    // }
    // toggle(!clicked);
    axios.post('http://127.0.0.1:5000/get-mindmap', {
      text: e.target[1].value,
      title: e.target[0].value,
      phrases_count: p_c
    }).then( function(res) {
      let data = {}
      data.nodes = res.data.nodes;
      data.links = res.data.links;

      console.log(data);
      setDiagram(data);
    })

  }

  return (
      <Container fluid>
        <Row>
          {/* Control */}
          <Col md={4} xs={12} style={{backgroundColor: "white", height: "100vh"}}>
            <div style={{padding:"40px 15px 15px 15px"}}>
              <h1>AIndmap</h1>
              <Form style={{marginTop: "25px"}} onSubmit={sendMindMapData}>
                <Form.Group className="mb-3" controlId="form.ArticleTitle">
                  <Form.Label>Article Title</Form.Label>
                  <Form.Control type="text" placeholder="" autocomplete="off"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formorm.ArticleText" autocomplete="off">
                  <Form.Label>Raw Text</Form.Label>
                  <Form.Control as="textarea" rows={20} style={{resize: "none"}}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="form.PhraseCount" autocomplete="off">
                  <Form.Label>Phrase Count</Form.Label>
                  <Form.Control type="number" placeholder="Default: 20"></Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit">
                  Create Mind Map
                </Button>
              </Form>            
            </div>
          </Col>

          {/* Graph */}
          <Col md={8} xs={12} style={{height: "100vh", padding: "0"}}>
            <MindMap json={diagram} autoPosition={true}></MindMap>
          </Col>
        </Row>
      </Container>
  );
}

export default App;
