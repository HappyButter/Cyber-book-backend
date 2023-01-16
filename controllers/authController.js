import session from '../db/db.js';

class AuthController {
    register = async (req, res) => {
        try{
            const { firstName, lastName, email, password } = req.body;
            
            const user = await session.run(`
				CREATE (u:User {
					id: apoc.create.uuid(), 
					firstName: $firstName, 
					lastName: $lastName, 
					email: $email, 
					password: $password
				}) RETURN u.id, u.firstName, u.lastName, u.email
				`, { firstName, lastName, email, password });

				
			if(user.records.length === 0) {
				res.status(400).send("Something went wrong");
			}

			const returnedUserFields = user.records[0]._fields;
			const newUser = {
				id: returnedUserFields[0],
				firstName: returnedUserFields[1],
				lastName: returnedUserFields[2],
				email: returnedUserFields[3]
			}
			res.status(201).send(newUser);

        }catch(err){
            res.status(409).send("User with such an email already exists");
        }
    }

    login = async (req, res) => {
        try{
            const { email, password } = req.body;
            const user = await session.run(`
				MATCH (u:User) 
				WHERE u.email=$email AND u.password=$password 
				RETURN u.id, u.firstName, u.lastName, u.email
            `, {email, password});

            if(user.records.length === 0) {
				res.status(400).send("Something went wrong");
			}

			const returnedUserFields = user.records[0]._fields;
			
			console.log(returnedUserFields);

			const userMapped = {
				id: returnedUserFields[0],
				firstName: returnedUserFields[1],
				lastName: returnedUserFields[2],
				email: returnedUserFields[3]
			}
			res.status(200).send(userMapped);
        }catch(err){
			console.log(err)
            res.status(400).send("Invalid email or password");
        }
    }
}

const authController = new AuthController();

export default authController;