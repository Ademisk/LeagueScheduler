// @flow

//eSports API breakdown: https://gist.github.com/levi/e7e5e808ac0119e154ce
//Fantasy API breakdown: https://gist.github.com/brcooley/8429583561c47b248f80

//var PROXY = 'https://us.hidester.com/proxy.php?u='
var CORS_PROXY = "http://cors.io/?u=";
//var CORS_PROXY = "https://crossorigin.me/";
//var CORS_PROXY = "http://jsonp.afeld.me/?url=";
//var CORS_PROXY = "http://www.whateverorigin.org/get?url="
//var CORS_PROXY = "http://anyorigin.com/get?url=";

var API_SCHEDULE_ITEMS = "http://api.lolesports.com/api/v1/scheduleItems";
var API_HIGHLANDER_MATCH_DETAILS = "http://api.lolesports.com/api/v2/highlanderMatchDetails";
var API_GAME_STATS = "https://acs.leagueoflegends.com/v1/stats/game/{realm}/{gameId}";

var LIVE_NA_STREAM = "https://www.twitch.tv/nalcs";
var LIVE_EU_STREAM = "https://www.twitch.tv/eulcs";

var NA_LEAGUE_ID = 2;
var EU_LEAGUE_ID = 3;

var WEEKS_IN_LCS = 9;

var NA_DAYS_PER_WEEK = 3;
var NA_DAY_1_MATCHES = 2;
var NA_DAY_2_AND_3_MATCHES = 4;
var NA_GAMES_PER_MATCH = 3;

var EU_DAYS_PER_WEEK = 4;
var EU_DAY1_AND_2_MATCHES = 2;
var EU_GAMES_PER_MATCH = 3;

var NA_LEAGUE_HASH = "472c44a9-49d3-4de4-912c-aa4151fd1b3b";
//var NA_BRACKET_HASH = "2a6a824d-3009-4d23-9c83-859b7a9c2629";

var EU_LEAGUE_HASH = "f7afa181-4580-48c0-af26-4b3d70fe21eb";
//var EU_BRACKET_HASH = "88a5aa52-4461-4a15-8fb5-83c8b5265f93";

var USE_CACHE = false;

function League() {
  this.league_id = 0,
  this.league_hash = "",
  this.league_name = "",
  this.live_stream_url = "",
  this.brackets = []
}

function Bracket() {
  this.bracket_name = "",
  this.bracket_id = "",
  this.block_prefix = "",
  this.weeks = []
}

//Game Data
function Week() {
  this.block_label = "",    //Ex. week number, 'Round 1', etc
  this.week_num = 0,
  this.days = []            //2 for EU, 3 for NA
};

function Day() {
  this.day_date = "",
   this.day_date_epoch = 0,
   this.matches = [] //2 and 4 for NA, 5 for EU
};

function Match() {
  this.match_day = 0,
  this.match_num = 0,
  this.match_id = 0,
  this.state = "",
  this.games = [], //2 for EU, 3 for NA
  this.scheduled_time = "",
  this.scheduled_time_milliseconds = 0;
  this.load_status = "",
  this.team1 = null,
  this.team2 = null,
  this.team1_roster = null, //These are the aggregated stats for first 2 games (for fantasy league purposes)
  this.team2_roster = null
};

function Game() {
  this.game_num = 0,
  this.game_length = 0,
  this.game_realm = "",
  this.game_id = 0,
  this.game_id_hash = "",
  this.game_hash = "",
  this.result = "",
  this.team1_stats = null,
  this.team2_stats = null,
  this.vod_link = ""
};

function Team() {
  this.name = "",
  this.name_stub = "",
  this.icon = "",
  this.f_pts = 0.0,
  this.result = "",
  this.games_won = 0
};

function TeamResults() {
  this.name_stub = "",
  this.result = "",
  this.roster = null,
  this.stats = null
};

function TeamStats() {
  this.got_first_blood = false,
  this.won_under_30 = false,
  this.barons_killed = 0,
  this.dragons_killed = 0,
  this.towers_destroyed = 0,
  this.f_pts = 0.0
}

function Roster() {
  this.top = null,
  this.jg = null,
  this.mid = null,
  this.adc = null,
  this.sup = null
};

function Player() {
  this.name = "",
  this.champion = "",
  this.stats = null
};

function PlayerStats() {
  this.k = 0,
  this.d = 0,
  this.a = 0,
  this.tk = 0,              //triple kills
  this.qk = 0,              //quadra kills
  this.pk = 0,              //penta kills
  this.m = 0,               //minions killed
  this.f_pts = 0.0
};


//Timer for games
function MatchTimer() {
  this.match_day = 0,
  this.match_num = 0,
  this.days = 0,
  this.hours = 0,
  this.minutes = 0,
  this.seconds = 0
}

