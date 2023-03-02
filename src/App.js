import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react';

let WEATHERDATA=[{"temp" :"1", "time" :"1"}];



//Fetch function to fetch data based on inputted parameters an set data to it
function fetchWeatherData(city, handleData, handleError, handleIsLoaded, handleCoords){
  //Fetch Data
  useEffect(() => {
    let latitude;
    let longitude;
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
        .then(res => res.json())
        .then((result) => {
          console.log(result);
          latitude = result.results[0]["latitude"];
          longitude = result.results[0]["longitude"];
          latitude = Math.round(latitude * 100) / 100;
          longitude = Math.round(longitude * 100) / 100;
          handleCoords([latitude, longitude]);
          console.log(`FETCH STRING: https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`);
          return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&temperature_unit=fahrenheit`);
        })
        .then(res => res.json())
        .then((result) => {
          handleIsLoaded(true);
          //Manipulate it to just get the 1st 24 hrs
          let newData = result;
          let times=newData["hourly"]["time"].slice(0,24);
          let temps=newData["hourly"]["temperature_2m"].slice(0,24);
          console.log("Times: ", times);

          newData=times.map((elem, i)=>{
              return{"temp": temps[i], "time": elem}
          });

          console.log("Refined Data: ", newData);
          handleData(newData);
        },
        (error) => {
          handleIsLoaded(true);
          handleError(error);
        })
  }, []);
}

//Grabs weather data and displays it
export function WeatherUI(){
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [coords, setCoords] = useState(null);
  const [currCity, setCurrCity] = useState("Austin");

  //Create functions to set data
  let handleData=(newData) => setData(newData);
  let handleError=(newError) => setError(newError);
  let handleIsLoaded=(newIsLoaded) => setIsLoaded(newIsLoaded);
  let handleCoords=(newCoords) => setCoords(newCoords);

  //On click function to handle city button clicks
  const handleClick = async (city) => {
          console.log("CITY IN HANDLE CLICK: ", city);
          let latitude;
          let longitude;
          try {
            //Grab city coords
            setCurrCity(city);
            console.log("INPUTTED CITY:", city);
            console.log("FETCH STRING ON HANDLE: "+ `https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
            let res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
            let coordData = await res.json();
            //Send alert of error and reset to Austin
            if (coordData.results == null){
              alert("Inputted city not recognized");
              setCurrCity("Austin");
              return;
            }
            latitude = coordData.results[0]["latitude"];
            longitude = coordData.results[0]["longitude"];
            latitude = Math.round(latitude * 100) / 100;
            longitude = Math.round(longitude * 100) / 100;
            console.log("HANDLE CLICK COORDS:", latitude, longitude);

            //Grab weather data based off of city coords
            res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&temperature_unit=fahrenheit`);
            console.log(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`);
            let newData = await res.json();
            console.log("NEW HANDLE CLICK DATA:", newData);
            handleIsLoaded(true);
            let times=newData["hourly"]["time"].slice(0,24);
            let temps=newData["hourly"]["temperature_2m"].slice(0,24);
            console.log("Times: ", times);

            newData=times.map((elem, i)=>{
                return{"temp": temps[i], "time": elem}
            });

            console.log("Refined Data in HANDLE CLICK: ", newData);
            handleData(newData);

          } catch (error) {
              handleIsLoaded(true);
              handleError(error);
              console.log(error.message);
          }
      }

  fetchWeatherData(currCity, handleData, handleError, handleIsLoaded, handleCoords);
  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return(
      <>
        <CityButton city="Dallas" onCityClick={handleClick}></CityButton>
        <CityButton city="Austin" onCityClick={handleClick}></CityButton>
        <CityButton city="Norman" onCityClick={handleClick}></CityButton>
        <SearchBar onSearchClick={handleClick}></SearchBar>
        <TempTable weatherData={data} currCity={currCity}></TempTable>  
      </>
    );
  }
}

export function SearchBar({onSearchClick}){
  //Grab text from search bar
  const [inputText, setInputText] = useState("");
  let inputHandler = (e) => {
    //convert input text to lower case
    var lowerCase = e.target.value.toLowerCase();
    var currText = lowerCase.slice(0,1).toUpperCase() + lowerCase.slice(1,)
    setInputText(currText);
    console.log(currText);
  };

  useEffect(() => {
    console.log("Search message inside useEffect: ", inputText);
  }, [inputText]);



  return(
    <div>
      <input type="text" placeholder="City" onChange={inputHandler} />
      <button onClick={() => onSearchClick(inputText)}>Search</button>
    </div>
  );
}

//We want to grab data of different weathers and loop through them to display data
export function TempTable({weatherData, currCity}){
  //Get a row for each data point
    //console.log(weatherData);
    const tempRows = [];
    weatherData.forEach((currWeather) => {
      console.log(currWeather);
      tempRows.push(
        <TempRow temp={currWeather["temp"]} time={currWeather["time"]} key={currWeather["time"]}></TempRow>
      )
    }
  )
  return(
    <table>
      <thead>
        <tr>
          <th colSpan="2">{currCity}</th>
        </tr>
        <tr>
          <th>Time</th>
          <th>Temperature</th>
        </tr>
      </thead>
      <tbody>{tempRows}</tbody>
    </table>
  );
}

export function TempRow({temp, time}){
  return(
    <tr>
      <td>{time.slice(-5)}HR</td>
      <td>{temp} F</td>
    </tr>
  );
}

//Display on click when city Button is Clicked
export function CityButton({city, onCityClick}){

  //1. Fetch data when clicked

  return (
    <button onClick={() => onCityClick(city)}>{city}</button>
  );
} 

function App() {
  return (
      <WeatherUI></WeatherUI>
  );
}

 

export default App;
