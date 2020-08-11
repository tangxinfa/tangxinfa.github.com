"use strict";

var player_interval = 3000;
var player_timer = null;
var player_paused = false;
var player_touch_position = { x: null, y: null };
var word_list = null;

/**
 * Construct a dictionary.
 *
 * @param name Dictionary name.
 * @param words Dictionary words.
 *
 * @return a dictionary.
 */
function Dictionary(name, words) {
  this.name = name;
  this.words = words;
}

/// Get dictionary name.
Dictionary.prototype.Name = function() {
  return this.name;
};

/// Get dictionary word at offset.
Dictionary.prototype.Word = function(offset) {
  let word = this.words[offset];
  if (word) {
    return word;
  }
  return ["", ""];
};

/// Get dictionary size.
Dictionary.prototype.Size = function() {
  return this.words.length;
};

/**
 * Construct a word list on dictionary at [first, last].
 *
 * @param dictionary Dictionary.
 * @param first First word index.
 * @param last Last word index.
 * @param offset Offset word index.
 *               Must in range[first, last], > last if end of range,
 *               < first if no progress.
 *
 * @return a word list.
 */
function WordList(dictionary, first, last, offset) {
  this.dictionary = dictionary;
  first = parseInt(first, 10);
  if (isNaN(first) || first < 0) {
    first = 0;
  } else if (first >= this.dictionary.Size()) {
    first = this.dictionary.Size() - 1;
  }
  this.first = first;
  last = parseInt(last, 10);
  if (isNaN(last) || last < 0 || last >= this.dictionary.Size()) {
    last = this.dictionary.Size() - 1;
  }
  if (first > last) {
    last = first;
  }
  this.last = last;
  offset = parseInt(offset, 10);
  if (isNaN(offset) || offset < first || offset > last) {
    offset = first;
  }
  this.offset = offset;
}

/// Get dictionary name.
WordList.prototype.DictionaryName = function() {
  return this.dictionary.Name();
};

/// Get first index.
WordList.prototype.First = function() {
  return this.first;
};

/// Get last index.
WordList.prototype.Last = function() {
  return this.last;
};

/// Get offset index.
WordList.prototype.Offset = function() {
  return this.offset;
};

/// Get word at offset.
WordList.prototype.Word = function(offset) {
  if (offset < this.first || offset > this.last) {
    return ["", ""];
  }
  return this.dictionary.Word(offset);
};

/// Forward offset index.
WordList.prototype.Forward = function() {
  if (!this.Ending()) {
    this.offset += 1;
  }
};

/// Backward offset index.
WordList.prototype.Backward = function() {
  if (!this.Begining()) {
    this.offset -= 1;
  }
};

/// Offset is before first index.
WordList.prototype.Begining = function() {
  return this.offset < this.first;
};

/// Offset is after last index.
WordList.prototype.Ending = function() {
  return this.offset > this.last;
};

/// Get progress in range[0, 100].
WordList.prototype.Progress = function() {
  if (this.offset > this.last) {
    return 100;
  } else if (this.offset < this.first) {
    return 0;
  } else {
    return +(
      ((this.offset - this.first + 1) / (this.last - this.first + 1)) *
      100
    );
  }
};

/// Move to progress in range[0, 100].
WordList.prototype.Move = function(percent) {
  this.offset = parseInt(this.first + (this.last - this.first) * percent, 10);
  if (this.offset > this.last) {
    this.offset = this.last;
  } else if (this.offset < this.first) {
    this.offset = this.first;
  }
};

WordList.prototype.Dictionary = function() {
  return this.dictionary;
};

WordList.prototype.IndexOf = function(name) {
  for (let i = this.first; i <= this.last; ++i) {
    if (this.Word(i)[0] == name) {
      return i;
    }
  }
  return -1;
};

WordList.prototype.IsNewWord = function(word_name) {
  let store = window.localStorage;
  return typeof store[this.DictionaryName() + ":" + word_name] !== "undefined";
};

WordList.prototype.AddNewWord = function(word_name, word_mean) {
  if (word_name == "" || word_mean == "" || this.IsNewWord(word_name)) {
    return false;
  }
  let store = window.localStorage;
  store[this.DictionaryName() + ":" + word_name] = word_mean;
  return true;
};