//Settings
function Settings() {
  this.usability = null, //Settings for the view mode
    this.leagues = null, //A set of leagues w/ checkboxes by them. Checked ones appear as tabs like EU and NA. All on by default
    this.fantasy = null //fantasy league options
}

function UsabilitySettings() {
  this.view_mode = "regular_mode",  //The type of view: Original, Original + fantasy, Lite
   this.hide_results = false        //Hides match results. Game results are shown when game selected. Hides fantasy pts too
}

function LeagueSettings() {
  this.na_lcs_league = true,
  this.eu_lcs_league = true
}

function FantasySettings() {
  this.fantasy_mode = "two_games", //Count-first-2-games, or count-best-game
  this.show_fantasy_pts = false   //Hides results until user clicks on game
}

var intervalId;
var timerObjects = []; //When a tab changes, old timers get erased and new match timers for the week are added

//new container
var na_league;

//deprecated
var na_schedule;
var eu_schedule;

var curLeague;
var curBracket = -1;
var curWeek = -1;

var liveStreamCounter = 0;

var extSettings;

//Fill in the schedule with dates
function getAndPopulateSchedule(scheduleItems, highlanderTournaments) {
  //var leagueHash = curLeague.league_hash;
  var leagueHash = NA_LEAGUE_HASH;

  //filter out all times for NA Summer 2016 LCS
  var newScheduleItems = jQuery.grep(scheduleItems, function(k) {
    //Filter out any panels
    if (k['tournament'] == leagueHash && k['bracket'] != undefined)
      return k;
  });

  newScheduleItems.sort(sortScheduleItems);

  //Selects for NA Summer split
  var highlanderTournament;
  for (var i = 0; i < highlanderTournaments.length; i++) {
    if (highlanderTournaments[i].id == leagueHash)
      highlanderTournament = highlanderTournaments[i];
  }

  //This init section will probably move to the options page
  na_league = new League();
  na_league.league_id = NA_LEAGUE_ID;
  na_league.league_hash = NA_LEAGUE_HASH;
  na_league.league_name = highlanderTournament.title;
  na_league.live_stream_url = LIVE_NA_STREAM;
  na_league.brackets = new Array();

  var bracket;
  var week;
  var day;
  $.each(newScheduleItems, function(key) {
    var bracketID = newScheduleItems[key].bracket

    if (bracketID != undefined) {
      //Create new bracket if previous ID doesn't match
      if (na_league.brackets.length == 0 || bracket.bracket_id != bracketID) {
        na_league.brackets.push(new Bracket());
        bracket = na_league.brackets.slice(-1)[0];
        bracket.bracket_name = highlanderTournament.brackets[bracketID].groupName;
        bracket.bracket_id = bracketID;
        bracket.weeks = new Array();
      }

      //Every time we reach a new week, we add it to the schedule.
      //New week is determined by incrementing week, or by changing blockLabel if week isn't there
      //Matches are sorted by date, so we are guaranteed to be appending in the proper order
      var weekNum = -1;
      var blockPrefix = "";
      if (newScheduleItems[key].tags["blockPrefix"] != undefined && newScheduleItems[key].tags["blockPrefix"] == "week") {
        blockPrefix = newScheduleItems[key].tags["blockPrefix"];
        weekNum = parseInt(newScheduleItems[key].tags["blockLabel"]);
      }

      if ((weekNum != -1 && bracket.weeks.length < weekNum) || week.block_label != newScheduleItems[key].tags["blockLabel"]) {
        bracket.weeks.push(new Week());
        week = bracket.weeks.slice(-1)[0];
        week.block_label = newScheduleItems[key].tags["blockLabel"];
        week.week_num = weekNum;
        week.days = new Array();

        bracket.block_prefix = newScheduleItems[key].tags["blockPrefix"];
      }

      
      //Now we add days
      if (week.days.length == 0) {
        week.days.push(new Day());
        day = week.days.slice(-1)[0];
        day.day_date = computeDayDate(newScheduleItems[key].scheduledTime, week.days.length);
        day.day_date_epoch = newScheduleItems[key].scheduledTime;
        day.matches = new Array();
      } else {
        var curDate = new Date(day.day_date_epoch);
        curDate.setHours(0);
        curDate.setMinutes(0);
        curDate.setSeconds(0);
        var newDate = new Date(newScheduleItems[key].scheduledTime);
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);

        if (newDate > curDate) {
          week.days.push(new Day());
          day = week.days.slice(-1)[0];
          day.day_date = computeDayDate(newScheduleItems[key].scheduledTime, week.days.length);
          day.day_date_epoch = newScheduleItems[key].scheduledTime;
          day.matches = new Array();
        }
      }

      var dt = new Date(newScheduleItems[key].scheduledTime);
      var hours = dt.getHours();
      var amPmString;
      if (hours == 12) {
        amPmString = "PM";
      } else if (hours > 12) {
        amPmString = "PM";
        hours -= 12;
      } else
        amPmString = "AM";

      var bracketID = bracket.bracket_id;
      m = new Match();
      m.match_day = week.days.length;
      m.match_num = day.matches.length + 1;
      m.match_id = newScheduleItems[key].match;
      m.load_status = "not started";
      m.team1 = new Team();
      m.team2 = new Team();
      m.team1.name_stub = highlanderTournament.brackets[bracketID].matches[m.match_id].name.split("-vs-")[0];
      m.team1.icon = teamIcon[m.team1.name_stub];
      m.team2.name_stub = highlanderTournament.brackets[bracketID].matches[m.match_id].name.split("-vs-")[1];
      m.team2.icon = teamIcon[m.team2.name_stub];
      m.scheduled_time = hours + ':00' + amPmString;
      m.scheduled_time_milliseconds = dt.getTime();
      m.state = highlanderTournament.brackets[bracketID].matches[m.match_id].state;

      //Get the limited game data (gameId, and gameRealm)
      //If 3rd game for NA doesn't exist, game_id will be undefined
      var matchGames = highlanderTournament.brackets[bracketID].matches[m.match_id].games;
      m.games = new Array();
      for (g in matchGames) {
        var game = new Game();
        game.game_num = parseInt(matchGames[g].name.replace("G", ""));
        game.game_realm = matchGames[g].gameRealm;
        game.game_id = matchGames[g].gameId;
        game.game_id_hash = matchGames[g].id;
        game.result = "not played";
        m.games.push(game);
      }

      m.games.sort(sortGames);

      day.matches.push(m);
    }
  });

  /*if (league == NA_LEAGUE_ID)
    na_schedule = schedule;
  else if (league == EU_LEAGUE_ID)
    eu_schedule = schedule;*/

  if (USE_CACHE)
    saveScheduleIntoCache(schedule, league);
}

