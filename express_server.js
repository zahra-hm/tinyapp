const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.youtube.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: long} ;
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let code = generateRandomString(6)
  res.redirect(`http://localhost:8080/urls/${code}`);         // Respond with 'Ok' (we will replace this)
  urlDatabase[code] = req.body.longURL;
  console.log(urlDatabase);

  app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    longURL = urlDatabase[code]
    console.log(longURL);
    res.redirect(longURL);
  });

});

// app.get("/u/:shortURL", (req, res) => {
//   // const longURL = ...
//   longURL = `http://localhost:8080/urls/${shortURL}`
//   res.redirect(longURL);
// });


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

function generateRandomString(length) {
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let answer = '';
  for (let i = 0; i < length; i++) {
    answer += char.charAt((Math.random()*char.length));
  }
  return answer;
}