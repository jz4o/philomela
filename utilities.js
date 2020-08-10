const requestBodyToHash = body => {
  return body.split('&').reduce((result, parameter) => {
    const [key, value] = parameter.split('=');
    result[key] = decodeURIComponent(value).replace(/%20/g, ' ');

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
