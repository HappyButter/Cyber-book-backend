import session from '../db/db.js';

class BookController {
  	addBook = async (req, res) => {
		const bookToBeAdded = req.body;
		const transaction = session.beginTransaction()

      	try{
			await transaction.run(`
				CREATE (b:Book {
					ISBN: $isbn, 
					title: $title,
					description: $description,
					publisher: $publisher,
					pageCount: $pageCount,
					language: $language,
					published_date: $publishedDate,
					rate: $rate,
					voteCount: $voteCount 
				}) RETURN b.title;
				`, 
				{
					...bookToBeAdded, 
					isbn: bookToBeAdded.ISBN,
					pageCount: bookToBeAdded.page_count,
					publishedDate: bookToBeAdded.published_date,
					rate: 0,
					voteCount: 0
				});

			await transaction.run(`
				UNWIND $genres AS genre 
				MERGE (g:Genre {name: genre})
				RETURN g.name;
				`, 
				{genres: bookToBeAdded.generes});

			await transaction.run(`
				UNWIND $genres AS genre 
				MATCH (g:Genre), (b:Book)
				WHERE b.ISBN = $isbn AND g.name = genre
				CREATE (b)-[r:HAS_GENRE]->(g)
				RETURN genre;
				`, 
				{	genres: bookToBeAdded.generes,
					isbn: bookToBeAdded.ISBN
				});

			await transaction.run(`
				MERGE (a:Author {name: $author})
				RETURN a.name;
				`, 
				{	author: bookToBeAdded.author,
				});

			await transaction.run(`
				MATCH (a:Author), (b:Book)
				WHERE b.ISBN = $isbn AND a.name = $author
				CREATE (a)-[:WROTE]->(b)
				RETURN a.name;
				`, 
				{	
					author: bookToBeAdded.author,
					isbn: bookToBeAdded.ISBN
				});

				
			await transaction.commit();
    		res.status(201).send("ok");
		} catch (err) {				
			console.log(err.message)
			await transaction.rollback()
			res.status(400).send("Something went wrong");
		}
  	}

	getBestRated = async (req, res) => {
		try {
			const bestBooks = await session.run(`
				MATCH (a:Author)-[:WROTE]->(b:Book) 
				WITH [(b)-[:HAS_GENRE]->(g) WHERE g:Genre | g.name] AS genres, b, a 
				ORDER BY b.rate DESC
				RETURN collect({author: a.name, book: b, genres: genres})
				LIMIT 6
				`);

			const booksMapped = bestBooks.records[0]._fields[0].map(book => ({
				author: book.author,
				genres: book.genres,
				...book.book.properties
			}));

			res.status(200).send(booksMapped);
		} catch (err) {
			res.status(400).send("Could not get best rated books");
		}
	}

	getAll = async (req, res) => {
		try {
			const books = await session.run(`
				MATCH (a:Author)-[:WROTE]->(b:Book) 
				WITH [(b)-[:HAS_GENRE]->(g) WHERE g:Genre | g.name] AS genres, b, a 
				RETURN collect({author: a.name, book: b, genres: genres})
				`);

			const booksMapped = books.records[0]._fields[0].map(book => ({
				author: book.author,
				genres: book.genres,
				...book.book.properties
			}));

			res.status(200).send(booksMapped);
		} catch (err) {
			res.status(400).send("Could not get best rated books");
		}
	}

	getBookByISBN = async (req, res) => {
		try {
            const isbn = parseInt(req.params.isbn);

			const bestBooks = await session.run(`
				MATCH (a:Author)-[:WROTE]->(b:Book {ISBN: $isbn}) 
				WITH [(b)-[:HAS_GENRE]->(g) WHERE g:Genre | g.name] AS genres, b, a
				RETURN collect({author: a.name, book: b, genres: genres})
				`, {isbn});

			const booksMapped = bestBooks.records[0]._fields[0].map(book => ({
				author: book.author,
				genres: book.genres,
				...book.book.properties
			}));

			res.status(200).send(booksMapped);
		} catch (err) {
			res.status(400).send("Could not get book");
		}
	}

	getBookByTitle = async (req, res) => {
		try {
			const { title } = req.body;

			const bestBooks = await session.run(`
				MATCH (a:Author)-[:WROTE]->(b:Book) 
				WHERE toLower(b.title) CONTAINS toLower($title)
				WITH [(b)-[:HAS_GENRE]->(g) WHERE g:Genre | g.name] AS genres, b, a
				RETURN collect({author: a.name, book: b, genres: genres})
				`, {title});

			const booksMapped = bestBooks.records[0]._fields[0].map(book => ({
				author: book.author,
				genres: book.genres,
				...book.book.properties
			}));

			res.status(200).send(booksMapped);
		} catch (err) {
			res.status(400).send("Could not get book");
		}
	}

	rateBook = async (req, res) => {
		const transaction = session.beginTransaction()
		try {
			const {userId, isbn, rate, review} = req.body;
		
			await transaction.run(`
				MATCH (a:User {id: $userId})
				MATCH (b:Book {ISBN: $isbn})
				MERGE (a)-[r:REVIEWED {rate: $rate, review: $review, creationDate: $creationDate}]->(b)
				RETURN r
			`, {
				userId, 
				isbn: parseInt(isbn), 
				rate, 
				review, 
				creationDate: Date.now()
			})
			
			await transaction.run(`
				MATCH (b:Book {ISBN: $isbn})<-[r:REVIEWED]-()
				WITH avg(r.rate) AS averageRate, count(*) as countReviews, b
				SET b.rate = averageRate, b.voteCount = countReviews
				RETURN averageRate, countReviews
			`, {isbn: parseInt(isbn)})

			await transaction.commit();
    		res.status(200).send("ok");
		} catch (err) {
			console.log(err);
			res.status(400).send("Could not add a review");
		}
	}

	getReviewsByISBN = async (req, res) => {
		try {
			const isbn = parseInt(req.params.isbn);
			
			const rawReviews = await session.run(`
				MATCH (b:Book {ISBN: $isbn})<-[r:REVIEWED]-(u:User)
				RETURN collect({
					rate: r.rate, 
					review: r.review, 
					creationDate: r.creationDate,
					authorFirstName: u.firstName,
					authorLastName: u.lastName,
					authorId: u.id
				})`
				,{isbn})

			const reviews = rawReviews.records[0]._fields[0];
			res.status(200).send(reviews)
		} catch (err) {
			res.status(400).send("Could not get reviews");
		}
	}
}

const bookController = new BookController();

export default bookController;