WordList.prototype.DelNewWord = function(word_name) {
  if (word_name == "" || !this.IsNewWord(word_name)) {
    return false;
  }
  let store = window.localStorage;
  store.removeItem(this.DictionaryName() + ":" + word_name);
  return true;
};

/**
 * Construct a new word list based on a word list.
 *
 * @param word_list Word list.
 *
 * @return a new word list.
 */
function NewWordList(word_list) {
  this.word_list = word_list;
  this.index_list = [];
  this.load();
  this.index = 0;
}

/// Load words of new word list.
NewWordList.prototype.load = function() {
  let store = window.localStorage;
  for (let i = 0; i < store.length; i++) {
    let key = store.key(i);
    let prefix = this.word_list.DictionaryName() + ":";
    let index = key.indexOf(prefix);
    if (index === 0) {
      let name = key.substring(index + prefix.length);
      index = this.word_list.IndexOf(name);
      if (index >= this.word_list.First() && index <= this.word_list.Last()) {
        this.index_list.push(index);
      }
    }
  }
};

/// Get dict name of new word list.
NewWordList.prototype.DictionaryName = function() {
  return this.word_list.DictionaryName();
};

NewWordList.prototype.IsNewWord = function(word_name) {
  return this.word_list.IsNewWord(word_name);
};

NewWordList.prototype.AddNewWord = function(word_name, word_mean) {
  if (this.word_list.AddNewWord(word_name, word_mean)) {
    let index = this.word_list.IndexOf(word_name);
    if (index >= 0) {
      this.index_list.push(index);
    }
    return true;
  }
  return false;
};

NewWordList.prototype.DelNewWord = function(word_name) {
  if (this.word_list.DelNewWord(word_name)) {
    for (let i = 0; i < this.index_list.length; i++) {
      if (this.word_list.Word(this.index_list[i])[0] == word_name) {
        this.index_list.splice(i, 1);
        break;
      }
    }
    return true;
  }
  return false;
};

NewWordList.prototype.IndexOf = function(name) {
  for (let i = 0; i <= this.index_list.length; ++i) {
    if (this.word_list.Word(this.index_list[i])[0] == name) {
      return i;
    }
  }
  return -1;
};

NewWordList.prototype.Forward = function() {
  if (!this.Ending()) {
    this.index += 1;
  }
};

NewWordList.prototype.Backward = function() {
  if (!this.Begining()) {
    this.index -= 1;
  }
};

NewWordList.prototype.Begining = function() {
  return this.index < 0;
};

NewWordList.prototype.Ending = function() {
  return this.index >= this.index_list.length;
};

NewWordList.prototype.Offset = function() {
  if (this.index < 0) {
    return this.word_list.first - 1;
  } else if (this.index >= this.index_list.length) {
    return this.word_list.last + 1;
  } else {
    return this.index_list[this.index];
  }
};

NewWordList.prototype.Word = function(offset) {
  let index = this.index_list.indexOf(offset);
  if (index < 0) {
    return ["", ""];
  }
  return this.word_list.Word(offset);
};

NewWordList.prototype.Move = function(percent) {
  this.index = parseInt(this.index_list.length * percent, 10);
};

NewWordList.prototype.First = function() {
  return this.word_list.First();
};

NewWordList.prototype.Last = function() {
  return this.word_list.Last();
};

NewWordList.prototype.Progress = function() {
  if (this.index >= this.index_list.length) {
    return 100;
  } else if (this.index <= 0) {
    return 0;
  } else {
    return +((this.index / this.index_list.length) * 100);
  }
};

