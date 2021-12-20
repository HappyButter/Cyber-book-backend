import authRouter from './auth.js';
import bookRouter from './book.js';
import userRouter from './user.js';

const mountRouter = app => {
    app.use('/auth', authRouter);
    app.use('/book', bookRouter);
    app.use('/user', userRouter);
}

export default mountRouter;