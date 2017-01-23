/*var MAX_ROSTER_URL = "http://fantasy.na.lolesports.com/en-US/api/league/1131690";


$(document).ready(loadContent());


function init() {
	$.ajax({
		url: MAX_ROSTER_URL,
		dataType: 'json',
		method: 'GET'
	}).done(function(response) {
		$('#personalRoster').html('nothing');
		if (response != null && response.currentWeek != null) {
			//alert("data retrieved");
			$('#personalRoster').html('found');
		}
		else {
			//alert("logged out");
			$('#personalRoster').html('NOT found');
		}
	}).fail(function(jqXHR, textStatus, errorThrown) {
		var res;

		$.each(jqXHR, function(k, v) {
			res += "key:" + k + " - val:" + v + ", ";
		})

		alert("response: " + res + " - status: " + textStatus + " - error: " + errorThrown);
		if (response != null && response.currentWeek != null) {
			//alert("data retrieved");
			$('#personalRoster').html('found');
		}
		else {
			//alert("logged out");
			$('#personalRoster').html('NOT found');
		}
	}).always(function() {
		alert('always');
	});
}

function loadContent() {
	//document.getElementById('personalRoster').innerHTML = 'herp derp';
	//$('#personalRoster').val("herp derp");
	alert('hoi');
	jQuery.getJSON('http://whateverorigin.org/get?url=' + MAX_ROSTER_URL + '&callback=?', function(data){
		alert('hi');
		$('#personalRoster').val(data.contents);
	});


	/*var QueryURL = "http://anyorigin.com/get?url=" + MAX_ROSTER_URL + "&callback=?";
	$.getJSON(QueryURL, function(data) {
		alert(data);
        if (data && data != null && typeof data == "object" && data.contents && data.contents != null && typeof data.contents == "string")
        {
            data = data.contents;
            if (data.length > 0)
			{
                $('#personalRoster').html(data);
			}
        }
    });*/
}*/