const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const { lookUpByEmail } = require('./helpers');

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'user2RandomID' },
  h65d93: { longURL: 'https://www.msn.ca', userID: 'user2RandomID' },
};

function generateRandomString(length) {
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let answer = '';
  for (let i = 0; i < length; i++) {
    answer += char.charAt((Math.random()*char.length));
  }
  return answer;
}

const checkEmail = function(database, email) {
  for (const id in database) {
    if (database[id].email === email) {
      return true;
    }
  }
  return false;
}

const checkPassword = function(database, password) {
  for (const id in database) {
    if (database[id].password === password) {
      return true;
    }
  }
  return false;
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "aaa"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "vvv"
  }
}

const urlsForUser = function (id) {
  let specificURLs = {};

  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl]['userID'] == id) {
      specificURLs[shortUrl] = urlDatabase[shortUrl];
    }
  }
  console.log("Specific URLs:", specificURLs);
  return specificURLs;
  
}

app.get("/urls", (req, res) => {

  const userID = req.session.user_ID;
  console.log(userID);
  const user = users[userID]
  const templateVars = { username: userID, urls: urlsForUser(userID, urlDatabase), user };
  // urlsForUser(req.cookies['user_ID'], database);
  // console.log(req.session);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_ID;
  const user = users[userID];
  const templateVars = { username: req.session.user_ID, user};
  if (req.session.user_ID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_ID;
  const user = users[userID]
  let userUrls = urlsForUser(req.session.user_ID);
  let shortUrl = req.params.shortURL;
  console.log("UserUrls: ", userUrls);
  const long = userUrls[shortUrl].longURL;
  // console.log("LONG: ", long);
  const templateVars = { shortURL: shortUrl , longURL: long, username: req.session.user_ID, user};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  let code = generateRandomString(6)
  urlDatabase[code] = {longURL: req.body.longURL, userID: req.session.user_ID};

  // console.log("XX: ", urlDatabase);
  res.redirect(`/urls/${code}`);
});

// LOGIN - in header (no longer needed)
app.get("/urls/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[usernameID] };
  res.render("urls_index", templateVars);
});

app.post("/urls/login", (req, res) => {
  const user = req.body.username;
  const templateVars = { urls: urlDatabase, username: users[usernameID] };
  res.cookie('username', user);
  res.redirect('/urls', templateVars);
})

//LOGIN PAGE
app.get("/login", (req, res) => {
  const userID = req.session.user_ID;
  const user = users[userID];
  const templateVars = { urls: urlDatabase, username: req.session.user_ID, user};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  if (checkEmail(users, req.body.email) && (checkPassword(users, req.body.password))) {
    req.session.user_ID = lookUpByEmail(email, users)
    // console.log(req.body);
  } else {
    res.status(404).send('Error 404: Wrong Username/Password')
  }
  // console.log(users);
  // const templateVars = { urls: urlDatabase, username: req.cookies['user_ID'] };
  res.redirect('/urls');
})

//LOGOUT
app.post("/urls/logout", (req, res) => {
  // res.clearCookie('user_ID', req.body.id);
  req.session = null;
  res.redirect('/urls');
})

//REGISTER
app.get('/register', (req, res) => {
  const userID = req.session.user_ID;
  const user = users[userID];
  let usernameID = generateRandomString(6);
  users[usernameID] = {
    id: usernameID,
    email: req.body.email,
    password: req.body.password
  }

  const templateVars = { urls: urlDatabase, username: req.session.user_ID, user};
  res.render('urls_register', templateVars);
})

app.post("/register", (req, res) => {
  let usernameID = generateRandomString(6);
  if (checkEmail(users, req.body.email)) {
    res.status(400).send('Error 400 Bad Request: Account already exists')
  }
  // Error 400 if there's no password
  if ((!req.body.password) || (!req.body.email) ) {
    res.status(400);
    res.send('Error 400 Bad Request')
  }
  
  users[usernameID] = {
    id: usernameID,
    email: req.body.email,
    password: req.body.password
  }
  
  console.log(users);
  // res.cookie('user_ID', usernameID)
  req.session.user_ID = usernameID;

  const templateVars = { urls: urlDatabase, username: req.session.user_ID};
  // res.render('urls_index', templateVars);
  res.redirect('/urls');
})

//OPEN SHORT URL
app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL].longURL; // NEED TO CHANGE
  console.log(longURL);
  res.redirect(longURL);
});

//DELETE URL
app.post('/urls/:shortURL/delete', (req,res) => {
  const userID = req.session.user_ID;
  let userUrls = urlsForUser(req.session.user_ID);
  console.log(`UserUrls: ${userUrls}`);
  let shortUrl = req.params.shortURL;
  console.log(`shortUrl: ${shortUrl}`);
  // const long = userUrls[shortUrl].longURL;


  // console.log(`first: ${req.session.user_ID}`);
  // console.log(`second: ${userUrls[shortUrl].userID}`);
  if (req.session.user_ID == userUrls[shortUrl].userID) {
    delete userUrls[shortUrl].userID; 
  } 
  // delete urlDatbase[shortUrl];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req,res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL; 
  res.redirect(`/urls/${req.params.shortURL}`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/u/:shortURL", (req, res) => {
//   // const longURL = ...
//   longURL = `http://localhost:8080/urls/${shortURL}`
//   res.redirect(longURL);
// });


// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });