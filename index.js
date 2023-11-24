import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const PORT = 3300; //Port number for the server goes here
const API_KEY = "openuv-94cewrlp6iezw0-io"; //API-Key
const app = express(); // instance of express
const END_POINT = "https://api.openuv.io/api/v1/uv";

app.use(express.static("public"));
app.use("/", bodyParser.urlencoded({ extended : true}));

app.get("/", async (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    ip = (ip === '::1' || ip === '127.0.0.1') ? '8.8.8.8' : ip ;
    var UV_Level = "";

    try{
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        const UV_response = await axios.get(END_POINT, {
            params: {
                "lat": response.data.lat,
                "lng": response.data.lon
            }
            ,
            headers: {
                'x-access-token': API_KEY
            }
        });

        UV_Level = UV_calurator(UV_response.data["result"]["uv_max"]);

        console.log(UV_Level);
        res.render("index.ejs", {
            "City" :  response.data["city"],
            "Region" : response.data["region"],
            "UV__Level" : UV_response.data["result"]["uv_max"],
            "UV_Written_Level" : UV_Level
        });
    }catch (error)
    {
        console.error("error!"+error.message);
    }
});

app.listen(PORT, () => {
    console.log("connected to 3300");
});

function UV_calurator(UV_max_Level)
{
    console.log(UV_max_Level);

    if (UV_max_Level <= 2.0 && UV_max_Level >= 1.0) {
        return "Low";
    } else if (UV_max_Level <= 5.0 && UV_max_Level >= 3.0) {
        return "Moderate";
    } else if (UV_max_Level <= 7.0 && UV_max_Level >= 6.0) {
        return "High";
    } else if (UV_max_Level <= 10.0 && UV_max_Level >= 8.0) {
        return "Very High";
    } else if (UV_max_Level >= 11.0) {
        return "Extreme";
    } else {
        return "None";
    }
}