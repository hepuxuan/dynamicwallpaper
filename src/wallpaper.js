const wallpaper = require('wallpaper');
const getWeather = require('./services/weatherService');
const downloadPhoto = require('./services/photoService');
const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json')));

let zip = config.zip;
let country = config.country || 'us';

ipcMain.on('get-zipcode', (event) => {
  event.sender.send('update-zipcode', zip);
});

ipcMain.on('get-country', (event) => {
  event.sender.send('update-country', country);
});

async function setWallpaper() {
  if (!zip || !country) {
    return;
  }

  const weather = await getWeather(zip, country);

  const weatherCondition = weather.weather[0].main.toLowerCase();

  const sunset = new Date(weather.sys.sunset * 1000).valueOf();
  const sunrise = new Date(weather.sys.sunrise * 1000).valueOf();
  const currentTime = new Date().valueOf();
  const isDay = currentTime > sunrise && currentTime < sunset;
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

function getZipcode() {
  return zip;
}

module.exports = {
  setWallpaper,
  updateZipCode,
  updateCountry,
  getZipcode,
};
