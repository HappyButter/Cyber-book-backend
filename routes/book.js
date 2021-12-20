import express from 'express';
import bookController from '../controllers/bookController.js';

const { Router } = express;
const bookRouter = Router();

bookRouter.post('/', bookController.addBook);
bookRouter.get('/all', bookController.getAll);
bookRouter.get('/isbn/:isbn', bookController.getBookByISBN);
bookRouter.post('/title', bookController.getBookByTitle);
bookRouter.post('/review', bookController.rateBook);
bookRouter.get('/reviews/:isbn', bookController.getReviewsByISBN);
bookRouter.get('/best-ratings', bookController.getBestRated);

export default bookRouter;