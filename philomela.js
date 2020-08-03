const PHILOMELA = {
  TOKEN: PropertiesService.getScriptProperties().getProperty('PHILOMELA_TOKEN')
};

const DISCORD = {
  INCOMING_URL: PropertiesService.getScriptProperties().getProperty('DISCORD_INCOMING_URL')
};

const VIDEO_URL_PREFIX = 'https://www.youtube.com/watch';

const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
const memoriesSheet = spreadSheet.getSheetByName('memories');

const doGet = e => {
  if (e.parameter.token !== PHILOMELA.TOKEN) {
    return;
  }

  switch (e.parameter.action) {
    case 'memories':
      let memories = memoriesSheet.getDataRange()
                                  .getValues()
                                  .map(row => new MemoryRow(row));

      if (toBoolean(e.parameter.randomize)) {
        memories = shuffle(memories);
      }

      const response = ContentService.createTextOutput();
      response.setMimeType(ContentService.MimeType.JAVASCRIPT);
      response.setContent(JSON.stringify({ memories: memories }));

      return response;
  }
}

const doPost = e => {
  const requestParameter = requestBodyToHash(e.postData.contents);

  if(requestParameter.token !== PHILOMELA.TOKEN) {
    return;
  }

  const memoryUrls = memoriesSheet.getDataRange()
                                  .getValues()
                                  .map(row => new MemoryRow(row))
                                  .map(row => row.url);

  requestParameter.text
                  .match(/<.+>/g)
                  .map(t => t.replace('<', '').replace('>', ''))
                  .filter(t => t.startsWith(VIDEO_URL_PREFIX))
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

const requestBodyToHash = body => {
  return body.split('&').reduce((result, parameter) => {
    const [key, value] = parameter.split('=');
    result[key] = decodeURIComponent(value);

    return result;
  }, {});
}

const shuffle = array => {
  const result = [];
  for(i = array.length; i > 0; i--){
    const index = Math.floor(Math.random() * i);
    const val = array.splice(index, 1)[0];
    result.push(val);
  }

  return result;
}

const toBoolean = obj => {
  return String(obj).toLowerCase() === 'true';
}
