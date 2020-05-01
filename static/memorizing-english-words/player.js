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
  player_dictionary = dictionaries[name];
  if (typeof player_dictionary === "object") {
    if (player_timer) {
      clearInterval(player_timer);
    }
    player_timer = setInterval(next_word, player_interval);
    return true;
  }
  return false;
}

function player_prepare(name) {
  let dictionary = dictionaries[name];
  if (typeof dictionary === "string") {
    $.getScript(dictionary, function() {
      player_start(name);
    });
  } else {
    player_start(name);
  }
}

function player_dictionary_change() {
  player_prepare($("#dictionary").val());
}

function player_fullscreening() {
  return (
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

function player_fullscreen_on() {
  if (!player_fullscreening()) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(
        Element.ALLOW_KEYBOARD_INPUT
      );
    }
  }
}

function player_fullscreen_off() {
  if (player_fullscreening()) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function player_fullscreen_toggle() {
  if (player_fullscreening()) {
    player_fullscreen_off();
  } else {
    player_fullscreen_on();
  }
}

function player_init() {
  $("#dictionary").change(player_dictionary_change);
  for (let name in dictionaries) {
    if (dictionaries.hasOwnProperty(name)) {
      var option = $("<option></option>")
        .val(name)
        .html(name);
      $("#dictionary").append(option);
    }
  }
  player_dictionary_change();
  $("#main").on("tap", function() {
    player_fullscreen_toggle();
  });
}

$(document).ready(player_init);
