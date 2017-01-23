var KILL_PTS = 2;
var DEATH_PTS = -.5;
var ASSIST_PTS = 1.5;
var MINION_PTS = .01;
var TRIPLE_KILL_PTS = 2;
var QUADRA_KILL_PTS = 5;
var PENTA_KILL_PTS = 10;
var KILL_ASSIST_PTS = 2;

var WIN_PTS = 2;
var BARON_KILLS_PTS = 2;
var DRAGON_KILLS_PTS = 1;
var FIRST_BLOOD_PTS = 2;
var TOWERS_DESTROYED_PTS = 1;
var WIN_UNDER_30_PTS = 2;

//Calculate team and player fantasy pts
function calculateFantasyPts(match) {
	for (var i = 0; i < match.games.length && match.games[i].result =="resolved"; i++) {
		//Team 1
		//Team 1 fantasy pts per game
		var gameStats = match.games[i].team1_stats;
		gameStats.stats.f_pts = round((gameStats.result =="Win" ? WIN_PTS : 0) + gameStats.stats.barons_killed * BARON_KILLS_PTS 
			+ gameStats.stats.dragons_killed * DRAGON_KILLS_PTS + (gameStats.stats.first_blood ? FIRST_BLOOD_PTS : 0) 
			+ (gameStats.stats.won_under_30 ? WIN_UNDER_30_PTS : 0) + gameStats.stats.towers_destroyed * TOWERS_DESTROYED_PTS);

		//Team fantasy pts combined (first 2 games)
		if (i < 2) {
			match.team1.f_pts = round(match.team1.f_pts + gameStats.stats.f_pts);
		}

		//Team 1 player fantasy pts
		$.each(gameStats.roster, function(key) {
			//Player fantasy pts per game 
			var player = gameStats.roster[key];
			player.stats.f_pts = round(player.stats.k * KILL_PTS + player.stats.d * DEATH_PTS + player.stats.a * ASSIST_PTS 
				+ player.stats.m * MINION_PTS + player.stats.tk * TRIPLE_KILL_PTS 
				+ player.stats.qk * QUADRA_KILL_PTS + player.stats.pk * PENTA_KILL_PTS);

			//Player fantasy pts combined (first 2 games)
			if (i < 2) {
				var matchPlayer = match.team1_roster[key];
				if (matchPlayer.name =="") {
					matchPlayer.name = player.name;
					matchPlayer.champion = player.champion;
				}
				matchPlayer.stats.k += player.stats.k;
				matchPlayer.stats.d += player.stats.d;
				matchPlayer.stats.a += player.stats.a;
				matchPlayer.stats.tk += player.stats.tk;
				matchPlayer.stats.qk += player.stats.qk;
				matchPlayer.stats.pk += player.stats.pk;
				matchPlayer.stats.m += player.stats.m;
				matchPlayer.stats.f_pts = round(matchPlayer.stats.f_pts + player.stats.f_pts);
			}
		});

		//Team 2
		//Team 2 fantasy pts per game
		var gameStats2 = match.games[i].team2_stats;
		gameStats2.stats.f_pts = round((gameStats2.result =="Win" ? WIN_PTS : 0) + gameStats2.stats.barons_killed * BARON_KILLS_PTS 
			+ gameStats2.stats.dragons_killed * DRAGON_KILLS_PTS + (gameStats2.stats.first_blood ? FIRST_BLOOD_PTS : 0) 
			+ (gameStats2.stats.won_under_30 ? WIN_UNDER_30_PTS : 0) + gameStats2.stats.towers_destroyed * TOWERS_DESTROYED_PTS);

		//Team fantasy pts combined (first 2 games)
		if (i < 2) {
			match.team2.f_pts = round(match.team2.f_pts + gameStats2.stats.f_pts);
		}

		//Team 2 players
		$.each(gameStats2.roster, function(key) {
			//Player fantasy pts per game 
			var player2 = gameStats2.roster[key];
			player2.stats.f_pts = round(player2.stats.k * KILL_PTS + player2.stats.d * DEATH_PTS + player2.stats.a * ASSIST_PTS 
				+ player2.stats.m * MINION_PTS + player2.stats.tk * TRIPLE_KILL_PTS 
				+ player2.stats.qk * QUADRA_KILL_PTS + player2.stats.pk * PENTA_KILL_PTS);

			//Player fantasy pts combined (first 2 games)
			if (i < 2) {
				var matchPlayer2 = match.team2_roster[key];
				if (matchPlayer2.name =="") {
					matchPlayer2.name = player2.name;
					matchPlayer2.champion = player2.champion;
				}
				matchPlayer2.stats.k += player2.stats.k;
				matchPlayer2.stats.d += player2.stats.d;
				matchPlayer2.stats.a += player2.stats.a;
				matchPlayer2.stats.tk += player2.stats.tk;
				matchPlayer2.stats.qk += player2.stats.qk;
				matchPlayer2.stats.pk += player2.stats.pk;
				matchPlayer2.stats.m += player2.stats.m;
				matchPlayer2.stats.f_pts = round(matchPlayer2.stats.f_pts + player2.stats.f_pts);
			}
		});
	}
}