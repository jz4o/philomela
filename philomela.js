const PHILOMELA = {
  TOKEN: PropertiesService.getScriptProperties().getProperty('PHILOMELA_TOKEN')
};

const DISCORD = {
  INCOMING_URL: PropertiesService.getScriptProperties().getProperty('DISCORD_INCOMING_URL')
};

const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
const memoriesSheet = spreadSheet.getSheetByName('memories');

const doPost = e => {
  if(e.parameter.token !== PHILOMELA.TOKEN) {
    return;
  }

  const memoryUrls = memoriesSheet.getDataRange()
                                  .getValues()
                                  .map(row => new MemoryRow(row))
                                  .map(row => row.url);

  e.parameter.text.match(/<.+>/g)
                  .map(t => t.replace('<', '').replace('>', ''))
                  .forEach(t => {
                    if (!memoryUrls.includes(t)) {
                      memoriesSheet.appendRow(new MemoryRow({ url: t }).toArray());
                    }

                    postMessageToDiscord(t);
                  });
}

const postMessageToDiscord = message => {
  const options = {
    'method'     : 'post',
    'contentType': 'application/json',
    'payload'    : JSON.stringify({ 'content': message })
  };

  UrlFetchApp.fetch(DISCORD.INCOMING_URL, options);
}
