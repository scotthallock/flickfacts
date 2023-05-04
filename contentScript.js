console.log('Content script loaded.');

// We should probably hide these lol
const OMDB_API_KEY = '6d89a28c';
const STREAMING_API_KEY = '3f7f5d8280mshe3685837ccd7e7bp1d6e52jsn71369741eb40';

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.greeting !== 'get_movie_data') return;

  const selectedText = window.getSelection().toString().trim();

  console.log('Got selection: ', selectedText);
  createPopUp(selectedText);
});

async function createPopUp(movieTitle) {
  // remove the popup there already is one
  let popup = document.getElementById('__flickfacts__');
  if (popup) popup.remove();

  movieTitle = movieTitle.replace(' ', '+');

  const cssString = `
    <style>
#__flickfacts__ {
  z-index: 10000;

  font-family: sans-serif;
  
  position: fixed;
  top: 50px;
  left: 50px;
  width: 600px;
  padding: 20px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
  
  border-radius: 0.5rem;
  background-color: rgba(15, 23, 42, 0.95);
  color: #f1f5f9;

  font-size: 16px;

  box-shadow:
    rgba(251, 190, 36, 0.4) 5px 5px,
    rgba(251, 190, 36, 0.3) 10px 10px,
    rgba(251, 190, 36, 0.2) 15px 15px,
    rgba(251, 190, 36, 0.1) 20px 20px,
    rgba(251, 190, 36, 0.05) 25px 25px;
}

#__flickfacts__ .left-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 10px;
}

#__flickfacts__ .title {
  font-size: 2rem;
}

#__flickfacts__ .genre-container {
  display: flex;
  gap: 1rem;
}

#__flickfacts__ .genre {
  font-size: 0.9rem;
  background: #fbbf24;
  color: #0f172a;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
}

#__flickfacts__ hr {
  width: 100%;
  border-color: #64748b;
}

#__flickfacts__ .rating-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

#__flickfacts__ .rating-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
}

#__flickfacts__ .score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f1f5f9;
}

#__flickfacts__ .poster-container {
  width: 250px;
}

#__flickfacts__ .poster-container img {
  display: inline-block;
  width: 100%;
  height: auto;
}

#__flickfacts__ .imdb-link {
  margin-top: auto;
  color: #f1f5f9;
  text-decoration: underline;
}

#__flickfacts__ .loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

#__flickfacts__ .spinner {
  height: 50px;
  width: 50px;
  border-radius: 50%;

  border-top: 4px solid #fff;
	border-right: 4px solid #fff;
	border-bottom: 4px solid #777;
	border-left: 4px solid #777;

  transform: rotate(-45deg);

  animation: flickfactsspin 1.2s infinite ease-in-out;
}

@keyframes flickfactsspin {
  to { transform: rotate(315deg) };
}

#__flickfacts__ .loading-message {
  font-size: 25px;
}
    </style>
  `;

  document.body.insertAdjacentHTML('beforeend', cssString);

  // create the popup parent container
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="__flickfacts__">
      <div class="loading-container">
        <div class="spinner"></div>
        <span class="loading-message">Loading data from FlickFacts</span>
      </div>
    </div>`
  );

  popup = document.getElementById('__flickfacts__');
  popup.addEventListener('click', () => popup.remove());

  // Fetch data from API
  const OMDB_URL = `https://www.omdbapi.com/?i=tt3896198&apikey=${OMDB_API_KEY}&t=${movieTitle}`;
  const res = await fetch(OMDB_URL);
  const data = await res.json();

  // Handle movie not found
  if (data.Error) {
    popup.innerHTML = '';
    popup.insertAdjacentHTML(
      'beforeend',
      `<div><span class="loading-message">Movie not found 😨</span></div>`
    );
    return;
  }

  setTimeout(() => {
    const dataContentHTML = `
    <div class="left-container">
    <span class="movie-data title">${data.Title}</span>
    <div class="movie-data">
      <span>${data.Year}</span>&nbsp;&nbsp;&#8226;&nbsp;&nbsp;
      <span>${data.Rated}</span>&nbsp;&nbsp;&#8226;&nbsp;&nbsp;
      <span>${data.Runtime}</span>
    </div>
    <div class="movie-data genre-container">
      ${data.Genre.split(', ').reduce((acc, genre) => {
        return acc + `<span class="genre">${genre}</span>`;
      }, '')}
    </div>
    <hr>
    <div class="rating-container">
      <div class="rating-wrapper">
        <span>Metascore</span>
        <span><span class="score">⭐ ${data.Metascore}</span> / 100</span>
      </div>
      <div class="rating-wrapper">
        <span>IMDB</span>
        <span><span class="score">⭐ ${data.imdbRating}</span> / 10</span>
      </div>
    </div>
    <hr>
    <span>🎬&nbsp;&nbsp;${data.Director}</span>
    <span>🏆&nbsp;&nbsp;${data.Awards}</span>
    <a class="imdb-link" href="https://www.imdb.com/title/${
      data.imdbID
    }" target="_blank">
      Go to IMDB page
    </a>
  </div>
  <div class="poster-container">
    <img src="${data.Poster}" alt="poster"/>
  </div>
`;

    popup.innerHTML = '';
    popup.insertAdjacentHTML('beforeend', dataContentHTML);
  }, 2000);
}
