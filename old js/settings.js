//===============================
// Settings
//===============================

//Attempt to load user settings. Fail or succeed, load schedule data.
function loadAllFromCache() {
  extSettings = new Settings();
  extSettings.usability = new UsabilitySettings();
  extSettings.leagues = new LeagueSettings();
  extSettings.fantasy = new FantasySettings();

  var o = [];
  o.push("usabilitySettings");
  o.push("leagueSettings");
  o.push("fantasySettings");
  
  chrome.storage.local.get(o, function(items) {
    setSettings(items);
    loadCachedSchedule();
  });
}

//Set settings to object, and push up to the form
function setSettings(items) {
	if (typeof items["usabilitySettings"] !=="undefined") {
		extSettings.usability = items["usabilitySettings"];
		$('#view_mode #' + extSettings.usability.view_mode).prop('checked', true);
		$('#hide_results').prop('checked', extSettings.usability.hide_results);
	}

	if (typeof items["leagueSettings"] !=="undefined") {
		extSettings.leagues = items["leagueSettings"];
		$('#na_lcs_league').prop('checked', extSettings.leagues.na_lcs_league);
		$('#eu_lcs_league').prop('checked', extSettings.leagues.eu_lcs_league);
	}

	if (typeof items["fantasySettings"] !=="undefined") {
		extSettings.fantasy = items["fantasySettings"];
		$('#show_fantasy_pts').prop('checked', extSettings.fantasy.show_fantasy_pts);
		$('#fantasy_mode #' + extSettings.fantasy.fantasy_mode).prop('checked', true);
	}
}