const functions = require('firebase-functions')
const { Telegraf } = require('telegraf')
const axios = require('axios')

let config = require('./env.json');

if (Object.keys(functions.config()).length) {
  config = functions.config();
}

// Function to build Weather API URL
function buildWeatherApiUrl(query) {
  return `http://api.weatherstack.com/current?access_key=${config.service.apixu_key}&query=${encodeURIComponent(query)}`;
}


//bot initialization
const bot = new Telegraf(config.service.telegram_key)
bot.start((ctx) => ctx.reply('I can tell you the weather on whatever city you want. Tell me for example, \'London\' and I will bring you the exact temperature!'));
bot.on('text', (ctx) => {
  let query = ctx.update.message.text;
  const weatherApiUrl = buildWeatherApiUrl(query);

  axios.get(weatherApiUrl)
    .then(response => {
      const current = response.data;
      if (current.current !== null) {
        const message = `🌍 Showing Weather in **${query}**, **${current.location.country}**\n\n🌡️ **Temperature**: ${current.current.temperature}°C\n🌤️ **Weather**: ${current.current.weather_descriptions[0]}\n💨 **Wind Speed and Direction**: ${current.current.wind_speed} km/h ${current.current.wind_dir}\n🌫️ **Humidity**: ${current.current.humidity}%`;
        return ctx.reply(message);
      } else {
        return ctx.reply(`The current weather in ${query} is null\n\n${current.error.info}`);
      }
    })
    .catch(err => {
      return ctx.reply(`I couldn't find the city ${query}\n\nCaught Error:${err}`, err);
    });
});
bot.launch();

// Main function
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hi and welcome to Sky Reader: Telegram Bot!");

  const defaultCity = 'London';
  const weatherApiUrl = buildWeatherApiUrl(defaultCity);

  axios.get(weatherApiUrl)
    .then(response => {
      return response.send(response.data);
    })
    .catch(err => {
      return response.send(err);
    });
});
 // Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))