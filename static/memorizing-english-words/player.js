"use strict";

var player_interval = 3000;
var player_timer = null;
var player_dictionary = null;
var player_stars = {};
var player_paused = false;
var player_range = [];
var player_offset = 0; // Player offset, must in player_range. > player_range[1] if end of range, < player_range[0] if no progress.
var player_touch_position = { x: null, y: null };

function player_draw() {
  if ($("#answer").is(":hidden")) {
    $("#answer").show();
    player_star_draw();
    player_offset += 1;
  } else if (
    player_range[0] != player_range[1] &&
    player_offset <= player_range[1]
  ) {
    player_progress_draw();
    let word = player_dictionary[player_offset];
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
    player_progress_draw();
  }
}

function player_timer_draw() {
  if (!player_paused && player_touch_position.x === null) {
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
    player_offset -= 1;
    if (player_offset < player_range[0]) {
      player_offset = player_range[1];
    }
    player_draw();
    player_redraw();
    player_progress_save();
  }
}

function player_forward() {
  if (player_timer) {
    if ($("#answer").is(":hidden")) {
      player_offset += 1;
    }
    if (player_offset > player_range[1]) {
      player_offset = player_range[0];
    }
    $("#question").text("");
    $("#answer")
      .text("")
      .show();
    $("#message").text("");
    player_draw();
    player_redraw();
    player_progress_save();
  }
}

