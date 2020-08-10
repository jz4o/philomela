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

      const limit = Number(e.parameter.limit);
      if (limit !== NaN && limit >= 0) {
        memories = memories.slice(0, limit);
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

  if (requestParameter.text === 'updateUrlTitle') {
    updateUrlTitle(requestParameter.url, requestParameter.title);
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

const updateUrlTitle = (url, title) => {
  const lastRow = memoriesSheet.getLastRow();
  const lastColumn = Object.keys(MemoryRow.COLUMN_INDEXES()).length;
  const dataRange = memoriesSheet.getRange(1, 1, lastRow, lastColumn);

  const memoryRows = dataRange.getValues().map(row => new MemoryRow(row));
  const targetMemoryRow = memoryRows.find(memoryRow => memoryRow.url === url);
  if (!!targetMemoryRow) {
    targetMemoryRow.title = title;
  }

  const memoryArrays = memoryRows.map(memoryRow => memoryRow.toArray());
  dataRange.setValues(memoryArrays);
}
