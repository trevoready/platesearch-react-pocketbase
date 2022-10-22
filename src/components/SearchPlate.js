import React from "react";
import {
  Card,
  FormGroup,
  Form,
  Button,
  Container,
  Table,
} from "react-bootstrap";
import client from "../pbconn";
import { useAuth } from "../contexts/AuthContext";

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
      setResults(result.items[0]);
      var complaintList = await client.records.getFullList(
        "complaints",
        1,
        10,
        {
          filter: 'plate = "' + result.items[0].id + '"',
          expand: "state",
        }
      );
      console.log(complaintList);
      setComplaints(complaintList);
    } catch (error) {
      console.log(error);
      setError(true);
    }
    setLoading(false);
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
      <Button onClick={logout} className="w-100" >Logout</Button>
        <Card>
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
        {results && (
          <>
            <Card>
              <Card.Body>
                <h2 className="text-center mb-4">Results</h2>
                <>
                  <p>Plate: {results.plate}</p>
                  <p>State: {results["@expand"].state.name}</p>
                </>
              </Card.Body>
            </Card>
            <Card>
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
          </>
        )}
      </div>
    </Container>
  );
}
