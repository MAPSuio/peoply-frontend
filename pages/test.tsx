import { Models } from "azure-maps-rest";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { isPromise } from "util/types";
import ExpandableCard from "../components/ExpandableCard";
import CheckboxInput from "../components/inputs/CheckboxInput";
import Modal from "../components/Modal";
import MyEventCard from "../components/MyEventCard";
import SettingsButton from "../components/SettingsButton";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { fetchIpInfo } from "../services/ip";
import { searchLocationsFuzzy } from "../services/maps";
import styles from "../styles/Test.module.scss";

// import debounce from lodash

const Test: NextPage = () => {
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] =
    useState<Models.SearchFuzzyResult[]>();

  const [searchTimeout, setSearchTimeout] =
    useState<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(input);
    }, 1000);
    setSearchTimeout(t);
  }, [input]);

  useEffect(() => {
    fetchIpInfo().then((ip) => {
      searchQuery &&
        searchLocationsFuzzy(searchQuery, {
          lat: ip.latitude,
          lon: ip.longitude,
          countrySet: [ip.country],
        }).then((res) => {
          setSearchResults(res.results);
        });
    });
  }, [searchQuery]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              searchTimeout && clearTimeout(searchTimeout);
            }}
            placeholder="Search"
          />
          <div>
            {searchResults &&
              searchResults.map((result) => {
                return (
                  <div
                    key={result.id}
                    style={{ backgroundColor: "black", marginBottom: "5px" }}
                  >
                    <div>{result.poi?.name}</div>
                    <div>{result.address?.freeformAddress}</div>
                  </div>
                );
              })}
          </div>
        </div>
        {/* <h1>Event card</h1>
        {event && <MyEventCard event={event} />}
        <ExpandableCard title="Her kommer tittel">
          <p>
            Peoply lagrer kun persondataen som kommer fra innloggingen gjennom
            Vipps. Dette inkluderer:
          </p>
          <ul>
            <li>Fornavn</li>
            <li>Etternavn</li>
            <li>Telefonnummer</li>
            <li>Fødselsdato</li>
            <li>Email</li>
          </ul>
        </ExpandableCard>
        <Modal
          label="Her kommer tittel"
          description="In maiores voluptatem rerum ut nemo ipsa ut omnis. Ut cupiditate consequatur qui quo. Sunt ea illo facere. Fuga veritatis nisi ut. Adipisci autem quia quisquam mollitia ut minima nobis. Quia et aperiam dolorem."
          buttonText="Her kommer det en action"
          buttonOnClick={() => console.log("Her kommer gutta")}
        /> */}
      </div>
    </div>
  );
};

export default Test;
