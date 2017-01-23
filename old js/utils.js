// @flow

var weekday = new Array(7);
weekday[0]="Sunday";
weekday[1] ="Monday";
weekday[2] ="Tuesday";
weekday[3] ="Wednesday";
weekday[4] ="Thursday";
weekday[5] ="Friday";
weekday[6] ="Saturday";

var month = new Array(12);
month[0]="January";
month[1] ="February";
month[2] ="March";
month[3] ="April";
month[4] ="May";
month[5] ="June";
month[6] ="July";
month[7] ="August";
month[8] ="September";
month[9] ="October";
month[10] ="November";
month[11] ="December";

var teamIcon = {
	//NA
	APX:"/teamIcons/NA/apx.png",
	C9:"/teamIcons/NA/c9.png",
	CLG:"/teamIcons/NA/clg.png",
	NV:"/teamIcons/NA/nv.png",
	FOX:"/teamIcons/NA/fox.png",
	IMT:"/teamIcons/NA/imt.png",
	NRG:"/teamIcons/NA/nrg.png",
	P1:"/teamIcons/NA/p1.png",
	TL:"/teamIcons/NA/tl.png",
	TSM:"/teamIcons/NA/tsm.png",

	//EU
	FNC:"/teamIcons/EU/fnc.png",
	G2:"/teamIcons/EU/g2.png",
	GIA:"/teamIcons/EU/gia.png",
	H2K:"/teamIcons/EU/h2k.png",
	OG:"/teamIcons/EU/og.png",
	ROC:"/teamIcons/EU/roc.png",
	S04:"/teamIcons/EU/s04.png",
	SPY:"/teamIcons/EU/spy.png",
	UOL:"/teamIcons/EU/uol.png",
	VIT:"/teamIcons/EU/vit.png"
};

var champIcon = {
	
}

function sortScheduleItems(a, b) {
	return (new Date(a['scheduledTime'])).getTime() - (new Date(b['scheduledTime'])).getTime();
}

function sortGames(a, b) {
	return a.game_num - b.game_num;
}

function padZeros(num, size) {
	var n = num.toString();
	while (n.length < size)
		n ="0" + n;

	return n;
}

function round(p) {
	return parseFloat(parseFloat(p).toFixed(2));
}

function computeDayDate(d, day) {
	var dt = new Date(d);

    return weekday[dt.getDay()] + ', ' + month[dt.getMonth()] + ' ' + dt.getDate() + ' - Day ' + day;
}