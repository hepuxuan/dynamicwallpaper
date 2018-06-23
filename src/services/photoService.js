const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const key = '28c6cd2719dc72474e1fc63c3663f19ea3c3831cdcb0ca81162598e0adb63f35';
const weatherMap = {
  clear: 'sunny',
  clouds: 'clouds',
  drizzle: 'rain',
  mist: 'clouds',
  rain: 'rain',
  thunderstorm: 'rain',
  snow: 'snow',
};

async function downloadPhoto(location, weather, time) {
  const res = await fetch(`https://api.unsplash.com/search/photos/?query=${location}-${weatherMap[weather]}-${time}&client_id=${key}`);
  const results = (await res.json()).results;

  const length = Math.min(10, results.length);

  const image = results[Math.floor(Math.random() * length)];

  const res2 = await fetch(image.urls.raw);
  const file = path.resolve(__dirname, `../images/${image.id}.jpg`);
  await new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(file);
    res2.body.pipe(dest);
    res2.body.on('error', err => {
      reject(err);
    });
    dest.on('finish', () => {
      resolve();
    });
    dest.on('error', err => {
      reject(err);
    });
  });

  return file;
}

module.exports = downloadPhoto;
