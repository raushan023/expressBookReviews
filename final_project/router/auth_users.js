const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid

  let users_with_same_name = users.filter(user => user.username === username);

  return users_with_same_name.length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.

  const existing_user = users.find(user => user.username === username && user.password === password);

  return existing_user ? true : false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) return res.status(400).json({ message: "missing username or password" });
  if (!isValid(username)) res.status(400).json({ message: "need to register before login" });
  if (authenticatedUser(username, password)) {
    // create jwt token
    let accessToken = jwt.sign({ data: password }, "fingerprint_customer", { expiresIn: 60 * 60 });

    // store accesstoken and username in session
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "user is logged in" });
  }
  else return res.status(400).json({ message: "incorrect username or password" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  const found_book = books[isbn];
  if (found_book) {
    found_book.reviews[username] = review;

    return res.status(200).json({
      message: `Review for ISBN ${isbn} has been added/updated.`,
      reviews: found_book.reviews
    })
  }
  else return res.status(404).json({ message: "book not found" });

});

// delete user review of book
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  const found_book = books[isbn];
  if (found_book) {
    delete found_book.reviews[username];

    return res.status(200).json({
      message: `Review for ISBN ${isbn} has been deleted.`
    })
  }
  else return res.status(404).json({ message: "book not found" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