//NA is assumed default
function getWeekMatchResults() {
  var req = [];
  var leagueHash = curLeague.league_hash;
  var week = curLeague.brackets[curBracket - 1].weeks[curWeek - 1];


  for (var i = 0; i < week.days.length; i++) {
    for (var j = 0; j < week.days[i].matches.length; j++) {
      //If game is loaded and is either unresolved (not started) or resolved (finished), show timer until or results, respectively.
      //If game in progress, fetch latest stats. They do update it throughout the course of the game, right?
      if (week.days[i].matches[j].load_status == "done" && (week.days[i].matches[j].state == "unresolved" || week.days[i].matches[j].state == "resolved")) {
        showMatch(week.days[i].matches[j])
      } else {
        var proxyApiUrl = API_HIGHLANDER_MATCH_DETAILS + '?tournamentId=' + leagueHash + '&matchId=' + week.days[i].matches[j].match_id;
        (function(match) {
          req.push($.ajax({
            url: proxyApiUrl,
            dataType: 'json',
            method: 'GET'
          /*})
          .fail(function(err){
            //alert(err);
            return $.ajax(this);*/
          }).then(function(resp) {
            var req2 = [];

            initMatchRosters(match);

            for (var k = 0; k < resp.gameIdMappings.length; k++) {
              for (var l = 0; l < match.games.length; l++) {
                if (match.games[l].game_id_hash == resp.gameIdMappings[k].id) {
                  match.games[l].game_hash = resp.gameIdMappings[k].gameHash;

                  //Game VODs seem to be in game order
                  if (k < resp.videos.length)
                    match.games[k].vod_link = resp.videos[k].source;
                  else
                    match.games[k].vod_link = "";

                  //addPlayersAndRoles(match, l, resp);   //Initializes players and positions

                  req2.push(getGameData(match, l)); //match, gameNum
                }
              }
            }
            return $.when.apply($, req2).done(function() {
              calculateFantasyPts(match);
              calculateTeamWin(match);

              //Cache only matches that are finalized
              if (USE_CACHE && match.state == "resolved")
                saveMatchIntoCache(match, curLeague, week.block_name, week.week_num);

              /*//Show match only if it's on the current league and week
              if (league == curLeague && week.week_num == curWeek) {
                showMatch(match);
              }*/
              showMatch(match);
            });
          }));
        })(week.days[i].matches[j]);
      }
    }
  }

  return $.when.apply($, req).done(function() {
    console.log("Matches for " + curLeague + " week " + curWeek + " resolved");
  });
}

