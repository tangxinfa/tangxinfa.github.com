"use strict";

var player_interval = 3000;
var player_timer = null;
var player_dictionary = null;
var player_stars = {};
var player_paused = false;

var player_range = [];
var player_begin = null;
var player_progress = -2; // Player progress. -1 if end of range, -2 if no progress.

function player_draw() {
  if ($("#answer").is(":hidden")) {
    $("#answer").show();
    player_star_draw();
    player_progress =
      player_range[0] +
      ((player_progress + 1) % (player_range[1] - player_range[0] + 1));
    if (player_progress === player_begin) {
      player_progress = -1;
    }
  } else if (player_progress !== -1) {
    if (player_progress === -2) {
      player_progress = player_begin;
    }
    let word = player_dictionary[player_progress];
    $("#question").text(word[0]);
    $("#answer")
      .text(word[1])
      .hide();
    player_star_draw();
  } else {
    $("#question").text("");
    $("#answer").text("");
    $("#message").text("The end");
    player_star_draw();
  }
}

function player_timer_draw() {
  if (!player_paused) {
    player_draw();
  }
}

function player_redraw() {
  if (player_timer) {
    clearInterval(player_timer);
  }
  player_timer = setInterval(player_timer_draw, player_interval);
}

function player_backward() {
  if (player_timer) {
    $("#question").text("");
    $("#answer")
      .text("")
      .show();
    $("#message").text("");
    player_progress =
      (player_progress === -1 ? player_begin : player_progress) - 1;
    if (player_progress < 0) {
      player_progress = player_range[1];
    }
    player_draw();
    player_redraw();
  }
}

function player_forward() {
  if (player_timer) {
    $("#question").text("");
    $("#answer")
      .text("")
      .show();
    $("#message").text("");
    player_progress =
      player_progress === -1 ? player_begin : player_progress + 1;
    if (player_progress > player_range[1]) {
      player_progress = player_range[0];
    }
    player_draw();
    player_redraw();
  }
}

function player_start() {
  let paths = player_location_get();
  let dictionary =
    paths[3] === "star" ? player_stars[paths[0]] : dictionaries[paths[0]];
  if (typeof dictionary === "object") {
    player_dictionary = dictionary;

    let paths_changed = false;
    if (paths[1] == "" || paths[1] < 1) {
      paths[1] = player_dictionary.length > 0 ? 1 : 0;
      paths_changed = true;
    } else if (paths[1] > player_dictionary.length) {
      paths[1] = player_dictionary.length;
      paths_changed = true;
    }
    if (paths[2] == "" || paths[2] > player_dictionary.length) {
      paths[2] = player_dictionary.length;
      paths_changed = true;
    }
    if (paths[1] > paths[2]) {
      paths[2] = paths[1];
      paths_changed = true;
    }
    if (paths_changed) {
      player_location_set(paths);
    }

    player_range = [parseInt(paths[1], 10) - 1, parseInt(paths[2], 10) - 1];
    player_begin =
      player_range[0] +
      parseInt(Math.random() * (player_range[1] - player_range[0] + 1), 10);
    player_progress = player_dictionary.length > 0 ? -2 : -1;
    $("#dictionary")
      .val(paths[0])
      .selectmenu("refresh");
    $("#range").html("");
    let all =
      (player_dictionary.length > 0 ? "1" : "0") +
      "-" +
      player_dictionary.length;
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
      let item = start + "-" + end;
      if (item !== all) {
        let option = $("<option></option>")
          .val(item)
          .html(item);
        $("#range").append(option);
      }
    }
    $("#range")
      .val(player_range[0] + 1 + "-" + (player_range[1] + 1))
      .selectmenu("refresh");
    $("#message").html("");
    player_redraw();
    return true;
  }
  return false;
}

function player_star_get(name) {
  let star = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    let key = window.localStorage.key(i);
    let prefix = name + ":";
    let index = key.indexOf(prefix);
    if (index === 0) {
      let value = window.localStorage.getItem(key);
      key = key.substring(index + prefix.length);
      star.push([key, value]);
    }
  }
  return star;
}

function player_prepare() {
  player_star_draw();
  let paths = player_location_get();
  if (paths[3] === "star") {
    let dictionary = player_stars[paths[0]];
    if (typeof dictionary === "undefined") {
      player_stars[paths[0]] = player_star_get(paths[0]);
    }
    player_start();
  } else {
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
    paths = match.split(":").slice(0, 4);
  }
  for (let i = 0; i < 4; ++i) {
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

function player_refresh() {
  if (player_timer) {
    player_progress = -2;
    $("#question").text("");
    $("#answer")
      .text("")
      .show();
    $("#message").text("");
  } else {
    window.location.reload();
  }
}

function player_pause() {
  player_paused = !player_paused;
  if (player_paused) {
    $("#pause").addClass("active");
  } else {
    $("#pause").removeClass("active");
  }
}

function player_star_word() {
  if (player_timer && player_progress >= 0) {
    let word = [$("#question").text(), $("#answer").text()];
    if (word[0] === "") {
      return;
    }
    let paths = player_location_get();
    let key = paths[0] + ":" + word[0];
    let value = word[1];
    if (typeof window.localStorage[key] === "undefined") {
      window.localStorage[key] = value;
    } else {
      window.localStorage.removeItem(key);
    }
    delete player_stars[paths[0]];
  }
  player_star_draw();
}

function player_star_dictionary(e) {
  e.preventDefault();
  let paths = player_location_get();
  paths[1] = "";
  paths[2] = "";
  paths[3] = paths[3] === "star" ? "" : "star";
  if (player_location_set(paths)) {
    player_prepare();
  }
}

function player_word_stared() {
  let paths = player_location_get();
  if (player_timer && player_progress >= 0) {
    let word = [$("#question").text(), $("#answer").text()];
    let key = paths[0] + ":" + word[0];
    return typeof window.localStorage[key] !== "undefined";
  }
  return false;
}

function player_star_draw() {
  let paths = player_location_get();
  if (paths[3] === "star") {
    $("#star").addClass("active");
  } else {
    $("#star").removeClass("active");
  }
  if (player_word_stared()) {
    $("#star").addClass("ui-alt-icon");
  } else {
    $("#star").removeClass("ui-alt-icon");
  }
}

function player_init() {
  $.event.special.tap.emitTapOnTaphold = false;
  $("#dictionary").change(player_dictionary_change);
  $("#range").change(player_range_change);
  $("#refresh").on("click", player_refresh);
  $("#pause").on("click", player_pause);
  $("#star").on("click", player_star_word);
  $("#content").on("tap", player_fullscreen_toggle);
  $("#content").on("swipeleft", player_forward);
  $("#content").on("swiperight", player_backward);
  $("#star").on("taphold dbclick", player_star_dictionary);
  $(window).on("hashchange", player_prepare);
  if (typeof window.localStorage === "undefined") {
    $("#star").hide();
  }

  $("#dictionary").append(
    $("<option></option>")
      .val("")
      .html("")
  );
  for (let name in dictionaries) {
    if (dictionaries.hasOwnProperty(name)) {
      let option = $("<option></option>")
        .val(name)
        .html(name);
      $("#dictionary").append(option);
    }
  }

  player_prepare();
}

$(document).ready(player_init);
