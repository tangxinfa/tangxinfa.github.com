"use strict";

var player_interval = 3000;
var player_timer;
var player_dictionary;

function next_word() {
  if ($("#answer").is(":hidden")) {
    $("#answer").show();
  } else {
    let word =
      player_dictionary[parseInt(Math.random() * player_dictionary.length, 10)];
    $("#question").text(word[0]);
    $("#answer")
      .text(word[1])
      .hide();
  }
}

function player_start(name) {
  let dictionary = dictionaries[name];
  if (typeof dictionary === "string") {
    $.getScript(dictionary, function() {
      player_dictionary = dictionaries[name];
      if (player_timer) {
        clearInterval(player_timer);
      }
      player_timer = setInterval(next_word, player_interval);
    });
  }
}

function player_dictionary_click() {
  player_start($("input[name='dictionary']:checked").val());
}

function player_init() {
  for (let name in dictionaries) {
    if (dictionaries.hasOwnProperty(name)) {
      var dictionary = $(
        '<input type="radio" name="dictionary" value="' +
          name +
          '" onClick="player_dictionary_click();">' +
          name +
          "</input>"
      );
      $("#preference").append(dictionary);
    }
  }
}

$(document).ready(player_init);
