import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const app=express();
const port=4000;
const apiKey = process.env.API_KEY;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/",(req,res)=>{
    res.render("./index.ejs");
});

app.post("/submit",async (req,res)=>{
    console.log(req.body);
    let { city, latitude, longitude } = req.body;
    city = city?.trim();
    try{
        let lat = req.body.lat;
        let lon=req.body.lon;
        
        if(lat!='' && lon!=''){
            
            
            const RevGeocodeRes=await axios.get(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
            city=RevGeocodeRes.data[0].name;
            
        }
        else{
            
            const GeocodeRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
            const GeocodeData=GeocodeRes.data;
            //console.log(GeocodeData);

            lat = GeocodeData.coord.lat;
            lon = GeocodeData.coord.lon;
        }

        const weatherRes=await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const weatherData=weatherRes.data;
        //console.log(weatherData);

        const airPollutionRes=await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const airPollutionData=airPollutionRes.data;
        //console.dir(airPollutionData,{ depth: null });

        const forcastRes=await axios.get(`https://pro.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const forcastData=forcastRes.data;
        //console.log(forcastData);

        const forcastHourlyRes=await axios.get(`https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&cnt=16&appid=${apiKey}`);
        const forcastHourlyData=forcastHourlyRes.data;
        //console.log(forcastHourlyData.list[8]);
        
        res.render("./index.ejs",{
            city,
            weatherData:weatherData,
            air:airPollutionData.list[0],
            forecast:forcastData,
            forecastHourly:forcastHourlyData
            
        });

    } catch (error) {
        console.error("Error calling API:", error.message);
        return res.status(500).render("./index.ejs", {
            error: "Failed to fetch data from API.",
            city: city || "Unknown",
            weatherData: null,
            air: null,
            forecast: null,
            forecastHourly: null
        });
    }
    
    
});

app.listen(port,()=>{
    console.log(`Listening on port: ${port}`);
});
