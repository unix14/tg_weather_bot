const functions = require('firebase-functions')
const { Telegraf } = require('telegraf')
const apixu = require('apixu')

let config = require('./env.json');

if (Object.keys(functions.config()).length) {
  config = functions.config();
}
const apixuClient = new apixu.Apixu({
  apikey: config.service.apixu_key
});

//bot initialization
const bot = new Telegraf(config.service.telegram_key)
bot.start((ctx) => ctx.reply('I can tell you the weather on whatever city you want. Tell me for example, \'London\' and I will bring you the exact temperature!'));
bot.on('text', (ctx) => {
  let query = ctx.update.message.text;
  apixuClient.current(query).then((current) => {
    return ctx.reply(
      `The current weather in ${query} is C: ${current.current.temp_c} F:${current.current.temp_f}`);
  }).catch((err) => {
    return ctx.reply(`I Couldn\'t find the city ${query}`, err);
  });
});
bot.launch();

// Main function
exports.helloWorld = functions.https.onRequest((request, response) => {
  // apixuClient.current('London').then((current) => {
  //   return response.send(current);
  // }).catch((err) => {
  //   return response.send(err);
  // });
});
 // Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))