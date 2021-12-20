import express from 'express';
import cors from 'cors';

import mountRouter from './routes/index.js';

const port = 9000; 
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

mountRouter(app);

app.get('/', (req, res) => {
  res.send("Works");
})

app.listen(port, () => {
  console.log(`Server listening`);
  console.log(`Link: http://localhost:${port}`);
})

