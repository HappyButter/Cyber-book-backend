import books from './converted_fixed.json';
import axios from 'axios';

populate(0,10);

async function populate(start, end) {
  const bookList = books.slice(start, end) 

  try {
    await bookList.reduce(async (promise, book) => {
        await promise;

        const res = await axios.post("http://localhost:8081/book/", {...book});
        console.log(res);
    }, Promise.resolve())
  } catch (err) {
    console.log(err)
  }
} 

