"use strict";

var player_interval = 3000;
var player_timer = null;
var player_dictionary = null;
var player_next_index = null;

function player_next_word() {
  if ($("#answer").is(":hidden")) {
    $("#answer").show();
  } else {
    if (typeof player_next_index != "number") {
      player_next_index = parseInt(
        Math.random() * player_dictionary.length,
        10
      );
    }
    player_next_index = (player_next_index + 1) % player_dictionary.length;
    let word = player_dictionary[player_next_index];
    $("#question").text(word[0]);
    $("#answer")
      .text(word[1])
      .hide();
  }
}

function player_start(name) {
  player_dictionary = dictionaries[name];
  player_next_index = null;
  if (typeof player_dictionary === "object") {
    $("#dictionary")
      .val(name)
      .selectmenu("refresh");
    if (player_timer) {
      clearInterval(player_timer);
    }
    player_timer = setInterval(player_next_word, player_interval);
    return true;
  }
  return false;
}

function player_prepare(name) {
  let dictionary = dictionaries[name];
  if (typeof dictionary === "string") {
    $.ajax({
      dataType: "script",
      cache: true,
      url: dictionary
    }).done(function() {
      player_start(name);
    });
  } else {
    player_start(name);
  }
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

function player_dispatch() {
  let match = window.location.hash.match(/^#?(.*)$/)[1];
  if (match) {
    let paths = match.split("/");
    let name = "";
    if (typeof paths[0] !== "undefined") {
      name = paths[0];
    }
    if (name) {
      player_prepare(name);
    }
  }
}

function player_dictionary_change() {
  let name = $("#dictionary").val();
  window.location.hash = "#" + name;
  player_dispatch();
}

function player_init() {
  $("#dictionary").change(player_dictionary_change);
  for (let name in dictionaries) {
    if (dictionaries.hasOwnProperty(name)) {
      let option = $("<option></option>")
        .val(name)
        .html(name);
      $("#dictionary").append(option);
    }
  }
  $("#content").on("tap", function() {
    player_fullscreen_toggle();
  });

  $(window).on("hashchange", player_dispatch);
  player_dispatch();
}

$(document).ready(player_init);