//Create elements to hold aggregated player data
function initMatchRosters(match) {
  match.team1_roster = new Roster();
  match.team1_roster.top = new Player();
  match.team1_roster.top.stats = new PlayerStats();
  match.team1_roster.jg = new Player();
  match.team1_roster.jg.stats = new PlayerStats();
  match.team1_roster.mid = new Player();
  match.team1_roster.mid.stats = new PlayerStats();
  match.team1_roster.sup = new Player();
  match.team1_roster.sup.stats = new PlayerStats();
  match.team1_roster.adc = new Player();
  match.team1_roster.adc.stats = new PlayerStats();

  match.team2_roster = new Roster();
  match.team2_roster.top = new Player();
  match.team2_roster.top.stats = new PlayerStats();
  match.team2_roster.jg = new Player();
  match.team2_roster.jg.stats = new PlayerStats();
  match.team2_roster.mid = new Player();
  match.team2_roster.mid.stats = new PlayerStats();
  match.team2_roster.sup = new Player();
  match.team2_roster.sup.stats = new PlayerStats();
  match.team2_roster.adc = new Player();
  match.team2_roster.adc.stats = new PlayerStats();
}

//Returns data specific to a game, then populates it
function getGameData(match, gameNum) {
  var apiUrl = API_GAME_STATS.replace("{realm}", match.games[gameNum].game_realm).replace("{gameId}", match.games[gameNum].game_id) + "?gameHash=" + match.games[gameNum].game_hash;
  var proxiedApiUrl = CORS_PROXY + apiUrl;
  console.log(proxiedApiUrl);

  match.load_status = "pending";

  return $.ajax({
    url: proxiedApiUrl,
    dataType: 'json',
    method: 'GET'
  }).then(function(data) {
    match.load_status = "done";
    parseGameResults(match, gameNum, data);
  });
}

function calculateTeamWin(match) {
  $.each(match.games, function(key) {
    if (match.games[key].result == 'resolved') {
      if (match.games[key].team1_stats.result == 'Win')
        match.team1.games_won++;
      else
        match.team2.games_won++;
    }
  });

  if (match.team1.games_won == match.team2.games_won) {
    match.team1.result = 'Tie';
    match.team2.result = 'Tie';
  } else if (match.team1.games_won > match.team2.games_won) {
    match.team1.result = 'Win';
    match.team2.result = 'Lose';
  } else {
    match.team1.result = 'Lose';
    match.team2.result = 'Win';
  }
}

//Filter and set game results per player
//Assumptions:
//1) Data.paricipantIdentities are ordered team1 0-4, team2 5-9.
//2) Within those team groupings, the order is top, jg, mid, adc, sup
//3) These orders match up with team1 participant 1-5, and team2 participant 6-10
function parseGameResults(match, gameNum, data) {
  var team1Name = "";
  var team2Name = "";

  var game = match.games[gameNum];
  game.result = "resolved";

  game.team1_stats = new TeamResults();
  game.team1_stats.stats = new TeamStats();
  game.team1_stats.roster = new Roster();
  game.team2_stats = new TeamResults();
  game.team2_stats.stats = new TeamStats();
  game.team2_stats.roster = new Roster();

  //Assuming that first 5 players are team 1, and 2nd 5 are team 2
  //Team 1 player results
  team1Name = data.participantIdentities[0].player.summonerName.split(" ")[0];
  for (var i = 0; i < 5; i++) {
    var pName = data.participantIdentities[i].player.summonerName.split(" ")[1];

    //Not assuming that teams returned are in the correct order, so we find the correct roster based on known team name
    var roster;
    if (match.team1.name_stub == team1Name) {
      roster = match.games[gameNum].team1_stats.roster;
    } else {
      roster = match.games[gameNum].team2_stats.roster;
    }

    var pos = new Player();
    pos.stats = new PlayerStats();
    pos.name = pName;
    pos.stats.k = data.participants[i].stats.kills;
    pos.stats.a = data.participants[i].stats.assists;
    pos.stats.d = data.participants[i].stats.deaths;
    pos.stats.tk = data.participants[i].stats.tripleKills;
    pos.stats.qk = data.participants[i].stats.quadraKills;
    pos.stats.pk = data.participants[i].stats.pentaKills;
    pos.stats.m = data.participants[i].stats.totalMinionsKilled;
    pos.champion = data.participants[i].championId;

    //Assume positions are in indexed order
    switch (i) {
      case 0:
        roster.top = pos;
        break;
      case 1:
        roster.jg = pos;
        break;
      case 2:
        roster.mid = pos;
        break;
      case 3:
        roster.adc = pos;
        break;
      case 4:
        roster.sup = pos;
        break;
    }
  }

  //Team 2 player results
  team2Name = data.participantIdentities[5].player.summonerName.split(" ")[0];
  for (var i = 5; i < 10; i++) {
    var pName = data.participantIdentities[i].player.summonerName.split(" ")[1];

    //Not assuming that teams returned are in the correct order, so we find the correct roster based on known team name
    var roster;
    if (match.team1.name_stub == team2Name) {
      roster = match.games[gameNum].team1_stats.roster;
    } else {
      roster = match.games[gameNum].team2_stats.roster;
    }

    var pos = new Player();
    pos.stats = new PlayerStats();
    pos.name = pName;
    pos.stats.k = data.participants[i].stats.kills;
    pos.stats.a = data.participants[i].stats.assists;
    pos.stats.d = data.participants[i].stats.deaths;
    pos.stats.tk = data.participants[i].stats.tripleKills;
    pos.stats.qk = data.participants[i].stats.quadraKills;
    pos.stats.pk = data.participants[i].stats.pentaKills;
    pos.stats.m = data.participants[i].stats.totalMinionsKilled;
    pos.champion = data.participants[i].championId;

    //Assume positions are in indexed order
    switch (i) {
      case 5:
        roster.top = pos;
        break;
      case 6:
        roster.jg = pos;
        break;
      case 7:
        roster.mid = pos;
        break;
      case 8:
        roster.adc = pos;
        break;
      case 9:
        roster.sup = pos;
        break;
    }
  }

  //Team results
  var team1 = null;
  var team2 = null;

  if (match.team1.name_stub == team1Name) {
    team1 = match.games[gameNum].team1_stats;
    team2 = match.games[gameNum].team2_stats;
  } else {
    team2 = match.games[gameNum].team1_stats;
    team1 = match.games[gameNum].team2_stats;
  }

  team1.name_stub = team1Name;
  team1.result = data.teams[0].win == "Win" ? "Win" : "Lose";
  team1.stats.got_first_blood = data.teams[0].firstBlood;
  team1.stats.won_under_30 = data.teams[0].win == "Win" && (data.gameDuration / 60) < 30;
  team1.stats.dragons_killed = data.teams[0].dragonKills;
  team1.stats.barons_killed = data.teams[0].baronKills;
  team1.stats.towers_destroyed = data.teams[0].towerKills;

  team2.name_stub = team2Name;
  team2.result = data.teams[1].win == "Win" ? "Win" : "Lose";
  team2.stats.got_first_blood = data.teams[1].firstBlood;
  team2.stats.won_under_30 = data.teams[1].win == "Win" && (data.gameDuration / 60) < 30;
  team2.stats.dragons_killed = data.teams[1].dragonKills;
  team2.stats.barons_killed = data.teams[1].baronKills;
  team2.stats.towers_destroyed = data.teams[1].towerKills;
}

