const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.youtube.com"
};

function generateRandomString(length) {
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let answer = '';
  for (let i = 0; i < length; i++) {
    answer += char.charAt((Math.random()*char.length));
  }
  return answer;
}

const generateId = () => Math.floor(Math.random()*1000);

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

const lookUpByEmail = function (userEmail, database) {
  for (const id in database) {
    if (database[id].email === userEmail) {
      return database[id].id;
    }
  }
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "asdfgh"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "zxvcb"
  }
}

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID'] };
  // console.log(req.cookies['username']);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID']  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: long, username: req.cookies['username']};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  let code = generateRandomString(6)
  res.redirect(`http://localhost:8080/urls/${code}`);
  urlDatabase[code] = req.body.longURL;
  console.log(urlDatabase);

});
// LOGIN
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
  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID']};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  if (checkEmail(users, req.body.email) && (checkPassword(users, req.body.password))) {
    res.cookie('user_ID', lookUpByEmail(email, users))
    // console.log(req.body);
  } else {
    res.status(404).send('Error 404: Wrong Username/Password')
  }
  console.log(users);
  // const templateVars = { urls: urlDatabase, username: req.cookies['user_ID'] };
  res.redirect('/urls');
})

//LOGOUT
app.post("/urls/logout", (req, res) => {
  res.clearCookie('user_ID', req.body.id);
  res.redirect('/urls');
})

//REGISTER
app.get('/register', (req, res) => {
  let usernameID = generateRandomString(6);
  users[usernameID] = {
    id: usernameID,
    email: req.body.email,
    password: req.body.password
  }

  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID']  };
  res.render('urls_register', templateVars);
})

app.post("/register", (req, res) => {
  let usernameID = generateRandomString(6);
  if (checkEmail(users, req.body.email)) {
    res.status(400).send('Error 400 Bad Request: Account already exists')
  }
  
  users[usernameID] = {
    id: usernameID,
    email: req.body.email,
    password: req.body.password
  }
  // Error 400 if there's no password
  if ((!req.body.password) || (!req.body.email) ) {
    res.status(400);
    res.send('Error 400 Bad Request')
  }
  console.log(users);
  res.cookie('user_ID', usernameID)

  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID'] , userDB: users };
  // res.render('urls_index', templateVars);
  res.redirect('/urls');
})

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL]
  console.log(longURL);
  res.redirect(longURL);
});

//DELETE URL
app.post('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post('/urls/:shortURL', (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
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

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

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

