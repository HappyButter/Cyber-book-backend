import session from '../db/db.js';

class UserController {
	followUser = async (req, res) => {
		try {
			const {userId, userToFollowId} = req.body;
		
			const relationship = await session.run(`
				MATCH (a:User {id: $userId})
				MATCH (b:User {id: $userToFollowId})
				MERGE (a)-[r:FOLLOWS]->(b)
				RETURN r
			`, {userId, userToFollowId})
			
			if (relationship.records.length === 0) res.status(400).send("Couold not follow the user");

			res.status(200).send("ok");
		} catch (err) {
			res.status(400).send("Could not follow the user");
		}
  	}
	
	unfollowUser = async (req, res) => {
		try {
			const {userId, userToUnfollowId} = req.body;
		
			await session.run(`
				MATCH (a:User {id: $userId})-[r:FOLLOWS]->(b:User {id: $userToUnfollowId})
				DELETE r
			`, {userId, userToUnfollowId})

			res.status(200).send("ok");
		} catch (err) {
			res.status(400).send("Could not follow user");
		}
  	}

	getFollowedUsersReviews = async (req, res) => {
		try {
			const { userId } = req.body;

			const reviews = await session.run(`
			MATCH (u:User {id: $userId})-[:FOLLOWS]->(u2:User)-[r:REVIEWED]->(b:Book)<-[:WROTE]-(a:Author)
			WITH collect({firstName: u2.firstName, lastName: u2.lastName, authorId: u2.id}) as author, 
			collect({ISBN: b.ISBN, rate: b.rate, title: b.title, author: a.name}) as book, r
			RETURN collect({author: author, book: book, rate: r.rate, review: r.review, creationDate: r.creationDate})`, {userId});

			const reviewsMapped = reviews.records[0]._fields[0];
			res.status(200).send(reviewsMapped);
		} catch (err) {
			res.status(400).send("Could not get followed reviews");
		}
	}

	getUserByName = async (req, res) => {
		try {
			const { name, userId } = req.body;

			const users = await session.run(`
				MATCH (u:User)
				WHERE toLower(u.firstName + u.lastName) CONTAINS trim(toLower($name)) 
				OR toLower(u.lastName + u.firstName) CONTAINS trim(toLower($name))
				WITH u
				UNWIND u.id as ID
				MATCH (u1:User {id: $userId}), (u2:User {id: ID})
				WITH exists((u1)-[:FOLLOWS]->(u2)) as isFollowing, u2
				WHERE NOT u2.id=$userId 
				RETURN collect({isFollowed: isFollowing, firstName: u2.firstName, lastName: u2.lastName, id: u2.id})`
				,{name, userId});
			
			const usersMapped = users.records[0]._fields[0];
			res.status(200).send(usersMapped);
		} catch (err) {
			console.log(err)
			res.status(400).send("Could not find matching user");
		}
	}
}

const userController = new UserController();

export default userController;