function player_start() {
  let paths = player_location_get();
  let dictionary =
    paths[3] === "star" ? player_stars[paths[0]] : dictionaries[paths[0]];
  if (typeof dictionary === "object") {
    player_dictionary = dictionary;

    let paths_changed = false;
    if (paths[1] < 1) {
      paths[1] = player_dictionary.length > 0 ? 1 : 0;
      paths_changed = true;
    } else if (paths[1] > player_dictionary.length) {
      paths[1] = player_dictionary.length;
      paths_changed = true;
    }
    if (paths[2] < 1) {
      paths[2] = player_dictionary.length;
      paths_changed = true;
    } else if (paths[2] > player_dictionary.length) {
      paths[2] = player_dictionary.length;
      paths_changed = true;
    }
    if (paths[1] > paths[2]) {
      paths[2] = paths[1];
      paths_changed = true;
    }
    if (paths[4] < paths[1] || paths[4] > paths[2]) {
      paths[4] = paths[1];
      paths_changed = true;
    }
    if (paths_changed) {
      player_location_set(paths);
    }

    player_range = [paths[1] - 1, paths[2] - 1];
    player_offset = paths[4] - 1;
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
  player_progress_draw();
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

// Location format:
//   <dict>:<range_begin>:<range_end>:<tag>:<progress>
function player_location_get() {
  let match = window.location.hash.match(/^#?(.*)$/)[1];
  let paths = [];
  if (match) {
    paths = match.split(":").slice(0, 5);
  }

  for (let i = 0; i < 5; ++i) {
    if (typeof paths[i] === "undefined") {
      paths[i] = "";
    }
  }
  paths[1] = parseInt(paths[1], 10);
  if (isNaN(paths[1]) || paths[1] < 0) {
    paths[1] = 0;
  }
  paths[2] = parseInt(paths[2], 10);
  if (isNaN(paths[2]) || paths[2] < 0) {
    paths[2] = 0;
  }
  paths[4] = parseInt(paths[4], 10);
  if (isNaN(paths[4]) || paths[4] < 0) {
    paths[4] = 0;
  }

  return paths;
}

function player_location_set(paths) {
  let old_hash = window.location.hash;
  window.location.hash = "#" + paths.join(":");
  return window.location.hash != old_hash;
}

function player_progress_save() {
  let paths = player_location_get();
  paths[4] = player_offset + 1;
  player_location_set(paths);
}

function player_dictionary_change() {
  let paths = player_location_get();
  let name = $("#dictionary").val();
  if (player_location_set([name, "", "", paths[3], ""])) {
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
  paths[4] = range[0];
  if (player_location_set(paths)) {
    player_prepare();
  }
}

function player_refresh() {
  if (player_timer) {
    player_offset = player_range[0];
    $("#question").text("");
    $("#answer")
      .text("")
      .show();
    $("#message").text("");
    player_progress_draw();
    player_progress_save();
  } else {
    window.location.reload();
  }
}

function player_pause_toggle() {
  player_paused = !player_paused;
  if (player_paused) {
    $("#pause").addClass("active");
    if (player_timer) {
      player_progress_save();
    }
  } else {
    $("#pause").removeClass("active");
  }
}

function player_current_word() {
  if (
    player_timer &&
    player_offset >= player_range[0] &&
    player_offset <= player_range[1]
  ) {
    return [$("#question").text(), $("#answer").text()];
  }

  return ["", ""];
}

function player_star_toggle() {
  let word = player_current_word();
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
  player_star_draw();
}

function player_star_on() {
  let word = player_current_word();
  if (word[0] === "") {
    return;
  }
  let paths = player_location_get();
  let key = paths[0] + ":" + word[0];
  let value = word[1];
  if (typeof window.localStorage[key] === "undefined") {
    window.localStorage[key] = value;
  }
  delete player_stars[paths[0]];
  player_star_draw();
}

function player_star_off() {
  let word = player_current_word();
  if (word[0] === "") {
    return;
  }
  let paths = player_location_get();
  let key = paths[0] + ":" + word[0];
  window.localStorage.removeItem(key);
  delete player_stars[paths[0]];
  player_star_draw();
}

function player_star_active() {
  let word = player_current_word();
  if (word[0] === "") {
    return false;
  }
  let paths = player_location_get();
  let key = paths[0] + ":" + word[0];
  return typeof window.localStorage[key] !== "undefined";
}

function player_star_dictionary(e) {
  e.preventDefault();
  let paths = player_location_get();
  paths[1] = 0;
  paths[2] = 0;
  paths[3] = paths[3] === "star" ? "" : "star";
  paths[4] = 0;
  if (player_location_set(paths)) {
    player_prepare();
  }
}

function player_star_draw() {
  let paths = player_location_get();
  if (paths[3] === "star") {
    $("#star").addClass("active");
  } else {
    $("#star").removeClass("active");
  }
  if (player_star_active()) {
    $("#star").addClass("ui-alt-icon");
    $("#content").addClass("star");
  } else {
    $("#star").removeClass("ui-alt-icon");
    $("#content").removeClass("star");
  }
}

function player_progress_draw() {
  let progress = 0;
  if (player_offset > player_range[1]) {
    progress = 100;
  } else if (
    player_offset < player_range[0] ||
    (player_offset === player_range[0] && $("#answer").is(":hidden"))
  ) {
    progress = 0;
  } else {
    progress = +(
      ((player_offset - player_range[0] + 1) /
        (player_range[1] - player_range[0] + 1)) *
      100
    );
  }
  $("#progress").width(progress + "%");
}

function player_touch_start(e) {
  player_touch_position = {
    x: e.originalEvent.touches[0].pageX,
    y: e.originalEvent.touches[0].pageY
  };
}

function player_touch_end(e) {
  let height =
    e.originalEvent.changedTouches[0].pageY - player_touch_position.y;
  let width = e.originalEvent.changedTouches[0].pageX - player_touch_position.x;
  let distance = 55;
  if (width <= distance / 2) {
    if (height > distance) {
      player_star_on();
    } else if (height < -distance) {
      player_star_off();
    }
  }
  player_touch_position = { x: null, y: null };
  player_redraw();
}

function player_resize() {
  var screen = $.mobile.getScreenHeight();
  var header = $(".ui-header").hasClass("ui-header-fixed")
    ? $(".ui-header").outerHeight() - 1
    : $(".ui-header").outerHeight();
  var footer = $(".ui-footer").hasClass("ui-footer-fixed")
    ? $(".ui-footer").outerHeight() - 1
    : $(".ui-footer").outerHeight();
  var contentCurrent =
    $(".ui-content").outerHeight() - $(".ui-content").height();
  var content = screen - header - footer - contentCurrent;
  $(".ui-content").height(content);
}

function player_init() {
  $.event.special.tap.emitTapOnTaphold = false;
  player_resize();
  $(window).on("resize orientationchange", player_resize);
  $("#dictionary").change(player_dictionary_change);
  $("#range").change(player_range_change);
  $("#refresh").on("click", player_refresh);
  $("#pause").on("click", player_pause_toggle);
  $("#star").on("click", player_star_toggle);
  $("#fullscreen").on("click", player_fullscreen_toggle);
  $("#content").on("tap", player_pause_toggle);
  $("#content").on("swipeleft", player_forward);
  $("#content").on("swiperight", player_backward);
  $("#content").on("touchstart", player_touch_start);
  $("#content").on("touchend", player_touch_end);
  $("#star").on("taphold dbclick", player_star_dictionary);
  $(window).on("hashchange", player_prepare);
  if (typeof window.localStorage === "undefined") {
    $("#star").hide();
  }

  $("#dictionary").append(
    $("<option></option>")
      .val("")
      .html("请选择词典")
  ).selectmenu("refresh");
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
