import logo from './logo.svg';
import { Row, Col, Container, Button, Form } from 'react-bootstrap';
import './App.css';
import { MindMap } from './MindMap';

import { useEffect, useState } from 'react';
import { testData, testData2, testData3, testData4 } from "./test";

import { Summary } from './Summary';

import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  const [diagram, setDiagram] = useState();
  const [clicked, toggle] = useState(false);
  const [sum, toggleSum] = useState(false);
  const [dims, setDimensions] = useState(2);

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

    if (p_c < 1)
    {
      p_c = 20
    }

    console.log(p_c);
    // Send it to the backend
    // if (!clicked)
    // {
    //   setDiagram(testData4);
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
      data.summary_text = res.data.summary_text
      data.summary_arr = res.data.summary_arr

      console.log(data);
      setDiagram(data);
    })

  }

  function toggleSummary()
  {
    toggleSum(!sum);
    return;
  }

  function changeDims()
  {
    if (dims == 2)
    {
      setDimensions(3)
    } else {
      setDimensions(2)
    }
  }

  function getForm()
  {
    return (
      <>
        <Form.Group className="mb-3" controlId="form.ArticleTitle">
          <Form.Label style={{color: "#999999"}}>Article Title</Form.Label>
          <Form.Control type="text" placeholder="" autocomplete="off" style={{backgroundColor:"#222222", border: "0px", color: "white"}}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formorm.ArticleText" autocomplete="off">
          <Form.Label style={{color: "#999999"}}>Raw Text</Form.Label>
          <Form.Control as="textarea" rows={20} style={{backgroundColor:"#222222", border: "0px", resize:"none", color: "white"}}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="form.PhraseCount" autocomplete="off">
          <Form.Label style={{color: "#999999"}}>Phrase Count</Form.Label>
          <Form.Control type="number" placeholder="Default: 20" style={{backgroundColor:"#222222", border: "0px", color: "white"}}></Form.Control>
        </Form.Group>
      </>
    )
  }

  return (
      <Container fluid style={{backgroundColor:"black"}}>
        <Row>
          {/* Control */}
          <Col md={4} xs={12} style={{backgroundColor: "black", height: "100vh", color:"white"}}>
            <div style={{padding:"40px 15px 15px 15px"}}>
              <h1>AIndmap</h1>
              <Form style={{marginTop: "25px"}} onSubmit={sendMindMapData}>
                <div style={{height: "75vh"}}>
                  { sum ? <Summary sentences={diagram.summary_arr}></Summary> : getForm()}    
                </div>

                <div style={{marginTop: "10px"}}>
                  <Button variant="primary" type="submit" disabled={sum}>
                    Create Mind Map
                  </Button>
                  <Button onClick={() => {toggleSummary()}} style={{marginLeft: "15px"}} disabled={!diagram}>Show Summary</Button>
                  <Button onClick={() => {changeDims()}} style={{marginLeft: "15px"}}>Change View</Button>  
                </div>


              </Form>
 
           
            </div>
          </Col>

          {/* Graph */}
          <Col md={8} xs={12} style={{height: "100vh", padding: "0"}}>
            <MindMap json={diagram} autoPosition={true} dimensions={dims}></MindMap>
          </Col>
        </Row>
      </Container>
  );
}

export default App;