//Determines current week. League defaults to NA
function setCurBracketAndWeek() {
  var dt = new Date();
  var curWeekMonday = new Date();
  curWeekMonday.setDate(dt.getDate() - (dt.getDay() == 0 ? 6 : dt.getDay()));
  var curWeekSunday = new Date();
  curWeekSunday.setDate(curWeekMonday.getDate() + 6);

  var bracketIndex = 0;
  var weekIndex = 0;
  while (curWeek == -1) {
    for (; bracketIndex < na_league.brackets.length && curWeek == -1; bracketIndex++) {
      weekIndex = 0;
      for (; weekIndex < na_league.brackets[bracketIndex].weeks.length && curWeek == -1; weekIndex++) {
        var tempDate = new Date(na_league.brackets[bracketIndex].weeks[weekIndex].days[0].day_date_epoch);
        if (curWeekMonday <= tempDate && tempDate <= curWeekSunday) {
          curBracket = bracketIndex + 1;
          curWeek = weekIndex + 1;
        }
      }
    }
  }

  if (curWeek == -1 || curBracket == -1) {
    var curDate = new Date();

    //If date past last bracket
    if (curDate > new Date(na_league.brackets.slice(-1)[0].weeks.slice(-1)[0].days[0].day_date_epoch)) {
      curBracket = na_league.brackets.length;
      curWeek = na_league.brackets.slice(-1)[0].weeks.length;
    }
  }
}

//Build and display the brackets to select
function showBracketSelect() {
  var bracketOpt = "";
  $.each(curLeague.brackets, function(key, val) {
    if (key == curBracket - 1)
      bracketOpt += createBracketOptionHTML(val.bracket_name, "selected");
    else
      bracketOpt += createBracketOptionHTML(val.bracket_name, "");
  });
  $('#bracket_select').html('').append(bracketOpt);
  setBracketListeners();
}

//Hook up the listeners to brackets dropdown
function setBracketListeners() {
  $('#bracket_select').change(function(key, val) {
    curBracket = key.target.selectedIndex + 1;
    curWeek = 1;

    showWeekSelect();
    showTab();
  });
}

//Build and display the week select
function showWeekSelect() {
  $('#block_name').html(curLeague.brackets[curBracket - 1].block_name);
  var weekTab = "";
  for (var i = 0; i < curLeague.brackets[curBracket - 1].weeks.length; i++) {
    weekTab += createWeekTabHTML(i + 1);
  }
  $('#week_select').html('').append(weekTab);
  $('#week_select').children().eq(curWeek - 1).addClass('selected');

  setWeekListeners();
}

