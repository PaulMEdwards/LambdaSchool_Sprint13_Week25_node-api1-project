const express = require('express');

const server = express();
server.use(express.json());
// server.use(cors());

const db = require("./data/db.js");

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log('*** listening on port '+port);
});

server.get('/', (req, res) => {
  res.send('hello world!');
});

server.get('/now', (req, res) => {
  let a = new Array();

  const d = new Date();
  const nd = "new Date()";
  
  a.push(`${nd}.toISOString(): ${d.toISOString()}`);

  a.push(`\n\n${nd}.toUTCString(): ${d.toUTCString()}`);

  a.push(`\n\n${nd}.toDateString(): ${d.toDateString()}`);
  a.push(`\n${nd}.toTimeString(): ${d.toTimeString()}`);
  a.push(`\n${nd}.toString(): ${d.toString()}`);

  var dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  a.push(`\n\ndateOptions = { month: 'long', day: 'numeric', year: 'numeric' }`);
  a.push(`\n${nd}.toLocaleDateString("en-US", dateOptions)+.toLocaleTimeString(): ${d.toLocaleDateString("en-US", dateOptions)} ${d.toLocaleTimeString()}`);
  a.push(`\n${nd}.toLocaleDateString("en-US", dateOptions): ${d.toLocaleDateString("en-US", dateOptions)}`);
  a.push(`\n${nd}.toLocaleTimeString(): ${d.toLocaleTimeString()}`);

  res.send(a.toString());
});

//#region Summary of All Endpoints
/*
| POST   | /api/users     | Creates a user using the information sent inside the `request body`.                                                              |
| GET    | /api/users     | Returns an array of all the user objects contained in the database.                                                               |
| GET    | /api/users/:id | Returns the user object with the specified `id`.                                                                                  |
| PUT    | /api/users/:id | Updates the user with the specified `id` using data from the `request body`. Returns the modified document, **NOT the original**. |
| DELETE | /api/users/:id | Removes the user with the specified `id` and returns the deleted user.                                                            |
*/
//#endregion Summary of All Endpoints

server.post('/api/users', (req, res) => {
  //#region Post Summary
  /*
    When the client makes a `POST` request to `/api/users`:

    - If the request body is missing the `name` or `bio` property:

      - respond with HTTP status code `400` (Bad Request).
      - return the following JSON response: `{ errorMessage: "Please provide name and bio for the user." }`.

    - If the information about the _user_ is valid:

      - save the new _user_ the the database.
      - respond with HTTP status code `201` (Created).
      - return the newly created _user document_.

    - If there's an error while saving the _user_:
      - respond with HTTP status code `500` (Server Error).
      - return the following JSON object: `{ errorMessage: "There was an error while saving the user to the database" }`.
  */
  //#endregion Post Summary

  if (!req.body.name || !req.body.bio) {
    res.status(400).json({ success: false, message: "Please provide name and bio for the user." });
  } else {
    db.insert(req.body)
      .then(user => {
        console.log(`POST /api/users/ insert(): \n`, user);
        res.status(201).json({ success: true, user: user });
      })
      .catch(err => {
        res.status(500).json({ success: false, errorMessage: err });
      });
  }
});

server.get('/api/users', (req, res) => {
  //#region Get All Users Summary
  /*
    When the client makes a `GET` request to `/api/users`:

    - If there's an error in retrieving the _users_ from the database:
      - respond with HTTP status code `500`.
      - return the following JSON object: `{ errorMessage: "The users information could not be retrieved." }`.
  */
  //#endregion Get All Users Summary

  db.find()
    .then(users => {
      console.log(`GET /api/users/ find(): \n`, users);
      res.status(200).json({ success: true, users });
    })
    .catch(err => {
      res.status(500).json({ success: false, errorMessage: "The users information could not be retrieved." });
    });
});

server.get('/api/users/:id', (req, res) => {
  //#region Get Single User By Id Summary
  /*
    When the client makes a `GET` request to `/api/users/:id`:

    - If the _user_ with the specified `id` is not found:

      - respond with HTTP status code `404` (Not Found).
      - return the following JSON object: `{ message: "The user with the specified ID does not exist." }`.

    - If there's an error in retrieving the _user_ from the database:
      - respond with HTTP status code `500`.
      - return the following JSON object: `{ errorMessage: "The user information could not be retrieved." }`.
  */
  //#endregion Get Single User By Id Summary

  const { id } = req.params;

  db.findById(id)
    .then(user => {
      console.log(`GET /api/users/:id findById(${id}): \n`, users);
      if (user) {
        res.status(200).json({ success: true, user });
      } else {
        res.status(404).json({ success: false, errorMessage: "The user with the specified ID does not exist." });
      }
    })
    .catch(err => {
      res.status(500).json({ success: false, errorMessage: "The user information could not be retrieved." });
    });
});

server.put('/api/users/:id', (req, res) => {
  //#region Update User Summary
  /*
    When the client makes a `PUT` request to `/api/users/:id`:

    - If the _user_ with the specified `id` is not found:

      - respond with HTTP status code `404` (Not Found).
      - return the following JSON object: `{ message: "The user with the specified ID does not exist." }`.

    - If the request body is missing the `name` or `bio` property:

      - respond with HTTP status code `400` (Bad Request).
      - return the following JSON response: `{ errorMessage: "Please provide name and bio for the user." }`.

    - If there's an error when updating the _user_:

      - respond with HTTP status code `500`.
      - return the following JSON object: `{ errorMessage: "The user information could not be modified." }`.

    - If the user is found and the new information is valid:

      - update the user document in the database using the new information sent in the `request body`.
      - respond with HTTP status code `200` (OK).
      - return the newly updated _user document_.
  */
  //#endregion Update User Summary

  const { id } = req.params;

  if (!req.body.name || !req.body.bio) {
    res.status(400).json({ success: false, message: "Please provide name and bio for the user." });
  } else {
    db.findById(id)
      .then(user => {
        if (user) {
          db.update(id, req.body)
          .then(userIdUpdated => {
            console.log(`PUT /api/users/:id update(${id}): \n`, userIdUpdated);
            if (userIdUpdated) {
              res.status(200).json({ success: true, userIdUpdated: userIdUpdated });
            }
          })
          .catch(err => {
            res.status(500).json({ success: false, errorMessage: "The user information could not be modified." });
          });
        } else {
          res.status(404).json({ success: false, errorMessage: "The user with the specified ID does not exist." });
        }
    });
  }
});

server.delete('/api/users/:id', (req, res) => {
  //#region Delete User Summary
  /*
    When the client makes a `DELETE` request to `/api/users/:id`:

    - If the _user_ with the specified `id` is not found:

      - respond with HTTP status code `404` (Not Found).
      - return the following JSON object: `{ message: "The user with the specified ID does not exist." }`.

    - If there's an error in removing the _user_ from the database:
      - respond with HTTP status code `500`.
      - return the following JSON object: `{ errorMessage: "The user could not be removed" }`.
  */
  //#endregion Delete User Summary

  const { id } = req.params;

  db.findById(id)
    .then(user => {
      if (user) {
        db.remove(id, req.body)
        .then(userIdRemoved => {
          console.log(`DELETE /api/users/:id remove(${id}): \n`, userIdRemoved);
          if (userIdRemoved) {
            res.status(200).json({ success: true, userIdRemoved: userIdRemoved });
          }
        })
        .catch(err => {
          res.status(500).json({ success: false, errorMessage: "The user information could not be removed." });
        });
      } else {
        res.status(404).json({ success: false, errorMessage: "The user with the specified ID does not exist." });
      }
    });
});
