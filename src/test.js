// test.js
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({ apiKey: 'fakeKey' });
const openai = new OpenAIApi(configuration);

console.log('Success! No TypeError: Configuration is not a constructor');

