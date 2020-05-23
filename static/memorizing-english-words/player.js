"use strict";

var player_interval = 3000;
var player_timer = null;
var player_dictionary = null;

// Index start from 1.
var player_range = [];
var player_point = null;
var player_position = null;

function player_next_word() {
  if ($("#answer").is(":hidden")) {
    $("#answer").show();
  } else if (typeof player_position === "number") {
    let word = player_dictionary[player_position - 1];
    $("#question").text(word[0]);
    $("#answer")
      .text(word[1])
      .hide();
    player_position =
      (player_position % (player_range[1] - player_range[0] + 1)) + 1;
    if (player_position === player_point) {
      player_position = null;
    }
  } else {
    $("#question").text("");
    $("#answer").html("<p>End of range</p>");
  }
}

function player_start() {
  if (typeof player_dictionary === "object") {
    let paths = player_location_get();
    player_dictionary = dictionaries[paths[0]];
    if (paths[1] == "" || paths[2] == "") {
      paths[1] = [1];
      paths[2] = player_dictionary.length;
      player_location_set(paths);
    }
    player_range = [parseInt(paths[1], 10), parseInt(paths[2], 10)];
    player_point =
      parseInt(Math.random() * player_range[1] - player_range[0] + 1, 10) + 1;
    player_position = player_point;
    $("#dictionary")
      .val(paths[0])
      .selectmenu("refresh");
    $("#range").html("");
    let all = player_range[0] + "-" + player_range[1];
    $("#range").append(
      $("<option></option>")
        .val(all)
        .html(all)
    );
    const words = 100;
    for (
      let i = 0, n = Math.ceil(player_dictionary.length / words);
      i < n;
      ++i
    ) {
      let start = i * words + 1;
      let end = start + words - 1;
      if (end > player_dictionary.length) {
        end = player_dictionary.length;
      }
      let option = $("<option></option>")
        .val(start + "-" + end)
        .html(start + "-" + end);
      $("#range").append(option);
    }
    $("#range")
      .val(all)
      .selectmenu("refresh");
    if (player_timer) {
      clearInterval(player_timer);
    }
    player_timer = setInterval(player_next_word, player_interval);
    return true;
  }
  return false;
}

function player_prepare() {
  let paths = player_location_get();
  let dictionary = dictionaries[paths[0]];
  if (typeof dictionary === "string") {
    $.ajax({
      dataType: "script",
      cache: true,
      url: dictionary
    }).done(function() {
      player_start();
    });
  } else if (typeof dictionary === "object") {
    player_start();
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

function player_location_get() {
  let match = window.location.hash.match(/^#?(.*)$/)[1];
  let paths = [];
  if (match) {
    paths = match.split(":").slice(0, 3);
  }
  for (let i = 0; i < 3; ++i) {
    if (typeof paths[i] === "undefined") {
      paths[i] = "";
    }
  }
  return paths;
}

function player_location_set(paths) {
  let old_hash = window.location.hash;
  window.location.hash = "#" + paths.join(":");
  return window.location.hash != old_hash;
}

function player_dictionary_change() {
  let name = $("#dictionary").val();
  if (player_location_set([name, "", ""])) {
    player_prepare();
  }
}

function player_range_change() {
  let name = $("#range").val();
  let range = name.split("-").slice(0, 2);
  for (let i = 0; i < 2; ++i) {
    if (typeof range[i] === "undefined") {
      range[i] = "";
    }
  }
  let paths = player_location_get();
  paths[1] = range[0];
  paths[2] = range[1];
  if (player_location_set(paths)) {
    player_prepare();
  }
}

function player_init() {
  $("#dictionary").change(player_dictionary_change);
  $("#range").change(player_range_change);

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

  $(window).on("hashchange", player_prepare);
  player_prepare();
}

$(document).ready(player_init);
