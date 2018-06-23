const fetch = require('node-fetch');

const key = 'bb9067bf83df701a40ae9c645da44f46';

async function getWeather(zip, country) {
  const res = await fetch(`http://api.openweathermap.org/data/2.5/weather?zip=${zip},${country}&appid=${key}`);
  return res.json();
}

module.exports = getWeather;