function player_draw() {
  if ($("#answer").is(":hidden")) {
    $("#answer").show();
    player_star_draw();
    word_list.Forward();
  } else if (!word_list.Ending()) {
    player_progress_draw();
    let word = word_list.Word(word_list.Offset());
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

function player_progress_change() {
  $("#question").text("");
  $("#answer")
    .text("")
    .show();
  $("#message").text("");
  player_draw();
  player_redraw();
  player_progress_save();
}

function player_backward() {
  if (player_timer) {
    word_list.Backward();
    if (word_list.Begining()) {
      word_list.Move(0);
    }
    player_progress_change();
  }
}

function player_forward() {
  if (player_timer) {
    if ($("#answer").is(":hidden")) {
      word_list.Forward();
    }
    if (word_list.Ending()) {
      word_list.Move(0);
    }
    player_progress_change();
  }
}

function player_start() {
  let paths = player_location_get();
  let name = paths[0];
  let words = dictionaries[name];
  if (typeof words === "object") {
    let dictionary = new Dictionary(name, words);
    word_list = new WordList(
      dictionary,
      parseInt(paths[1], 10) - 1,
      parseInt(paths[2], 10) - 1,
      parseInt(paths[4], 10) - 1
    );
    if (paths[3] === "star") {
      word_list = new NewWordList(word_list);
    }
    paths[1] = word_list.First() + 1;
    paths[2] = word_list.Last() + 1;
    paths[4] = word_list.Offset() + 1;
    player_location_set(paths);
    $("#dictionary")
      .val(paths[0])
      .selectmenu("refresh");
    $("#range").html("");
    let all = (dictionary.Size() > 0 ? "1" : "0") + "-" + dictionary.Size();
    $("#range").append(
      $("<option></option>")
        .val(all)
        .html(all)
    );
    const page_size = 100;
    for (let i = 0, n = Math.ceil(dictionary.Size() / page_size); i < n; ++i) {
      let start = i * page_size + 1;
      let end = start + page_size - 1;
      if (end > dictionary.Size()) {
        end = dictionary.Size();
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
      .val(word_list.First() + 1 + "-" + (word_list.Last() + 1))
      .selectmenu("refresh");
    $("#message").html("");
    player_redraw();
    return true;
  }
  return false;
}

function player_prepare() {
  player_star_draw();
  player_progress_draw();
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
  paths[4] = word_list.Offset() + 1;
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

function player_pause_toggle() {
  player_paused = !player_paused;
  if (player_paused) {
    $("#pause").addClass("active");
    $("body").addClass("pause");
    if (player_timer) {
      player_progress_save();
    }
  } else {
    $("#pause").removeClass("active");
    $("body").removeClass("pause");
  }
}

function player_current_word() {
  return [$("#question").text(), $("#answer").text()];
}

function player_star_toggle() {
  let word = player_current_word();
  if (word[0] === "") {
    return;
  }

  if (!word_list.DelNewWord(word[0])) {
    word_list.AddNewWord(word[0], word[1]);
  }

  player_star_draw();
}

function player_star_on() {
  let word = player_current_word();
  if (word[0] === "") {
    return;
  }
  word_list.AddNewWord(word[0], word[1]);
  player_star_draw();
}

function player_star_off() {
  let word = player_current_word();
  if (word[0] === "") {
    return;
  }
  word_list.DelNewWord(word[0]);
  player_star_draw();
}

function player_star_active() {
  let word = player_current_word();
  if (word[0] === "") {
    return false;
  }
  return word_list.IsNewWord(word[0]);
}

function player_star_dictionary(e) {
  e.preventDefault();
  let paths = player_location_get();
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
  if (word_list) {
    progress = word_list.Progress();
  }
  // TODO progress is 0 if word_list offset is first and answer is hidden.
  $("#progress").width(progress + "%");
}

function player_progress_box_on_click(e) {
  if (!player_timer) {
    return;
  }
  let percent =
    (e.pageX - $("#progress-bar").position().left) / $("#progress-bar").width();
  word_list.Move(percent);
  player_progress_change();
}

function player_progress_container_on_click(e) {
  if (!player_timer) {
    return;
  }
  if (e.pageX <= $("#progress-box").offset().left) {
    word_list.Move(0);
  } else if (
    e.pageX >=
    $("#progress-box").offset().left + $("#progress-box").width()
  ) {
    word_list.Move(100);
  }
  player_progress_change();
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
  $("#pause").on("click", player_pause_toggle);
  $("#star").on("click", player_star_toggle);
  $("#fullscreen").on("click", player_fullscreen_toggle);
  $("#progress-box").on("click", player_progress_box_on_click);
  $("#progress-container").on("click", player_progress_container_on_click);
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

  $("#dictionary")
    .append(
      $("<option></option>")
        .val("")
        .html("请选择词典")
    )
    .selectmenu("refresh");
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
