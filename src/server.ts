import express from "express";
import expressBasicAuth from "express-basic-auth";
import { DatabaseSync } from 'node:sqlite';
import path from "node:path";
import { fileURLToPath } from 'node:url';
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const db = new DatabaseSync('main.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT,
    title TEXT,
    description TEXT,
    tag TEXT,
    file TEXT
  )
`);



const app = express();
const port = 3000;

app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(expressBasicAuth({
  "users": {
    "admin": "admin"
  },
  challenge: true,
  realm: "TMC Restricted Area",
  "unauthorizedResponse": "401 Unauthorized"
}))

app.use(express.static('src/public'));

app.get("/api/task/list", (req, res) => {
  try {
    let {filter} = req.params;
    filter = filter || "";
    let query = db.prepare("SELECT * FROM tasks WHERE title LIKE '%' || ? || '%' OR description LIKE '%' || ? || '%'").all(filter, filter);
    res.json(query);
  }catch(e){
    console.log(e);
    res.status(500).send("500 Internal Server Error");
  }
})

app.post("/api/task/add", (req, res) => {
  try {
    const { title, description, file } = req.body;
    if ( title && description) {
      let insert = db.prepare('INSERT INTO tasks (public_id, title, description) VALUES (?, ?, ?)');
      let publicId = crypto.randomUUID();
      insert.run(publicId, title, description);
      res.status(200).send("OK");
    }else{
      res.status(400).send("400 Bad Request");
    }
  }catch(e) {
    console.log(e);
    res.status(500).send("500 Internal Server Error")
  }
})


app.listen(port, "127.0.0.1", () => {
  console.log(`Server running on http://localhost:${port}`);
});