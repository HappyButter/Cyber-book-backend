// import session from '../db/db.js';

// class UsersController {
//     getUserByID = async (req, res) => {
//         try {
//             const { userId } = req.body;
//             const user = await session.run(`
// 				MATCH (u:User) 
// 				WHERE u.id=$id 
// 				RETURN u.id, u.firstName, u.lastName, u.email
//             `, {id: userId});

//             if(user.records.length === 0) {
// 				res.status(400).send("No such a user");
// 			}

// 			const returnedUserFields = user.records[0]._fields;
// 			const userMapped = {
// 				id: returnedUserFields[0],
// 				firstName: returnedUserFields[1],
// 				lastName: returnedUserFields[2],
// 				email: returnedUserFields[3]
// 			}
// 			res.status(200).send(userMapped);
//         } catch (err) {
// 			console.log(err)
//             res.status(400).send("Invalid user id");
//         }
//     }
// }

// const usersController = new UsersController();

// export default usersController;