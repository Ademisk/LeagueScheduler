//========================================================================
// Match Timer
//========================================================================

var SECS_IN_MIN = 60;
var SECS_IN_HOUR = 3600;
var SECS_IN_DAY = 86400;


//Counts down the timers in queue
function timerCount()
{
	$.each(timerObjects, function(key) {
		var o = timerObjects[key];

		var secSub = 1
		var minSub = 0;
		var hourSub = 0;
		var daySub = 0;
		if (o.seconds - secSub < 0) {
			o.seconds = 59;
			minSub = 1;
		} else
			o.seconds--;

		if (o.minutes - minSub < 0) {
			o.minutes = 59;
			hourSub = 1;
		} else
			o.minutes -= minSub;

		if (o.hours - hourSub < 0) {
			o.hours = 23;
			daySub = 1;
		} else
			o.hours -= hourSub;

		if (o.days - daySub < 0) {
			//timer expired
			timerObjects.split(key, 1);
		} else {
			o.days -= daySub;
			showTimeUntilMatch(o);
		}
			
	});

	//If all timers expired, stop counter interval
	if (timerObjects.length == 0) {
		clearInterval(intervalId);
		intervalId = 0;
	}
}

//Stop timer countdown, and clear out all timers
function stopAndClearTimers() {
	clearInterval(intervalId);
	intervalId = 0;

	timerObjects = [];
}

//Add a match to have it's timer shown
function setAndStartTimers(match) {
	var newTimer = true;

	$.each(timerObjects, function(key) {
		if (timerObjects[key].match_day == match.match_day && timerObjects[key].match_num == match.match_num)
			newTimer = false;
	});

	if (newTimer) {
		var o = new MatchTimer();
		o.match_day = match.match_day;
		o.match_num = match.match_num;


		var curDate = new Date();
		seconds = Math.floor((match.scheduled_time_milliseconds - curDate.getTime()) / 1000);
		o.days = Math.floor(seconds / SECS_IN_DAY);
		seconds -= (o.days * SECS_IN_DAY);
		o.hours = Math.floor(seconds / SECS_IN_HOUR);
		seconds -= (o.hours * SECS_IN_HOUR);
		o.minutes = Math.floor(seconds / SECS_IN_MIN);
		o.seconds = seconds - (o.minutes * SECS_IN_MIN);
		timerObjects.push(o);

		//start timer if not started
		if (intervalId == 0)
			intervalId = setInterval(timerCount, 1000);
	}
}