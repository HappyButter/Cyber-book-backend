import bookList from './books.json';
import fs from 'fs';
// const bookList = require('./books.json');



console.log(bookList.length)

const mappedBookList = bookList.reduce((prev, book) => {
  if (book.generes === "none") return prev;
  return [...prev, {...book, genres: book.generes.split(',')}];
}, [])

console.log(mappedBookList.length)

fs.writeFile('converted_fixed.json', JSON.stringify(mappedBookList), function (err) {
  if (err) {
    console.log(err);
    throw err;
  }
  console.log('Saved!');
});

