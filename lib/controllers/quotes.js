const { Router } = require('express');
const fetch = require('cross-fetch');

module.exports = Router().get('/', (req, res) => {
  const urlArr = [
    'https://programming-quotes-api.herokuapp.com/quotes/random',
    'https://futuramaapi.herokuapp.com/api/quotes/1',
    'https://api.quotable.io/random',
  ];

  function getQuoteArr(urlArr) {
    return Promise.all(urlArr.map((url) => fetch(url))).then((responses) => {
      return Promise.all(responses.map((response) => response.json()));
    });
  }
  function handleApiResponses(quote) {
    if (quote.en) return quote.en;
    if (quote.content) return quote.content;
    if (quote[0].quote) return quote[0].quote;
  }

  return getQuoteArr(urlArr)
    .then((quotes) =>
      quotes.map((quote) => {
        return {
          author: quote.author || quote[0].character,
          content: handleApiResponses(quote),
        };
      })
    )
    .then((quotes) => res.send(quotes));
});