//Hook up the listeners to week tabs
function setWeekListeners() {
  $.each($('#week_select').children(), function(key, val) {
    $(val).click(function(val) {
      $('#week_select').children().eq(curWeek - 1).removeClass('selected');
      $(val.target).addClass('selected');
      curWeek = key + 1;

      showTab();
    });
  });
}

//Shows specific bracket and week of a league
function showTab() {
  var weekHtml = createWeekScheduleHTML(curLeague.brackets[curBracket - 1].weeks[curWeek - 1]);
  $('#week').html('').append(weekHtml);
  setGameListenersForWeek();

  stopAndClearTimers();   //reset countdown timers (if any) for new tab
  liveStreamCounter = 0;  //Reset the livestream counter

  //Get cur weeks data. No preloading for the other weeks as the API hates being hit >30 times a second
  getWeekMatchResults();

  //$('.weekContainer').hide();
  populateTab();
  $('#week').show();
}

function setGameListenersForWeek() {
  var days = $('.day');
  for (var i = 0; i < days.length; i++) {
    var matches = $(days[i]).find('.match');
    for (var j = 0; j < matches.length; j++) {
      var games = $(matches[j]).find('.gameTab');
      for (var k = 0; k < games.length; k++) {
        (function(dayNum, matchNum, gameNum) {
          $(games[gameNum]).click(function() {
            getAndShowMatch(dayNum, matchNum, gameNum);
          })
        })(i, j, k);
      }
    }
  }
}

//Selects match and shows specific game num
function getAndShowMatch(dayNum, matchNum, gameNum) {
  var match = curLeague.brackets[curBracket - 1].weeks[curWeek - 1].days[dayNum].matches[matchNum];

  showMatch(match, gameNum);
}

//Gets called after ajax call returns data, or when tabs change. Always loads aggregated match data (and not specific game)
function showMatch(match, gameNum) {
  clearDisplayedGame(match.match_day, match.match_num);

  var gNum = 0;
  if (typeof gameNum !== "undefined") {
    gNum = gameNum
  }

  updateGameTabHighlight(match, gNum)

  if (match.state != "resolved") {
    //Show time until next match
    var curDate = new Date();
    var matchDate = new Date(match.scheduled_time_milliseconds);

    if (curDate < matchDate) {
      setAndStartTimers(match);
    } else {
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #team1_roster' + ' #mid #player_name').html('In Progress');
      match.state = "in progress";

      var liveStream = na_league.live_stream_url;
      liveStream += (liveStreamCounter++); //For every new live stream, add

      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').show()
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').html('Watch Live!')
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').attr('href', liveStream);
    }
  } else if (match.load_status != "done") {
    //show loading spinner
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #team1_roster' + ' #mid #player_name').html('Loading...');
  } else {
    //show match data


    //show game data
    showGame(match, gNum);
  }
}

//Display the countdown until next game
function showTimeUntilMatch(o) {
  var timeUntilGame = padZeros(o.days, 2) + ":" + padZeros(o.hours, 2) + ":" + padZeros(o.minutes, 2) + ":" + padZeros(o.seconds, 2);

  $('#day' + (o.match_day + 1) + ' #match' + (o.match_num + 1) + ' #team1_roster' + ' #mid #player_name').html(timeUntilGame);
}

function clearDisplayedGame(dayNum, matchNum) {
  for (var i = 0; i < 5; i++) {
    var pData = $('#day' + (dayNum + 1) + ' #match' + (matchNum + 1) + ' #team1_roster').children().eq(i);
    //pData.find('#champion_icon').src('');
    pData.find('#player_name').html('');
    pData.find('#kda').html('');
    pData.find('#fantasy_pts').html('');

    var pData2 = $('#day' + (dayNum + 1) + ' #match' + (matchNum + 1) + ' #team2_roster').children().eq(i);
    //pData2.find('#champion_icon').src('');
    pData2.find('#player_name').html('');
    pData2.find('#kda').html('');
    pData2.find('#fantasy_pts').html('');
  }

  $('#day' + (dayNum + 1) + ' #match' + (matchNum + 1) + ' #matchHeader #game_stream').hide();
}

//Updates the highlight when switching leagues/weeks/games
function updateGameTabHighlight(match, gameNum) {
  var gameTabId;
  if (gameNum == 0)
    gameTabId = "#matchOverview";
  else
    gameTabId = "#game" + gameNum;

  $.each($('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #gamesTab').children(), function(key) {
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #gamesTab').children().eq(key).addClass('unselected').removeClass('selected');
  });

  $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #gamesTab ' + gameTabId).addClass('selected').removeClass('unselected')
}

