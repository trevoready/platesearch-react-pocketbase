import React from "react";
import {
  Card,
  FormGroup,
  Form,
  Button,
  Container,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import client from "../pbconn";
import { useAuth } from "../contexts/AuthContext";
import Layout from "./Layout";

export default function SearchPlate() {
  const plate = React.useRef();
  const province = React.useRef();
  const [provinces, setProvinces] = React.useState([]);
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [location, setLocation] = React.useState(null);
  const { currentUser, logout } = useAuth();
  const [complaints, setComplaints] = React.useState(null);
  const [complaintsLoading, setComplaintsLoading] = React.useState(false);
  const [complaintsError, setComplaintsError] = React.useState(false);
  const reason = React.useRef();
  const description = React.useRef();

  React.useEffect(() => {
    async function getProvinces() {
      var provinces = await client.records.getFullList("states");
      console.log(provinces);
      setProvinces(provinces);
    }
    getProvinces();
    //user location
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition((location) => {
        if (location) {
          var loc = location.coords.latitude + "," + location.coords.longitude;
          setLocation(loc);
        }
      });
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    plate.current.value = plate.current.value.toUpperCase();
    try {
      var result = await client.records.getList("plates", 1, 1, {
        filter:
          'plate = "' +
          plate.current.value +
          '" && state = "' +
          province.current.value +
          '"',
        expand: "state",
      });
      console.log(result);
      console.log(currentUser);
      if (result.items.length === 0) {
        //add plate
        result = await client.records.create("plates", {
          plate: plate.current.value,
          state: province.current.value,
        });
        console.log(result);
        result = await client.records.getList("plates", 1, 1, {
          filter:
            'plate = "' +
            plate.current.value +
            '" && state = "' +
            province.current.value +
            '"',
          expand: "state",
        });
      }
      setResults(result.items[0]);
      var complaintList = await client.records.getList("complaints", 10, 10, {
        filter: 'plate = "' + result.items[0].id + '"',
      });
      console.log(complaintList);
      setComplaints(complaintList.items);
    } catch (error) {
      console.log(error);
      setError(true);
    }
    plate.current.value = "";
    setLoading(false);
  }

  async function handleComplaint(e) {
    e.preventDefault();
    setComplaintsLoading(true);
    setComplaintsError(false);
    try {
      //add locaiton before complaint
      var locationadd = await client.records.create("locations", {
        plate: results.id,
        latitude: location.split(",")[0],
        longitude: location.split(",")[1],
        added_by: currentUser.id,
        hidden: results.hidden,
      });
      console.log(locationadd);
      //add complaint
      var complaint = await client.records.create("complaints", {
        plate: results.id,
        reason: reason.current.value,
        description: description.current.value,
        added_by: currentUser.id,
        hidden: results.hidden,
        location: locationadd.id,
      });
      console.log(complaint);
      //clear form
      reason.current.value = "";
      description.current.value = "";
    } catch (error) {
      console.log(error);
      setComplaintsError(true);
    }
    setComplaintsLoading(false);
  }

  return (
    <Layout>
    <Container>
      <Row>
        <Col sm>
          <Button onClick={logout} className="w-100">
            Logout
          </Button>
          <Card style={{ padding: "10px" }}>
            <Card.Body>
              <h2 className="text-center mb-4">Search Plate</h2>
            </Card.Body>
            <Form>
              <FormGroup id="plate">
                <Form.Label>Plate</Form.Label>
                <Form.Control type="text" ref={plate} required />
              </FormGroup>
              <FormGroup id="province">
                <Form.Label>Province</Form.Label>
                <Form.Select ref={province}>
                  {provinces.map((province) => {
                    return <option value={province.id}>{province.name}</option>;
                  })}
                </Form.Select>
              </FormGroup>
              <FormGroup id="location">
                <Form.Label>Location</Form.Label>
                <Form.Control type="text" value={location} disabled required />
              </FormGroup>
              <Button
                disabled={loading}
                className="w-100"
                type="submit"
                onClick={handleSubmit}
              >
                Search
              </Button>
            </Form>
          </Card>
        </Col>
        {results && (
          <Col sm>
            <Card style={{ padding: "10px" }}>
              <Card.Body>
                <h2 className="text-center mb-4">File complaint</h2>
                <Form onSubmit={handleComplaint}>
                  <FormGroup id="reason">
                    <Form.Label>Reason</Form.Label>
                    <Form.Control type="text" ref={reason} required />
                  </FormGroup>
                  <FormGroup id="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="textarea" ref={description} required />
                  </FormGroup>
                  <Button
                    disabled={complaintsLoading}
                    className="w-100"
                    type="submit"
                  >
                    File Complaint
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Row>
        {results && (
          <>
            <Col>
              <Card style={{ padding: "10px" }}>
                <Card.Body>
                  <h2 className="text-center mb-4">Results</h2>
                  <>
                    <p>Plate: {results.plate}</p>
                    <p>State: {results["@expand"].state.name}</p>
                  </>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card style={{ padding: "10px" }}>
                <Card.Body>
                  <h2 className="text-center mb-4">Complaints</h2>
                  <>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Reason</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints?.map((complaint) => {
                          return (
                            <tr>
                              <td>{complaint.reason}</td>
                              <td>{complaint.description}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>
    </Container>
    </Layout>
  );
}
