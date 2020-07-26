const PHILOMELA = {
  TOKEN: PropertiesService.getScriptProperties().getProperty('PHILOMELA_TOKEN')
};

const DISCORD = {
  INCOMING_URL: PropertiesService.getScriptProperties().getProperty('DISCORD_INCOMING_URL')
};

const doPost = e => {
  if(e.parameter.token !== PHILOMELA.TOKEN) {
    return;
  }

  e.parameter.text.match(/<.+>/)
                  .map(t => t.replace('<', '').replace('>', ''))
                  .forEach(t => postMessageToDiscord(t));
}

const postMessageToDiscord = message => {
  const options = {
    'method'     : 'post',
    'contentType': 'application/json',
    'payload'    : JSON.stringify({ 'content': message })
  };

  UrlFetchApp.fetch(DISCORD.INCOMING_URL, options);
}
