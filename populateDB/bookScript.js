import bookList from './books.json';
import fs from 'fs';
// const bookList = require('./books.json');



console.log(bookList.length)

const mappedBookList = bookList.reduce((prev, book) => {
  if (book.generes === "none") return prev;
  return [...prev, {...book, generes: book.generes.split(',')}];
}, [])

console.log(mappedBookList.length)

fs.writeFile('converted.json', JSON.stringify(mappedBookList), function (err) {
  if (err) throw err;
  console.log('Saved!');
});
