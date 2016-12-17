/* Scrape and Display (18.3.8)
 * (If you can do this, you should be set for your hw)
 * ================================================== */

// STUDENTS:
// Please complete the routes with TODOs inside.
// Your specific instructions lie there

// Good luck!

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Mongoose mpromise deprecated - use bluebird promises
var Promise = require("bluebird");
var mongojs = require("mongojs");

mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_d70ng81v:tquljgv0dodvd8tmm6vder1c8v@ds133158.mlab.com:33158/heroku_d70ng81v");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// Simple index route
app.get("/", function(req, res) {
  res.send(index.html);
});

// A GET request to scrape the echojs website
app.post("/scrape", function(req, res) {
  console.log('before req');
  // First, we grab the body of the html with request
  request("https://austin.craigslist.org/search/jjj?query=javascript", function(error, response, html) {
    if (error) console.log(error);

    console.log(response);

    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    console.log('loaded cheerio', $('li.result-row'));
    // Now, we grab every h2 within an article tag, and do the following:
    $('li.result-row').each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).find("p.result-info").find("a.result-title").text();
      
      console.log('title');
      result.link = "https://austin.craigslist.org"+$(element).find("p.result-info").find("a.result-title").attr("href");
      // Using our Article 
      // model, create a new entry 
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      console.log(entry);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
         console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  Article.find({},function(err,doc){
    res.json(doc);
  })
});


// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {


  // TODO
  // ====

  // Finish the route so it finds one article using the req.params.id,

  // and run the populate method with "note",

  // then responds with the article with the note included
  Article.findById(req.params.id)
  .populate("note")
  .exec(function(err,doc){
    if(err) {
      res.send(err);
    } else {      
      res.send(doc);
    }
  })


});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {


  // TODO
  // ====

  // save the new note that gets posted to the Notes collection

  // then find an article from the req.params.id

  // and update it's "note" property with the _id of the new note
 var newNote = new Note(req.body);
  // Save the new note to mongoose
  newNote.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Otherwise
    else {
      // Find our user and push the new note id into the User's notes array
      Article.findByIdAndUpdate(req.params.id, { $push: { "note": doc._id } },  function(err, newdoc) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          Note.findById(doc._id,function(err,data){
            res.send(data);
          })
        }
      });
    }
  });


});

app.post("/notes/:id", function(req, res) {
  console.log(req.params.id);
  Note.findById(req.params.id,function(err,note){
    note.remove();
  });
})


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});