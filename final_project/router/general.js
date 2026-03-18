const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });

      return res.status(201).json({ message: "User successfully registered" });
    }
    else return res.status(409).json({ message: "User already exists" });
  }
  else return res.status(400).json({ message: "username or password is required for registration" });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {

  const getBooks = new Promise((resolve, reject) => {
    if (books) resolve(books);
    else reject("Unable to fetch books");
  });

  getBooks
    .then(bookList => res.status(200).json(bookList))
    .catch(error => res.status(500).json({ message: error }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here
  const getBookBasedOnISBN = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const found_book = books[isbn];

    if (found_book) resolve(found_book);
    else reject("Unable to find book with isbn: " + isbn);
  });

  getBookBasedOnISBN
    .then(book => res.status(200).json(book))
    .catch(error => res.status(403).json({ message: error }));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const found_books = Object.values(books).filter(
      book => book.author.trim().toLowerCase() === author.trim().toLowerCase()
    );

    if (found_books.length > 0) resolve(found_books);
    else reject(`No books found for author: ${author}`);
  });

  getBooksByAuthor
    .then(booksList => res.status(200).json(booksList))
    .catch(error => res.status(404).json({ message: error }));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here

  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const found_books = Object.values(books).filter(
      book => book.title.trim().toLowerCase() === title.trim().toLowerCase()
    );

    if (found_books.length > 0) resolve(found_books);
    else reject(`No books found with title: ${title}`);
  });

  getBooksByTitle
    .then(booksList => res.status(200).json(booksList))
    .catch(error => res.status(404).json({ message: error }));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  const book_with_same_isbn = books[isbn];

  if (book_with_same_isbn) return res.status(200).json(book_with_same_isbn.reviews);
  else return res.status(404).json({ message: "now books found with ISBN: " + isbn });
});

module.exports.general = public_users;
