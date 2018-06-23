const wallpaper = require('wallpaper');
const getWeather = require('./services/weatherService');
const downloadPhoto = require('./services/photoService');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json')));

let zip = config.zip;
let country = config.country || 'us';

async function setWallpaper() {
  if (!zip || !country) {
    return;
  }

  const weather = await getWeather(zip, country);

  const weatherCondition = weather.weather[0].main.toLowerCase();

  const sunsetHour = new Date(weather.sys.sunset).getHours();
  const sunriseHour = new Date(weather.sys.sunrise).getHours();
  const hour = new Date().getHours();
  const isDay = hour > sunriseHour && hour < sunsetHour;
  const time = isDay ? 'day' : 'night';

  const file = await downloadPhoto(weather.name, weatherCondition, time);

  wallpaper.set(file);
}

function updateZipCode(_zip) {
  zip = _zip;
  fs.writeFileSync(path.resolve(__dirname, 'config.json'), JSON.stringify({
    zip, country,
  }));
}

function updateCountry(_country) {
  country = _country;
  fs.writeFileSync(path.resolve(__dirname, 'config.json'), JSON.stringify({
    zip, country,
  }));
}

module.exports = {
  setWallpaper,
  updateZipCode,
  updateCountry,
};