$(document).on("click", "#button", function() {
  $("#button").hide();
 $.ajax({
    method: "POST",
    url: "/scrape"
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
    for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
    })
});
// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  var noteId = '';
  $("#inputcontent").show();
  $("#notescontent").show();

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notetitle").text(data.title);
      $("#savenote").attr("data-id",data._id);
      // If there's a note in the article
      if (data.note) {
        for (var i = 0; i < data.note.length; i++) {
      $("#notescontent").append("<h3 style='width:250px'>"+data.note[i].title+"</h3>");
      // A textarea to add a new note body
      $("#notescontent").append("<h4 style='width:250px'>"+data.note[i].body+"</h4>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notescontent").append("<button data-id='" + data.note[i]._id + "' id='deletenote'>Delete Note</button>");
        }
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      // An input to enter a new title
      $("#notescontent").append("<h3 style='width:250px'>"+data.title+"</h3>");
      // A textarea to add a new note body
      $("#notescontent").append("<h4 style='width:250px'>"+data.body+"</h4>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notescontent").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#deletenote", function() {
  $("#savednotes").empty();
 var thisId = $(this).attr("data-id");
    $.ajax({
    method: "POST",
    url: "/notes/" + thisId
  })
})