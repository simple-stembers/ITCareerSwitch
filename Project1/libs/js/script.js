var markerClusterGroup;
//this variable is used for the airport feature, and is updated with each click or dropdown menu event
var selectedCountryName;

function populateDropdown() {

  $.ajax({
    url: "libs/php/getBorderGeojson.php",
    type: 'GET',
    success: function(data) {
      let option = "";
      for (let country of data) {
        option += '<option value="' + country[1] + '">'+ country[0] +'</option>';
      }

      $("#countrySelect").append(option);
    }
  })
}

populateDropdown();


fetch('./libs/resources/countryBorders.geo.json')
  .then(response => response.json())
  .then(data => {
   
    // Get the select element
    const countrySelect = document.getElementById('countrySelect');

    // Loop through each feature in the geojson data
    const countryData = [];
    data.features.forEach(feature => {
      const countryName = feature.properties.name;
      const isoA2 = feature.properties.iso_a2;
      countryData.push({ name: countryName, isoA2: isoA2 });
    });
    
    // Alphabetize the countryData array
    countryData.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    

    // Second part: Create the options and add them to the select element
  

    countrySelect.addEventListener('change', () => {
      console.log('EVENT LISTENER ACTIVE');
      const selectedCountryCode = countrySelect.options[countrySelect.selectedIndex].value;
      const selectedCountry = countryData.find(country => country.isoA2 === selectedCountryCode);
      selectedCountry.name = selectedCountry.name.replace(/\s+/g, '_').replace(/\./g, '');
      
      

      //GET AIRPORT DATA
      selectedCountryName=selectedCountry.name;
      
      //NEWS API CALL
          

      $.ajax({
        type: 'POST',
        url: 'libs/php/getNews.php',
        dataType: 'json',
        data: { 
          countryCode: selectedCountryCode.toLowerCase() // Convert countryCode to lowercase
        },
        success: function(response) {
          const newsData = response.data;
          const newsDiv = document.getElementById('news');// replace with your actual data
          if (newsData.length === 0) {
            newsDiv.innerHTML = 'No news data found for the selected country, sorry!';
            console.log('No news data found for the selected country.');
            return;
          };
          // select the news div element
          
      
          // Clear any existing content in the news div
          newsDiv.innerHTML = '';
      
          // create a news grid container
          const newsGrid = document.createElement('div');
          newsGrid.classList.add('news-grid');
      
          // loop through the news data and create a grid item for each story
          newsData.forEach((story, index) => {
            const gridItem = document.createElement('div');
            gridItem.classList.add('news-item');
      
            const image = document.createElement('img');
            image.src = story.image_url;
            gridItem.appendChild(image);
      
            const content = document.createElement('div');
            content.classList.add('content');
      
            const title = document.createElement('h4');
            title.textContent = story.title;
            title.style.cursor = 'pointer';
            content.appendChild(title);
      
            const details = document.createElement('div');
            details.classList.add('details');
      
            const description = document.createElement('p');
            description.textContent = story.description;
            details.appendChild(description);
      
            const readMoreLink = document.createElement('a');
            readMoreLink.href = story.url;
            readMoreLink.textContent = 'Read more';
            details.appendChild(readMoreLink);
      
            const source = document.createElement('p');
            source.textContent = `Source: ${story.source}`;
            details.appendChild(source);
      
            content.appendChild(details);
            gridItem.appendChild(content);
            newsGrid.appendChild(gridItem);
      
            // Add click event to toggle details
            title.addEventListener('click', function() {
              gridItem.classList.toggle('active');
            });
          });
      
          // Append the news grid to the news div
          newsDiv.appendChild(newsGrid);
        },
        error: function(xhr, status, error) {
          console.error('Error fetching news:', error);
        }
      });
      //Reverse Geocode call to get lat/lng
      
      $.ajax({
        type: 'POST',
        url: 'libs/php/getOpenCage.php',
        dataType: 'json',
        data: { 
          country: selectedCountry.name,
          countryCode: selectedCountry.isoA2
        },
        

      success: function(response) {
       
        var currencySymbol = response.data.currencySymbol;
        var centerLat = response.data.centerLat;
        var centerLng = response.data.centerLng;
        var driveOn = response.data.driveOn;
        var timezone = response.data.timezone;
        

        map.flyTo([centerLat, centerLng], 7, { duration: 1 });

        var countryGeoJSON = data.features.filter(function(feature) {
          return feature.properties.iso_a2 === selectedCountry.isoA2;
        });

        map.eachLayer(function(layer) {
          if (layer.options && layer.options.highlighted) {
            map.removeLayer(layer);
          }
        });
    
        // Create the new selected country's layer
        var countryLayer = L.geoJSON(countryGeoJSON, {
          style: {
            weight: 2,
            color: 'lightblue',
            opacity: 0.4,
            fillOpacity: 0.4,
            className: 'countryBorders'
          }
        });
    
        // Add the new layer to the map
        countryLayer.addTo(map);
    
        // Mark this layer as the highlighted layer
        countryLayer.options.highlighted = true;

        $('#driveOn').html('<h4>Cars drive on the: <b>' + driveOn + '</b></h4>');
        $('#timeZone').html('<h4>Local time zone: <b>' + timezone + '</b></h4>');

        // Create a layer from the GeoJSON data
       
        
        $.ajax( {
          url: "libs/php/getCountry.php",
          type: 'POST',
          dataType: 'json',
          data: {
            lat: centerLat, lng: centerLng
          },
          success: function(result) {
            
            var countryCode2 = result.data.countryCode;
            var countryName2 = result.data.countryName;
  
  
            
  
            //COUNTRY FLAG CALL
            var flagImg =document.getElementById("countryFlag")
            
            flagImg.src = "https://flagcdn.com/" + countryCode2.toLowerCase() + ".svg";
            flagImg.alt = countryName2;
  
           
            if (result.status.name == 'ok') {
              if(result.data){
                  $('#countryName').html(countryName2);
              } else{
                  $('#countryName').html("No country found, sorry!");
              };
  
              //GEONAMES COUNTRY INFO API CALL
              $.ajax( {
                  url: "libs/php/getCountryInfo.php",
                  type: 'POST',
                  dataType: 'json',
                  data: {
                    country: countryCode2
                  },
                  success: function(result) {
                    
                    
                    if (result.status.name == 'ok') {
                      $('#capitalCity').html('<h4>The Capital City: <b>' + result.data.capital + '</b></h4>' );
  
                      $('#population').html('<h4>The Population: <b>'+ result.data.population + '</b></h4>');
                  }
  
                  //WIKIPEDIA API CALL
                  //using an iframe to allow for access to the full wiki page of the country within the modal overlay
  
                  document.getElementById('wiki').innerHTML = '<iframe class="wiki-iframe"src="https://en.wikipedia.org/wiki/' + countryName2 + '"></iframe>';
  
                  //LANGUAGE API CALL
  
                  var language = result.data.language.slice(0,2);
                  
  
                  $.ajax({
                    url: "libs/php/getHello.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      country: countryCode2
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
                 
                  $('#currencyDemo').html('<h4>The Local Currency: <b>'+ currencySymbol+ ' ' + currency + '</b></h4>');
  
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
                      function reexchangeMoney(awayMoney) {
                        return (awayMoney/result.data.local)*result.data.gbp;
                      }
                      $('#currency').html(
                        `<h4>The Local Currency: ${currency}<br>
                        Exchange your money: <br>
                        £<input type="float" id="homeMoney" value="1">
                        <b><span id="exchangeResult"></span></b><br>
                        ${currencySymbol} <input type="float" id="awayMoney" value="1">
                        <b><span id="reexchangeResult"></span></b></h4>`);
                       
                        $('#homeMoney').on('input', function() {
                         var homeMoney = parseFloat($(this).val());
                         var exchangeResult = (exchangeMoney(homeMoney, result.data.gbp)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                         //This line is what shows when I have reached my API credits for the month
                         
                         $('#exchangeResult').html(`=> ${currencySymbol} ${exchangeResult} ${currency}`);}
  
                        );

                        $('#awayMoney').on('input', function() {
                          var awayMoney = parseFloat($(this).val());
                          var reexchangeResult = (reexchangeMoney(awayMoney, result.data.gbp)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          //This line is what shows when I have reached my API credits for the month
                          
                          $('#reexchangeResult').html(`=> £ ${reexchangeResult} GBP`);}
   
                         );
                        
                        
  
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
          lat: centerLat, lng: centerLng
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
                    <img src="./libs/resources/weather-icons/production/fill/openweathermap/${weatherIconNow}.svg" alt="Weather Icon" class="weather-icon">
                    <p>Temperature:<br> ${weatherTempNow}°C</p>
                    <p>Feels like:<br> ${weatherFeelNow}°C</p>
                  </div>
                  <div class="weather-box">
                    <h4>In 12 Hours</h4>
                    <img src="./libs/resources/weather-icons/production/fill/openweathermap/${weatherIcon12}.svg" alt="Weather Icon" class="weather-icon">
                    <p>Temperature:<br> ${weatherTemp12}°C</p>
                    <p>Feels like:<br> ${weatherFeel12}°C</p>
                  </div>
                  <div class="weather-box">
                    <h4>In 24 Hours</h4>
                    <img src="./libs/resources/weather-icons/production/fill/openweathermap/${weatherIcon24}.svg" alt="Weather Icon" class="weather-icon">
                    <p>Temperature:<br> ${weatherTemp24}°C</p>
                    <p>Feels like:<br> ${weatherFeel24}°C</p>
                  </div>
                  <div class="weather-box">
                    <h4>In 48 Hours</h4>
                    <img src="./libs/resources/weather-icons/production/fill/openweathermap/${weatherIcon48}.svg" alt="Weather Icon" class="weather-icon">
                    <p>Temperature:<br> ${weatherTemp48}°C</p>
                    <p>Feels like:<br> ${weatherFeel48}°C</p>
                  </div>
                </div>
              `;
            //because this api also returns the closest town/area name registered to the weather station, I use this for the local area name as well as weather.
              document.getElementById('weather').innerHTML = weatherGrid;
              if (result.data.city.name)  {
              $('#nearestCity').html('<h4>This area is called: <b>' + result.data.city.name + '</b></h4>');
              } else{
              $('#nearestCity').html("<h4>I'm not sure what this area is called, sorry</h4>");
              }
  
  
  
  
        }
      }})
      
   
      
      
        
    },

      },

          
        )
      });




map.on('click', function(e) {
   //clear previous markers      
    markerGroup.clearLayers();
   
    // getting the latitude and longitude of the clicked point
   var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    var marker = L.marker([lat,lng]).addTo(markerGroup);
    console.log('Clicked at: ' + lat + ', ' + lng);
    map.flyTo([lat, lng], 7, { duration: 1 });
    
    
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
          selectedCountryName=countryName;
          var countryGeoJSON = data.features.filter(function(feature) {
            return feature.properties.iso_a2 === countryCode;
          });
          
          

          map.eachLayer(function(layer) {
            if (layer.options && layer.options.highlighted) {
              map.removeLayer(layer);
            }
          });
      
          // Create the new selected country's layer
          var countryLayer = L.geoJSON(countryGeoJSON, {
            style: {
              weight: 2,
              color: 'lightblue',
              opacity: 0.4,
              fillOpacity: 0.4,
              className: 'countryBorders'
            }
          });
      
          // Add the new layer to the map
          countryLayer.addTo(map);
      
          // Mark this layer as the highlighted layer
          countryLayer.options.highlighted = true;

          $.ajax({
            type: 'POST',
            url: 'libs/php/getNews.php',
            dataType: 'json',
            data: { 
              countryCode: countryCode.toLowerCase() // Convert countryCode to lowercase
            },
            success: function(response) {
              const newsData = response.data; 
              const newsDiv = document.getElementById('news');// replace with your actual data
              if (newsData.length === 0) {
                newsDiv.innerHTML = 'No news data found for the selected country, sorry!';
                return;
              };
              // select the news div element
              
          
              // Clear any existing content in the news div
              newsDiv.innerHTML = '';
          
              // create a news grid container
              const newsGrid = document.createElement('div');
              newsGrid.classList.add('news-grid');
          
              // loop through the news data and create a grid item for each story
              newsData.forEach((story, index) => {
                const gridItem = document.createElement('div');
                gridItem.classList.add('news-item');
          
                const image = document.createElement('img');
                image.src = story.image_url;
                gridItem.appendChild(image);
          
                const content = document.createElement('div');
                content.classList.add('content');
          
                const title = document.createElement('h4');
                title.textContent = story.title;
                title.style.cursor = 'pointer';
                content.appendChild(title);
          
                const details = document.createElement('div');
                details.classList.add('details');
          
                const description = document.createElement('p');
                description.textContent = story.description;
                details.appendChild(description);
          
                const readMoreLink = document.createElement('a');
                readMoreLink.href = story.url;
                readMoreLink.textContent = 'Read more';
                details.appendChild(readMoreLink);
          
                const source = document.createElement('p');
                source.textContent = `Source: ${story.source}`;
                details.appendChild(source);
          
                content.appendChild(details);
                gridItem.appendChild(content);
                newsGrid.appendChild(gridItem);
          
                // Add click event to toggle details
                title.addEventListener('click', function() {
                  gridItem.classList.toggle('active');
                });
              });
          
              // Append the news grid to the news div
              newsDiv.appendChild(newsGrid);
            },
            error: function(xhr, status, error) {
              console.error('Error fetching news:', error);
            }
          });

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

                document.getElementById('wiki').innerHTML = '<iframe class="wiki-iframe"src="https://en.wikipedia.org/wiki/' + countryName + '"></iframe>';

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
                $.ajax({
                  type: 'POST',
                  url: 'libs/php/getOpenCageClick.php',
                  dataType: 'json',
                  data: { 
                    lat: lat,
                    lng: lng
                  },
                  
          
                success: function(response) {
                 
                  var currencySymbol = response.data.currencySymbol;
                  var driveOn = response.data.driveOn;
                  var timezone = response.data.timezone;
                   var currency = result.data.currencyCode;

                   $('#driveOn').html('<h4>Cars drive on the: <b>' + driveOn + '</b></h4>');
                   $('#timeZone').html('<h4>Local time zone: <b>' + timezone + '</b></h4>');
                   
                  $('#currencyDemo').html('<h4>The Local Currency: <b>'+ currencySymbol+ ' ' + currency + '</b></h4>');

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
                    function reexchangeMoney(awayMoney) {
                      return (awayMoney/result.data.local)*result.data.gbp;
                    }
                    $('#currency').html(
                      `<h4>The Local Currency: ${currency}<br>
                      Exchange your money: <br>
                      £<input type="float" id="homeMoney" value="1">
                      <b><span id="exchangeResult"></span></b><br>
                      ${currencySymbol} <input type="float" id="awayMoney" value="1">
                      <b><span id="reexchangeResult"></span></b></h4>`);
                     
                      $('#homeMoney').on('input', function() {
                       var homeMoney = parseFloat($(this).val());
                       var exchangeResult = (exchangeMoney(homeMoney, result.data.gbp)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                       //This line is what shows when I have reached my API credits for the month
                       
                       $('#exchangeResult').html(`=> ${currencySymbol} ${exchangeResult} ${currency}`);}

                      );

                      $('#awayMoney').on('input', function() {
                        var awayMoney = parseFloat($(this).val());
                        var reexchangeResult = (reexchangeMoney(awayMoney, result.data.gbp)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        //This line is what shows when I have reached my API credits for the month
                        
                        $('#reexchangeResult').html(`=> £ ${reexchangeResult} GBP`);}
 
                       );
                      
                      

                  },
                  error: function(xhr, status, error) {
                    console.log("MoneyError: " + error);
                }
          })}});}});










        
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
                  <img src="./libs/resources/weather-icons/production/fill/openweathermap/${weatherIconNow}.svg" alt="Weather Icon" class="weather-icon">
                  <p>Temperature:<br> ${weatherTempNow}°C</p>
                  <p>Feels like:<br> ${weatherFeelNow}°C</p>
                </div>
                <div class="weather-box">
                  <h4>In 12 Hours</h4>
                  <img src="./libs/resources/weather-icons/production/fill/openweathermap/${weatherIcon12}.svg" alt="Weather Icon" class="weather-icon">
                  <p>Temperature:<br> ${weatherTemp12}°C</p>
                  <p>Feels like:<br> ${weatherFeel12}°C</p>
                </div>
                <div class="weather-box">
                  <h4>In 24 Hours</h4>
                  <img src="./libs/resources/weather-icons/production/fill/openweathermap/${weatherIcon24}.svg" alt="Weather Icon" class="weather-icon">
                  <p>Temperature:<br> ${weatherTemp24}°C</p>
                  <p>Feels like:<br> ${weatherFeel24}°C</p>
                </div>
                <div class="weather-box">
                  <h4>In 48 Hours</h4>
                  <img src="./libs/resources/weather-icons/production/fill/openweathermap/${weatherIcon48}.svg" alt="Weather Icon" class="weather-icon">
                  <p>Temperature:<br> ${weatherTemp48}°C</p>
                  <p>Feels like:<br> ${weatherFeel48}°C</p>
                </div>
              </div>
            `;
          //because this api also returns the closest town/area name registered to the weather station, I use this for the local area name as well as weather.
            document.getElementById('weather').innerHTML = weatherGrid;
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
          $('#POIs').empty();
          if (result.data.length === 0) {
            $('#POIs').html('<h4>I can\'t find much to do around here, sorry!</h4>');
          }
          else {
            var $poisList = $('<ul>');
            if (markerClusterGroup) {
              map.removeLayer(markerClusterGroup);
            }
            markerClusterGroup = L.markerClusterGroup();

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
                    iconUrl: './libs/resources/mapPin.png',
                    className: 'POImarker',
                    iconSize: [20,20],
                    iconAnchor: [10,20],
                  })
                });
                
                
                marker.bindPopup('<div class="popup-text">' + poi.name + '</div>');
                markerClusterGroup.addLayer(marker);
            });
            markerClusterGroup.addTo(map);
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

 

  });
