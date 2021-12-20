import express from 'express';
import userController from '../controllers/userController.js';

const { Router } = express;
const userRouter = Router();

userRouter.post('/name', userController.getUserByName);
userRouter.post('/follow', userController.followUser);
userRouter.post('/unfollow', userController.unfollowUser);
userRouter.post('/followed', userController.getFollowedUsersReviews);

export default userRouter;