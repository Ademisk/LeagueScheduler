//=====================================
// HTML components
//=====================================

function createBracketOptionHTML(id, selected) {
	return `<option id="` + id + `" ` + selected + `>` + id + `</option>`;
}

function createWeekTabHTML(id) {
	return `<div id="week` + id + `_select" class="weekTabSelect">` + id + `</div>`;
}

function createWeekScheduleHTML(week) {
	var weekHtml ="";
	for (var i = 0; i < week.days.length; i++) {
		var matchHtml = "";
		for (var j = 0; j < week.days[i].matches.length; j++) {
			var matchGameTabs = "";
			for (var k = 0; k < week.days[i].matches[j].games.length; k++) {
				matchGameTabs += createMatchTabHTML(k + 1);
			}
			matchHtml += createMatchHTML(j + 1, week.days[i].matches[j].scheduled_time, matchGameTabs);
		}
		weekHtml += createDayHTML(i + 1, week.days[i].day_date, matchHtml);
	}

	return weekHtml;
}

function createDayHTML(index, dayDate, contents) {
	return `<div id="day` + index + `" class="day">
						<div id="date" class="date">` + dayDate + `</div>`
							+ contents +
					`</div>`;
}

function createMatchHTML(index, matchTime, gameTabs) {
	return `<div id="match` + index + `" class="match">
							<div id="match_header" class="matchHeader">
								<div id="match_time" class="matchTime">` + matchTime + `</div>
								<div id="games_tab" class="gamesTab">
									<div id="matchOverview" class="gameOverview selected">All</div>`
									 + gameTabs +
								`</div>
								<div id="results" class="results">
									<div id="team1_results" class="team1Results"></div>
									<div id="team2_results" class="team2Results"></div>
								</div>
								<div id="team_fantasy_points"></div>
								<a href="" target="_blank" id="game_stream" class="vodLink button"></a>
							</div>

							<img id="team1_icon" class="teamIcon" />
							<div id="team1_roster" class="teamRoster">
								<div id="top" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
								<div id="jungle" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
								<div id="mid" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
								<div id="ad" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
								<div id="support" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
							</div>

							<div class="vs">vs.</div>

							<img id="team2_icon" class="teamIcon" />
							<div id="team2_roster" class="teamRoster">
								<div id="top" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
								<div id="jungle" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
								<div id="mid" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
								<div id="ad" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
								<div id="support" class="playerRow">
									<div id="champion_icon" class="championIcon"></div>
									<div id="player_name" class="playerName"></div>
									<div id="kda" class="kda"></div>
									<div id="fantasy_pts" class="fantasyPts"></div>
								</div>
							</div>
						</div>`;
}

function createMatchTabHTML(index) {
	return `<div id="game` + index + `" class="gameTab unselected">` + index + `</div>`;
}