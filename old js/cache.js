//========================================================================
// Schedule Caching
//========================================================================

//Retrieves the schedules for leagues
function loadCachedSchedule() {
	o = [];

	o.push('na_schedule');
	o.push('eu_schedule');

	chrome.storage.local.get(o, function(items){
		na_schedule = items['na_schedule'];
		eu_schedule = items['eu_schedule'];

		loadAndUseData();
	});
}

//Saves just the week and day data. And matchID. Basically, everything retrieved from the first API call
function saveScheduleIntoCache(schedule, league) {
	var o = {};

	if (league =="na")
		o["na_schedule"] = schedule;
	else
		o["eu_schedule"] = schedule;

	chrome.storage.local.set(o);
}

//========================================================================
// Match Caching
//========================================================================
function loadCachedMatches() {
	var o = [];
	var bKeyNA;
	var bKeyEU;

	//Create the keys
	//Get all NA data
	for (var i = 0; i < WEEKS_IN_LCS; i++) {
		for (var j = 0; j < NA_DAYS_PER_WEEK; j++) {
			for (var k = 0; k < na_schedule[i].days[j].matches.length; k++) {
				bKeyNA ="na-" + (i + 1) +"-" + (j + 1) +"-" + (k + 1);
				//o.push(bKeyNA +"-match_id");
				o.push(bKeyNA +"-state");
				o.push(bKeyNA +"-scheduled_time");
				o.push(bKeyNA +"-scheduled_time_milliseconds");
				o.push(bKeyNA +"-load_status");

				var gamesPerMatch = NA_GAMES_PER_MATCH;

				for (var l = 0; l < gamesPerMatch; l++) {
					o.push(bKeyNA +"-game" + (l + 1));
				}

				o.push(bKeyNA +"-team1");
				o.push(bKeyNA +"-team2");
				o.push(bKeyNA +"-team1_roster");
				o.push(bKeyNA +"-team2_roster");
			}
		}
	}

	//Get all EU data
	for (var i = 0; i < WEEKS_IN_LCS; i++) {
		for (var j = 0; j < EU_DAYS_PER_WEEK; j++) {
			for (var k = 0; k < eu_schedule[i].days[j].matches.length; k++) {
				bKeyEU ="eu-" + (i + 1) +"-" + (j + 1) +"-" + (k + 1);
				//o.push(bKeyEU +"-match_id");
				o.push(bKeyEU +"-state");
				o.push(bKeyEU +"-scheduled_time");
				o.push(bKeyEU +"-scheduled_time_milliseconds");
				o.push(bKeyEU +"-load_status");

				var gamesPerMatch = EU_GAMES_PER_MATCH;

				for (var l = 0; l < gamesPerMatch; l++) {
					o.push(bKeyEU +"-game" + (l + 1));
				}

				o.push(bKeyEU +"-team1");
				o.push(bKeyEU +"-team2");
				o.push(bKeyEU +"-team1_roster");
				o.push(bKeyEU +"-team2_roster");
			}
		}
	}

	chrome.storage.local.get(o, function(items) {
		var league;
		var week;
		var day;
		var match;
		var elem;
		var game;

		//weeks, days, matches, games assumed in order, since keys were added to o[] in order
		$.each(items, function(key) {
			league = key.replace(/([a-z]{2}).*/,"$1");
			week = key.replace(/[a-z]{2}-(\d{1}).*/,"$1") - 1;
			day = key.replace(/[a-z]{2}-\d{1}-(\d{1}).*/,"$1") - 1;
			match = key.replace(/[a-z]{2}-\d{1}-\d{1}-(\d{1}).*/,"$1") - 1;
			elem = key.replace(/[a-z]{2}-\d{1}-\d{1}-\d{1}-([a-z0-9_]+).*/,"$1");

			var schedule;
			if (league =="na")
				schedule = na_schedule;
			else
				schedule = eu_schedule;

			if (elem.match(/game[\d]+/)) {
				game = elem.replace(/game/, '') - 1;
				schedule[week].days[day].matches[match].games[game] = items[key];
			} else {
				schedule[week].days[day].matches[match][elem] = items[key];
			}
		});

		showTab(curLeague, curWeek);
	});
}

//Break up a match and cache it
function saveMatchIntoCache(match, league, blockName, weekNum) {
	var baseKey = league +"-" + blockName +"-" + weekNum +"-" + (match.match_day + 1) +"-" + (match.match_num + 1);
	//console.log('baseKey: ' + baseKey);

	var o = {};
	//o[baseKey +"-match_id"] = match.match_id;
	o[baseKey +"-state"] = match.state;
	o[baseKey +"-scheduled_time"] = match.scheduled_time;
	o[baseKey +"-scheduled_time_milliseconds"] = match.scheduled_time_milliseconds;
	o[baseKey +"-load_status"] = match.load_status;
	chrome.storage.local.set(o);

	$.each(match.games, function(key) {
		o = {};
		o[baseKey +"-game" + (key + 1)] = match.games[key];
		chrome.storage.local.set(o);
	});

	o = {};
	o[baseKey +"-team1"] = match.team1
	chrome.storage.local.set(o);

	o = {};
	o[baseKey +"-team2"] = match.team2
	chrome.storage.local.set(o);

	o = {};
	o[baseKey +"-team1_roster"] = match.team1_roster
	chrome.storage.local.set(o);

	o = {};
	o[baseKey +"-team2_roster"] = match.team2_roster
	chrome.storage.local.set(o);
}