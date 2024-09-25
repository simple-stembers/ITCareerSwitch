map.on('click', function(e) {
   //clear previous markers      
    markerGroup.clearLayers();
   
    // getting the latitude and longitude of the clicked point
   var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    var marker = L.marker([lat,lng]).addTo(markerGroup);
    console.log('Clicked at: ' + lat + ', ' + lng);

    //GEONAMES COUNTRY SUBDIVISION API CALL
    $.ajax( {
        url: "libs/php/getCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
          lat: lat, lng: lng
        },
        success: function(result) {
          
          var countryCode = result.data.countryCode;
          var countryName = result.data.countryName;


          

          //COUNTRY FLAG CALL
          var flagImg =document.getElementById("countryFlag")
          
          flagImg.src = "https://flagcdn.com/" + countryCode.toLowerCase() + ".svg";
          flagImg.alt = countryName;

         
          if (result.status.name == 'ok') {
            if(result.data){
                $('#countryName').html(countryName);
            } else{
                $('#countryName').html("No country found, sorry!");
            };

            //GEONAMES COUNTRY INFO API CALL
            $.ajax( {
                url: "libs/php/getCountryInfo.php",
                type: 'POST',
                dataType: 'json',
                data: {
                  country: countryCode
                },
                success: function(result) {
                  
                  
                  if (result.status.name == 'ok') {
                    $('#capitalCity').html('<h4>The Capital City:<b> '+ result.data.capital + '</b></h4>');

                    $('#population').html('<h4>The Population: <b>'+ result.data.population + '</b></h4>');
                }

                //WIKIPEDIA API CALL
                //using an iframe to allow for access to the full wiki page of the country within the modal overlay

                document.getElementById('wikiResults').innerHTML = '<iframe class="wiki-iframe"src="https://en.wikipedia.org/wiki/' + countryName + '"></iframe>';

                //LANGUAGE API CALL

                var language = result.data.language.slice(0,2);
                

                $.ajax({
                  url: "libs/php/getHello.php",
                  type: 'POST',
                  dataType: 'json',
                  data: {
                    country: countryCode
                  },
                  success: function(result) {
                 
                    
                    if (result.status.name == 'ok') {
                      if (result.data) {
                      $('#helloResults').html("<h4>The local 'Hello': <b>" + result.data + "</b></h4>");}
                      else{
                        $('#helloResults').html("<h4>I'm not sure how to say 'Hello!' here, sorry!</h4>");
                      }
                    }
                  },
                }
                )
                // CURRENCY API CALL
                // unfortunately this API has a monthly limit which I reached relatively quickly during testing. Once finished, it is unlikely for there to be enough API calls to reach this limit in the future.

                var currency = result.data.currencyCode;
               

                $.ajax( {
                  url: "libs/php/getCurrencyInfo.php",
                  type: 'POST',
                  dataType: 'json',
                  data: {
                    currency: currency
                  },
                  success: function(result) {
                   
                    //I was unable to access an exchange rate changer for free, so this is just a simple function to convert from one currency to another
                    function exchangeMoney(homeMoney) {
                      return (homeMoney/result.data.gbp)*result.data.local;
                    };
                    $('#currencyResults').html(
                      `<h4>The Local Currency: ${currency}<br>
                      Exchange your money: <br>
                      £<input type="float" id="homeMoney" value="1">
                      <b><span id="exchangeResult"></span></b></h4>`);
                     
                      $('#homeMoney').on('input', function() {
                       var homeMoney = parseFloat($(this).val());
                       var exchangeResult = (exchangeMoney(homeMoney, result.data.gbp)).toFixed(2);
                       //This line is what shows when I have reached my API credits for the month
                       if (exchangeResult === "NaN") {
                         $('#exchangeResult').html("Currently exceeded monthly exchanging limit, sorry!");
                       }
                       else {
                       $('#exchangeResult').html(`=> ${exchangeResult} ${currency}`);}

                      });
                      
                      

                  },
                  error: function(xhr, status, error) {
                    console.log("MoneyError: " + error);
                }
          })}});










        
        }},
        error: function(xhr, status, error) {
            console.log("Error:", error);
    }});

    //OPEN WEATHER API CALL
    $.ajax( {
      url: "libs/php/getWeatherInfo.php",
      type: 'POST',
      dataType: 'json',
      data: {
        lat: lat, lng: lng
      },
      success: function(result) {
      
        //this api returns data every 3 hours, so to avoid bloat I thought it made sense to give now, 12 hours, 24 hours and 48 hours.
        if (result.status.name == 'ok') {

            const weatherUl = document.createElement('ul');
            let weatherDesNow=result.data.list[0].weather[0].description;
            let weatherDes12=result.data.list[4].weather[0].description;
            let weatherDes24=result.data.list[8].weather[0].description;
            let weatherDes48=result.data.list[16].weather[0].description;

            let weatherTempNow=result.data.list[0].main.temp;
            let weatherTemp12=result.data.list[4].main.temp;
            let weatherTemp24=result.data.list[8].main.temp;
            let weatherTemp48=result.data.list[16].main.temp;

            let weatherFeelNow=result.data.list[0].main.feels_like;
            let weatherFeel12=result.data.list[4].main.feels_like;
            let weatherFeel24=result.data.list[8].main.feels_like;
            let weatherFeel48=result.data.list[16].main.feels_like;

            let weatherIconNow=result.data.list[0].weather[0].icon;
            let weatherIcon12=result.data.list[4].weather[0].icon;
            let weatherIcon24=result.data.list[8].weather[0].icon;
            let weatherIcon48=result.data.list[16].weather[0].icon;
          //using animated weather icons from https://basmilius.github.io/weather-icons/
             const weatherGrid = `
              <div class="weather-grid">
                <div class="weather-box">
                  <h4>Current Weather</h4>
                  <img src="./libs/weather-icons/production/fill/openweathermap/${weatherIconNow}.svg" alt="Weather Icon" class="weather-icon">
                  <p>Temperature:<br> ${weatherTempNow}°C</p>
                  <p>Feels like:<br> ${weatherFeelNow}°C</p>
                </div>
                <div class="weather-box">
                  <h4>In 12 Hours</h4>
                  <img src="./libs/weather-icons/production/fill/openweathermap/${weatherIcon12}.svg" alt="Weather Icon" class="weather-icon">
                  <p>Temperature:<br> ${weatherTemp12}°C</p>
                  <p>Feels like:<br> ${weatherFeel12}°C</p>
                </div>
                <div class="weather-box">
                  <h4>In 24 Hours</h4>
                  <img src="./libs/weather-icons/production/fill/openweathermap/${weatherIcon24}.svg" alt="Weather Icon" class="weather-icon">
                  <p>Temperature:<br> ${weatherTemp24}°C</p>
                  <p>Feels like:<br> ${weatherFeel24}°C</p>
                </div>
                <div class="weather-box">
                  <h4>In 48 Hours</h4>
                  <img src="./libs/weather-icons/production/fill/openweathermap/${weatherIcon48}.svg" alt="Weather Icon" class="weather-icon">
                  <p>Temperature:<br> ${weatherTemp48}°C</p>
                  <p>Feels like:<br> ${weatherFeel48}°C</p>
                </div>
              </div>
            `;
          //because this api also returns the closest town/area name registered to the weather station, I use this for the local area name as well as weather.
            document.getElementById('weatherResults').innerHTML = weatherGrid;
            if (result.data.city.name)  {
            $('#nearestCity').html('<h4>This area is called: <b>' + result.data.city.name + '</b></h4>');
            } else{
            $('#nearestCity').html("<h4>I'm not sure what this area is called, sorry</h4>");
            }




      }
    }})
    
 //POI API CALL
    $.ajax( {
      url: "libs/php/getPOIs.php",
      type: 'POST',
      dataType: 'json',
      data: {
        lat: lat, lng: lng
      },
      success: function(result) {
        
        if (result.status.name == 'ok') {
          if (result.data.length === 0) {
            $('#POIs').html('<h4>I can\'t find much to do around here, sorry!</h4>');
          }
          else {
            var $poisList = $('<ul>');
            $.each(result.data, function(index, poi) {
                var $poiItem = $('<li>');
                $poiItem.html('<b>' + poi.name + '</b>');
                console.log('POI NAME: ' + poi.name);
                var $poiDetails = $('<ul>').addClass('poi-details');
                $poiDetails.append($('<li>').text('Address: ' + poi.address));
                $poiDetails.append($('<li>').html('Website: <a href="' + poi.website + '">' + poi.website + '</a>'));
                $poiDetails.append($('<li>').text('Opening Hours: ' + poi.openingHours));
                
                $poiItem.append($poiDetails);
                $poisList.append($poiItem);
              //this code creates a smaller red marker on the map showing where the nearest POIs are. They are clickable to show their name
                var marker = L.marker([poi.lat, poi.lng], {
                  icon: L.icon({
                    iconUrl: '../project1/libs/weather-icons/mapPin.png',
                    className: 'POImarker',
                    iconSize: [20,20],
                    iconAnchor: [10,20],
                  })
                })
                
                .addTo(markerGroup);
                marker.bindPopup('<div class="popup-text">' + poi.name + '</div>');
                
            });
            
            $('#POIs').html('<h4>Here are some local points of interest:</h4>').append($poisList);
            
            // this allows POIs to be clickable inside the modal overlay to show further details from the API
            $('#POIs li').on('click', function() {
                $(this).find('.poi-details').toggleClass('expanded');
            });}
        }
    },
    
      error: function(xhr, status, error) {
        console.log("Error:", error);
      },
    
    
    });
  });

 