//Show game results of specific game
function showGame(match, game) {
  var pos = [];
  pos["top"] = "top";
  pos["jungle"] = "jg";
  pos["mid"] = "mid";
  pos["ad"] = "adc";
  pos["support"] = "sup";

  //The elements
  var day = match.match_day;
  var team1Roster = $('#day' + (day + 1) + ' #match' + (match.match_num + 1) + ' #team1_roster .playerRow')
  var team2Roster = $('#day' + (day + 1) + ' #match' + (match.match_num + 1) + ' #team2_roster .playerRow')

  if (game == 0) { //Display data aggregated from all games in match
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').hide();
    //The data
    var m = na_league.brackets[curBracket - 1].weeks[curWeek - 1].days[day].matches[match.match_num];

    //Set team results
    var t1Style;
    var t2Style;
    if (m.team1.games_won > m.team2.games_won) {
      t1Style = "winner";
      t2Style = "loser";
    } else if (m.team1.games_won < m.team2.games_won) {
      t1Style = "loser";
      t2Style = "winner";
    } else {
      t1Style = 'tied';
      t2Style = 'tied';
    }

    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team1_results').html(m.team1.result + ' - ' + m.team1.games_won);
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team1_results').attr('class', '').addClass(t1Style).addClass('team1Results');
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team2_results').html(m.team2.games_won + ' - ' + m.team2.result);
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team2_results').attr('class', '').addClass(t2Style).addClass('team2Results');

    for (var i = 0; i < team1Roster.length; i++) {
      var pData = m.team1_roster[pos[team1Roster[i].id]];
      $(team1Roster[i]).find('#player_name').html(pData.name);
      $(team1Roster[i]).find('#kda').html(pData.stats.k + "/" + pData.stats.d + "/" + pData.stats.a);
      $(team1Roster[i]).find('#fantasy_pts').html(pData.stats.f_pts);

      var pData2 = m.team2_roster[pos[team2Roster[i].id]];
      $(team2Roster[i]).find('#player_name').html(pData2.name);
      $(team2Roster[i]).find('#kda').html(pData2.stats.k + "/" + pData2.stats.d + "/" + pData2.stats.a);
      $(team2Roster[i]).find('#fantasy_pts').html(pData2.stats.f_pts);
    }
  } else {
    //The data
    var curGame = na_league.brackets[curBracket - 1].weeks[curWeek - 1].days[day].matches[match.match_num].games[game - 1]; //Subtract 1 from game because 0 is reserved for the 'All' tab

    if (curGame.result == "not played") {
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #team1_roster' + ' #mid #player_name').html('Not Played');

      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team1_results').html('');
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team2_results').html('');
    } else {
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').show();
      if (curGame.vod_link != "") {
        $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').html('Watch Game');
        $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').attr('href', curGame.vod_link);
      } else {
        $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').html('No VOD Yet');
        $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').attr('href', "");
      }

      //Set team results
      var t1Style;
      var t2Style;
      if (curGame.team1_stats.result == 'Win') {
        t1Style = "winner";
        t2Style = "loser";
      } else {
        t1Style = "loser";
        t2Style = "winner";
      }
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team1_results').html(curGame.team1_stats.result);
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team1_results').attr('class', '').addClass(t1Style).addClass('team1Results');
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team2_results').html(curGame.team2_stats.result);
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #results #team2_results').attr('class', '').addClass(t2Style).addClass('team2Results');


      //Set the team results
      for (var i = 0; i < team1Roster.length; i++) {
        var pData = curGame.team1_stats.roster[pos[team1Roster[i].id]];

        $(team1Roster[i]).find('#player_name').html(pData.name);
        $(team1Roster[i]).find('#kda').html(pData.stats.k + "/" + pData.stats.d + "/" + pData.stats.a);
        $(team1Roster[i]).find('#fantasy_pts').html(pData.stats.f_pts);

        var pData2 = curGame.team2_stats.roster[pos[team2Roster[i].id]];

        $(team2Roster[i]).find('#player_name').html(pData2.name);
        $(team2Roster[i]).find('#kda').html(pData2.stats.k + "/" + pData2.stats.d + "/" + pData2.stats.a);
        $(team2Roster[i]).find('#fantasy_pts').html(pData2.stats.f_pts);
      }
    }
  }
}

