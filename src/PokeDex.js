import "./App.css";
import { useState, useEffect, useRef } from "react";
import ReactLoading from "react-loading";
import axios from "axios";
import Modal from "react-modal";
import Table from "react-bootstrap/Table";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "react-bootstrap/Button";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Image from "react-bootstrap/Image";
import Pagination from "react-bootstrap/Pagination";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";

function PokeDex() {
  const [pokemons, setPokemons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [textHover, setTextHover] = useState({ index: 0, isHover: false });
  const [maxValue, setMaxValue] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const componenttoprint = useRef();

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      maxWidth: "800px",
      width: "100%",
      padding: "20px",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "black",
      color: "white",
      borderRadius: "20px",
    },
  };

  useEffect(() => {
    setIsLoading(true);
    fetchingPokedex();
  }, []);

  //this function for checking status when base stat > 100
  //bacacuse chart bar is maximumn = 100
  //and chart bar that base stat = 100 or base stat > 100 will display same result
  useEffect(() => {
    let maxValue = 100;
    if (pokemonDetail !== null) {
      pokemonDetail.stats?.map((item) => {
        if (item?.base_stat > maxValue) {
          setMaxValue(item.base_stat);
        }
      });
    }
  }, [pokemonDetail]);

  useEffect(() => {
    fetchingPokedex();
  }, [currentPage]);

  const onPreviousPage = () => {
    return setCurrentPage(currentPage - 1);
  };

  const onNextPage = () => {
    return setCurrentPage(currentPage + 1);
  };

  const fetchingPokedex = async () => {
    const pokedexRes = await axios.get(
      `https://pokeapi.co/api/v2/pokemon?offset=${
        currentPage === 1 ? 0 : currentPage * 20
      }&limit=20`
    );
    if (pokedexRes?.data?.results) {
      setLastPage(Math.floor(pokedexRes.data.count / 20) ?? 0);
      setPokemons(pokedexRes.data.results);
      setIsLoading(false);
    }
  };

  const handlePokemonDetails = async (pokemonUrl) => {
    const PokemonDetailRes = await axios.get(pokemonUrl);
    setPokemonDetail(PokemonDetailRes?.data ?? null);
  };

  const handleDownloadPdf = async () => {
    html2canvas(componenttoprint.current, {
      logging: true,
      letterRendering: 1,
      allowTaint: false,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      console.log("imgData :", imgData);
      const pdf = new jsPDF();
      console.log(pdf);
      pdf.addImage(imgData, "PNG", 0, 0, 0, 0);
      pdf.save("download.pdf");
    });
  };

  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoading && pokemons.length === 0) {
    return (
      <div>
        <header className="App-header">
          <h1>Welcome to pokedex !</h1>
          <h2>Requirement:</h2>
          <ul>
            <li>
              Call this api:https://pokeapi.co/api/v2/pokemon to get pokedex,
              and show a list of pokemon name.
            </li>
            <li>Implement React Loading and show it during API call</li>
            <li>
              when hover on the list item , change the item color to yellow.
            </li>
            <li>when clicked the list item, show the modal below</li>
            <li>
              Add a search bar on top of the bar for searching, search will run
              on keyup event
            </li>
            <li>Implement sorting and pagingation</li>
            <li>Commit your codes after done</li>
            <li>
              If you do more than expected (E.g redesign the page / create a
              chat feature at the bottom right). it would be good.
            </li>
          </ul>
        </header>
      </div>
    );
  }

  return (
    <div>
      <header className="App-header">
        {isLoading ? (
          <>
            <div className="App">
              <header className="App-header">
                {/* <b>Implement loader here</b> */}
                <ReactLoading />
              </header>
            </div>
          </>
        ) : (
          <>
            <h1>Welcome to pokedex !</h1>

            <InputGroup style={{ maxWidth: "400px" }} className="mb-3">
              <Form.Control
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Text input with dropdown button"
              />

              <DropdownButton
                variant="outline-secondary"
                title="Sort by"
                id="input-group-dropdown-2"
              >
                <Dropdown.Item
                  onClick={() => {
                    return fetchingPokedex();
                  }}
                  href="#"
                >
                  Default
                </Dropdown.Item>
                <Dropdown.Item
                  href="#"
                  onClick={() => {
                    const sorting = filteredPokemons.sort(function (a, b) {
                      if (a.name < b.name) {
                        return -1;
                      }
                      if (a.name > b.name) {
                        return 1;
                      }
                      return 0;
                    });
                    return setPokemons(sorting);
                  }}
                >
                  A-Z
                </Dropdown.Item>
              </DropdownButton>
            </InputGroup>
            {/* <b>Implement Pokedex list here</b> */}
            {filteredPokemons.map((pokemon, index) => (
              <li
                key={index}
                onMouseEnter={() =>
                  setTextHover({ index: index, isHover: true })
                }
                onMouseLeave={() =>
                  setTextHover({ index: index, isHover: false })
                }
                onClick={() => handlePokemonDetails(pokemon.url)}
                style={{
                  cursor: "pointer",
                  color:
                    textHover.index === index && textHover.isHover
                      ? "yellow"
                      : "",
                }}
              >
                {pokemon.name}
              </li>
            ))}
            <div style={{ marginTop: "20px" }}>
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => onPreviousPage()}
                />

                {currentPage === 1 ? (
                  <>
                    <Pagination.Ellipsis disabled />
                    <Pagination.Item onClick={() => null} active={currentPage}>
                      {currentPage}
                    </Pagination.Item>
                    <Pagination.Item
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </Pagination.Item>
                    <Pagination.Item
                      onClick={() => setCurrentPage(currentPage + 2)}
                    >
                      {currentPage + 2}
                    </Pagination.Item>
                  </>
                ) : null}

                {currentPage === 1 || currentPage === lastPage ? null : (
                  <>
                    {currentPage > 2 ? (
                      <Pagination.Item onClick={() => setCurrentPage(1)}>
                        {1}
                      </Pagination.Item>
                    ) : null}

                    <Pagination.Ellipsis
                      onClick={() => setCurrentPage(currentPage - 10)}
                      disabled={currentPage <= 9}
                    />
                    <Pagination.Item
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </Pagination.Item>
                    <Pagination.Item onClick={() => null} active={true}>
                      {currentPage}
                    </Pagination.Item>

                    <Pagination.Item
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </Pagination.Item>
                    <Pagination.Ellipsis
                      onClick={() => setCurrentPage(currentPage + 10)}
                      disabled={currentPage >= lastPage - 9}
                    />

                    {currentPage < lastPage - 1 ? (
                      <Pagination.Item onClick={() => setCurrentPage(lastPage)}>
                        {lastPage}
                      </Pagination.Item>
                    ) : null}
                  </>
                )}

                {currentPage === lastPage ? (
                  <>
                    <Pagination.Item
                      onClick={() => setCurrentPage(lastPage - 2)}
                    >
                      {lastPage - 2}
                    </Pagination.Item>
                    <Pagination.Item
                      onClick={() => setCurrentPage(lastPage - 1)}
                    >
                      {lastPage - 1}
                    </Pagination.Item>
                    <Pagination.Item active>{lastPage}</Pagination.Item>
                    <Pagination.Ellipsis disabled />
                  </>
                ) : null}

                <Pagination.Next
                  disabled={currentPage === lastPage}
                  onClick={() => onNextPage()}
                />
                <Pagination.Last
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(lastPage)}
                />
              </Pagination>
            </div>
          </>
        )}
      </header>
      {pokemonDetail && (
        <div ref={componenttoprint}>
          <Modal
            ref={componenttoprint}
            // ref={(el) => (componenttoprint.current = el)}
            isOpen={pokemonDetail !== null}
            contentLabel={pokemonDetail?.name || ""}
            ariaHideApp={false}
            onRequestClose={() => {
              setPokemonDetail(null);
            }}
            style={customStyles}
          >
            <div ref={componenttoprint} style={{ textAlign: "center" }}>
              <h1
                style={{
                  marginTop: "10px",
                  color: "rgba(220, 53, 69)",
                }}
              >
                Name : {pokemonDetail?.name}
              </h1>
              <Image
                ref={componenttoprint}
                style={{
                  backgroundColor: "rgba(220, 53, 69,0.3)",
                  border: "1px solid rgba(220, 53, 69)",
                  height: "200px",
                  borderRadius: "20px",
                }}
                alt="pokemon"
                src={pokemonDetail?.sprites?.front_default}
              />
              <h2
                style={{
                  marginTop: "10px",
                  color: "rgba(220, 53, 69)",
                  textAlign: "left",
                }}
              >
                Status Details
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Table
                  striped
                  bordered
                  hover
                  variant="dark"
                  style={{
                    width: "100%",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Stat</th>
                      <th>Base Stat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pokemonDetail?.stats?.map((item, index) => (
                      <tr key={index}>
                        <td>{item?.stat?.name}</td>
                        <td
                          style={{
                            width: "70%",
                          }}
                        >
                          <ProgressBar
                            animated
                            variant="danger"
                            label={`${item.base_stat}`}
                            now={`${(item.base_stat * 100) / maxValue}`}
                          />
                          {/* {item?.base_stat} */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Button
                variant="danger"
                style={{ width: "130px", height: "50px" }}
                onClick={() => handleDownloadPdf()}
              >
                Download
              </Button>

              {/* <p>Requirement:</p>
              <ul>
                <li>show the sprites front_default as the pokemon image</li>
                <li>
                  Show the stats details - only stat.name and base_stat is
                  required in tabular format
                </li>
                <li>Create a bar chart based on the stats above</li>
                <li>
                  Create a buttton to download the information generated in this
                  modal as pdf. (images and chart must be included)
                </li>
              </ul> */}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default PokeDex;
