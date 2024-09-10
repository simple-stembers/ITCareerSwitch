	$('#oceanRun').click(function() {
		console.log('ocean button clicked')
		console.log($('#oceanLng').val());
		console.log($('#oceanLat').val());

		$.ajax({
			url: "libs/php/getOceanInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				latitude:  $('#oceanLat').val(),
				longitude:  $('#oceanLng').val()
			},

            success: function(result) {

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {

					$('#oceanName').html(result.data);
					

				}
			
			},
			error: function(jqXHR, textStatus, error) {
					console.log('Error:', error);
			}
        }); 
    
    });


$('#eqRun').click(function() {
		console.log('eq button clicked')
		console.log($('#eqNorth').val());
		console.log($('#eqSouth').val());
		console.log($('#eqEast').val());
		console.log($('#eqWest').val());

		$.ajax({
			url: "libs/php/getEarthquakeInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				north:  $('#eqNorth').val(),
				south:  $('#eqSouth').val(),
				east:  $('#eqEast').val(),
				west:  $('#eqWest').val()
			},

            success: function(result) {

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {

				
				var list = document.createElement('ol');

				
				for (var i = 0; i < result.data.length; i++) {
				  var earthquake = result.data[i];
			
				  
				  var listItem = document.createElement('li');
			
				  
				  var paragraph = document.createElement('p');
				  paragraph.innerHTML = 'Magnitude: ' + earthquake.magnitude + '<br>' +
										'Co-ordinates: ' + earthquake.lat + ', ' + earthquake.lng + '<br>' +
										'DateTime: ' + earthquake.datetime;
			
				  
				  listItem.appendChild(paragraph);
			
				  
				  list.appendChild(listItem);
				}
			
				
				document.getElementById('eqResults').appendChild(list);

				}
			
			},
			error: function(jqXHR, textStatus, error) {
					console.log('Error:', error);
			}
        }); 
    
    });

	$('#weatherRun').click(function() {
		console.log('weather button clicked')
		console.log($('#ICAO').val());
		

		$.ajax({
			url: "libs/php/getWeatherInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				ICAO :  $('#ICAO').val()
			},

            success: function(result) {

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {

					// Create an unordered list HTML element
						const ul = document.createElement('ul');

					// Add list items to the unordered list
						ul.innerHTML = `
						<li>Station Name: ${result.data.stationName}</li>
						<li>Datetime: ${result.data.datetime}</li>
						<li>Clouds: ${result.data.clouds}</li>
						<li>Wind Speed: ${result.data.windSpeed} kt</li>
						<li>Temperature: ${result.data.temperature}°C</li>
						<li>Humidity: ${result.data.humidity}%</li>
						`;

					// Append the unordered list to the desired HTML element
						document.getElementById('weatherResults').appendChild(ul);
											

				}
			
			},
			error: function(jqXHR, textStatus, error) {
					console.log('Error:', error);
			}
        }); 
    
    });