//Populates a week with match result data
function populateTab() {
  var league = na_league;

  for (var i = 0; i < league.brackets[curBracket - 1].weeks[curWeek - 1].days.length; i++) {
    $('#day' + (i + 1) + ' #date').html(league.brackets[curBracket - 1].weeks[curWeek - 1].days[i].day_date)

    //Populate matches
    for (var j = 0; j < league.brackets[curBracket - 1].weeks[curWeek - 1].days[i].matches.length; j++) {
      $('#day' + (i + 1) + ' #match' + (j + 1) + ' #matchTime').html(league.brackets[curBracket - 1].weeks[curWeek - 1].days[i].matches[j].scheduled_time)
      $('#day' + (i + 1) + ' #match' + (j + 1) + ' #team1_icon').attr('src', teamIcon[league.brackets[curBracket - 1].weeks[curWeek - 1].days[i].matches[j].team1.name_stub]);
      $('#day' + (i + 1) + ' #match' + (j + 1) + ' #team2_icon').attr('src', teamIcon[league.brackets[curBracket - 1].weeks[curWeek - 1].days[i].matches[j].team2.name_stub]);

      showMatch(league.brackets[curBracket - 1].weeks[curWeek - 1].days[i].matches[j]);
    }
  }
}

//Load the app
function loadAndUseData() {
  if (curLeague != null) {
    console.log("League schedules loaded from cache!");
    setCurBracketAndWeek();   //Needs to be after schedules are set, because it relies on the match dates
    showBracketSelect();
    showWeekSelect();

    if (USE_CACHE)
      loadCachedMatches();
    else
      showTab(curLeague, curWeek);
  } else {
    //NA Data
    $.ajax({
      url: API_SCHEDULE_ITEMS,
      data: {
        leagueId: NA_LEAGUE_ID//curLeague.league_id
      },
      dataType: 'json',
      method: 'GET'
    }).then(
      function(resp) {
        console.log("League schedules retrieved.");

        //Build schedule objects
        getAndPopulateSchedule(resp.scheduleItems, resp.highlanderTournaments);


        setCurBracketAndWeek();   //Needs to be after schedules are set, because it relies on the match dates
        curLeague = na_league;    //Temp! will move to options most likely

        showBracketSelect();
        showWeekSelect();

        if (USE_CACHE)
          loadCachedMatches();
        else
          showTab();
      },
      function(resp) {
        alert('failure');
      }
    );
  }
}

//Attaches events to DOM elements
function initListeners() {
  //Settings Page
  $('#settings_button').click(function() {
    $('#schedule_view').hide();
    $('#settings_view').show();
  });
  $('#back_button').click(function() {
    $('#settings_view').hide();
    $('#schedule_view').show();
  });

  //Settings to save on update
  $('.optionCheck').click(function(t) {
    var o = {};
    if ($(t.target).hasClass('usability')) {
      extSettings.usability[t.target.id] = t.target.checked;
      o['usabilitySettings'] = extSettings.usability;
    }
    if ($(t.target).hasClass('leagues')) {
      extSettings.leagues[t.target.id] = t.target.checked;
      o['leagueSettings'] = extSettings.leagues;
    }
    if ($(t.target).hasClass('fantasy')) {
      extSettings.fantasy[t.target.id] = t.target.checked;
      o['fantasySettings'] = extSettings.fantasy;
    }

    chrome.storage.local.set(o);
  });

  $('.optionRadio').click(function(t) {
    var o = {};
    if ($(t.currentTarget).hasClass('usability')) {
      extSettings.usability[t.currentTarget.id] = t.target.id;
      o['usabilitySettings'] = extSettings.usability;
    }
    if ($(t.currentTarget).hasClass('leagues')) {
      extSettings.leagues[t.currentTarget.id] = t.target.id;
      o['leagueSettings'] = extSettings.leagues;
    }
    if ($(t.currentTarget).hasClass('fantasy')) {
      extSettings.fantasy[t.currentTarget.id] = t.target.id;
      o['fantasySettings'] = extSettings.fantasy;
    }

    chrome.storage.local.set(o);
  });

  //League Select
  $('#eu').click(function() {
    showTab("eu", null);
  });

  $('#na').click(function() {
    showTab("na", null);
  });

  /*//Week Select
  for (var i = 1; i <= WEEKS_IN_LCS; i++) {
    (function(i) {
      $('#week' + i + '_select').click(function() {
        showTab(null, i);
      })
    })(i);
  }*/

  /*//Game Select
  //Assumes elements all in order
  days = $('.naDay,.euDay');
  for (var i = 0; i < days.length; i++) {
    matches = $(days[i]).find('.naMatch,.euMatch');
    for (var j = 0; j < matches.length; j++) {
      games = $(matches[j]).find('.naGame,.euGame');
      for (var k = 0; k < games.length; k++) {
        (function(dayNum, matchNum, gameNum) {
          $(games[gameNum]).click(function() {
            getAndShowMatch(dayNum, matchNum, gameNum);
          })
        })(i, j, k);
      }
    }
  }*/
}

//Start Here
document.addEventListener('DOMContentLoaded', function() {
  initListeners();

  if (USE_CACHE)
    loadAllFromCache();
  else
    loadAndUseData();
});