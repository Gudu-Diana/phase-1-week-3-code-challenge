const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  getFirstMovieDetails(`${API_URL}/films/1`);
  fetchMoviesList(`${API_URL}/films`);
});

function getFirstMovieDetails(movieURL) {
  fetch(movieURL)
    .then(handleResponse)
    .then(displayMovieDetails)
    .catch(handleError);
}

function displayMovieDetails(movie) {
  const posterImage = document.getElementById('poster');
  posterImage.src = movie.poster;
  posterImage.dataset.filmId = movie.id;
  
  document.getElementById('title').textContent = movie.title;
  document.getElementById('runtime').textContent = `${movie.runtime} minutes`;
  document.getElementById('film-info').textContent = movie.description;
  document.getElementById('showtime').textContent = movie.showtime;
  
  const availableTickets = document.getElementById('ticket-num');
  availableTickets.textContent = movie.capacity - movie.tickets_sold;

  const buyButton = document.getElementById('buy-ticket');
  buyButton.addEventListener('click', () => buyTicket(movie));

  if (movie.tickets_sold >= movie.capacity) {
    buyButton.textContent = 'Sold Out';
    buyButton.disabled = true;
  }
}

function buyTicket(movie) {
  const remainingTickets = parseInt(document.getElementById('ticket-num').textContent);
  if (remainingTickets > 0) {
    const newTicketsSold = parseInt(document.getElementById('ticket-num').textContent) + 1;
    updateTicketsSold(movie.id, newTicketsSold)
      .then(updatedMovie => {
        updateAvailableTickets(updatedMovie);
        if (updatedMovie.tickets_sold >= updatedMovie.capacity) {
          disableBuyButton();
        }
      })
      .catch(handleError);
  }
}

function updateTicketsSold(movieId, newTicketsSold) {
  return fetch(`${API_URL}/films/${movieId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tickets_sold: newTicketsSold })
  })
  .then(handleResponse);
}

function updateAvailableTickets(movie) {
  const availableTickets = document.getElementById('ticket-num');
  availableTickets.textContent = movie.capacity - movie.tickets_sold;
}

function disableBuyButton() {
  const buyButton = document.getElementById('buy-ticket');
  buyButton.textContent = 'Sold Out';
  buyButton.disabled = true;
}

function fetchMoviesList(moviesURL) {
  const movieList = document.getElementById('films');
  fetch(moviesURL)
    .then(handleResponse)
    .then(movies => movies.forEach(movie => addMovieMenuItem(movie, movieList)))
    .catch(handleError);
}

function addMovieMenuItem(movie, list) {
  const menuItem = document.createElement('li');
  menuItem.textContent = movie.title;
  menuItem.dataset.filmId = movie.id;
  
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => {
    deleteMovie(movie.id)
      .then(() => menuItem.remove())
      .catch(handleError);
  });
  menuItem.appendChild(deleteBtn);
  
  list.appendChild(menuItem);
}

function deleteMovie(movieId) {
  return fetch(`${API_URL}/films/${movieId}`, {
    method: 'DELETE'
  })
  .then(handleResponse);
}

function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

function handleError(error) {
  console.error('Error:', error.message);
}
