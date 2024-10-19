//---------------------------------------
//GLOBAL DECLARATIONS
//---------------------------------------
var map;

const countrySelect = document.getElementById('countrySelect');

//list of variables used in functions to allow global scope
var selectedCountryName;
var selectedCountryCode;
var selectedCountryCapital;
var selectedCountryCurrency;
var countryArea;
var countryPopulation;
var timezone;
var driveOn;
var currencySymbol;
var currencyCode;
var currencyName;
var continent;
var exchangeRate;
var newsData;
var language;
var lat;
var lng;


//tile layers
var minimal = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  });

var basemaps = {
    "Minimal": minimal,
    "Satellite": satellite
};

var airports = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  });
  
  var cities = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  });

  var mountains = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  });
  
  var overlays = {
    Airports: airports,
    Cities: cities,
    Mountains: mountains
  };
  
  // icons
  
  var airportIcon = L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-plane",
    iconColor: "black",
    markerColor: "white",
    shape: "square"
  });
  
  var cityIcon = L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-city",
    iconColor: "white",
    markerColor: "green",
    shape: "square"
  });

  var mountainIcon = L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-mountain",
    iconColor: "black",
    markerColor: "orange",
    shape: "square"
  });

//buttons
  var demoBtn = L.easyButton("fa-info fa-xl", function(btn, map) {
    $('#demoModal').modal('show');
  });
  
  var currencyBtn = L.easyButton("fa-coins fa-xl", function(btn, map) {
    $('#currencyModal').modal('show');
  });
  
  var weatherBtn = L.easyButton("fa-sun fa-xl", function(btn, map) {
    $('#weatherModal').modal('show');
  });
  
  var wikiBtn = L.easyButton("fa-book fa-xl", function(btn, map) {
    $('#wikiModal').modal('show');;
  });
  
  var newsBtn = L.easyButton("fa-newspaper fa-xl", function(btn, map) {
    $('#newsModal').modal('show');
  });

//---------------------------------------
//EVENT HANDLERS
//---------------------------------------
//initial functions
$(document).ready(function(){

    map= L.map('map', {
        layers: [minimal]
        })
        .locate({setView: true, maxZoom: 6});
    
        layerControl = L.control.layers(basemaps, overlays).addTo(map);
    
         markerGroup = L.layerGroup().addTo(map);
    
         var maxBounds = L.latLngBounds(
          L.latLng(-90, -180),
          L.latLng(90, 180)
         );
    
         map.setMaxBounds(maxBounds);
         map.setMinZoom(3);
         
    
          demoBtn.addTo(map); 
          newsBtn.addTo(map);
          weatherBtn.addTo(map);
          currencyBtn.addTo(map);
          wikiBtn.addTo(map);


          populateDropdown();

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    
                    getInitialCountryCodes(lat, lng);
                },
                function(error) {
                    
                    // If permission is denied or there's an error, use default location (London)
                    lat = 51.5074;
                    lng = -0.1278;
                    getInitialCountryCodes(lat, lng);
                }
            );
        } else {
            // If geolocation is not supported, use default location (London)
          
            lat = 51.5074;
            lng = -0.1278;
            getInitialCountryCodes(lat, lng);
        }

       $('#loader').fadeOut();  
        
});

//when something new is selected from the dropdown menu
$('#countrySelect').on('change', function() {
    var selectedOption = $(this).find('option:selected');
    selectedCountryCode = selectedOption.val();
    selectedCountryName = selectedOption.text();

    
    getBorder();
    getChangeCountryCodes();
    getCountryInfo();
    getCities();
    getMountains();
    getAirports();
   
});


//demographics modal
$('#demoModal').on('show.bs.modal', function() {

    getChangeCountryCodes();
    getCountryInfo();

})

//currency modal
$('#currencyModal').on('show.bs.modal', function() {

    getCurrency();

    $('#localCurrency').html(currencyName);
    $('label[for="toAmount"]').html(currencySymbol + ' ' + currencyCode)

});

$('#fromAmount').on('keyup', function() {
    fromAmountValue= parseFloat($('#fromAmount').val());
    $('#toAmount').val(numeral(exchangeMoney(fromAmountValue)).format('0.00'));
});

$('#fromAmount').on('change', function() {
    fromAmountValue= parseFloat($('#fromAmount').val());
    $('#toAmount').val(numeral(exchangeMoney(fromAmountValue)).format('0.00'));
});

$('#toAmount').on('keyup', function() {
    toAmountValue= parseFloat($('#toAmount').val());
    $('#fromAmount').val(numeral(reexchangeMoney(toAmountValue)).format('0.00'));
});

$('#toAmount').on('change', function() {
    toAmountValue= parseFloat($('#toAmount').val());
    $('#fromAmount').val(numeral(reexchangeMoney(toAmountValue)).format('0.00'));
});

//weather modal

$('#weatherModal').on('show.bs.modal', function() {

    getWeather();
});

$('#weatherModal').on('hidden.bs.modal', function() {
  
  $("#pre-load-weather").removeClass("fadeOut");
})

//news modal

$('#newsModal').on('show.bs.modal', function() {

    getNews();
})

$('#newsModal').on('hidden.bs.modal', function() {


    $("#noNews").hide();

    $("#news1Img").attr("src", "");
    $("#news1Article").attr("href", "");
    $("#news1Article").text("");
    $("#news1Source").text("");

    $("#news2Img").attr("src", "");
    $("#news2Article").attr("href", "");
    $("#news2Article").text("");
    $("#news2Source").text("");

    $("#news3Img").attr("src", "");
    $("#news3Article").attr("href", "");
    $("#news3Article").text("");
    $("#news3Source").text("");
   
    
    $("#pre-load-news").removeClass("fadeOut");

});

//wiki modal

$('#wikiModal').on('show.bs.modal', function() {

    getWiki();
});

$('#wikiModal').on('hidden.bs.modal', function() {

    $("#pre-load-wiki").removeClass("fadeOut");
    $("#wikiFrame").attr("src", "");
});


//---------------------------------------
//FUNCTIONS
//---------------------------------------  
function populateDropdown() {

    $.ajax({
      url: "libs/php/getCountriesGeojson.php",
      type: 'GET',
      success: function(data) {
        let option = "";
        for (let country of data) {
          option += '<option value="' + country[1] + '">'+ country[0] +'</option>';
        }
  
        $("#countrySelect").append(option);
      }
    })
  };

function getAirports() {
    $.ajax({
        url: "libs/php/getFeatures.php",
        type: "POST",
        dataType: "json",
        data: {
            q: "airport",  
          iso: selectedCountryCode
        },
        success: function (result) {
          
            result.data.forEach(function (item) {
              L.marker([item.lat, item.lng], { icon: airportIcon })
                .bindTooltip(item.name, { direction: "top", sticky: true })
                .addTo(airports);
            });
          } 
        
       
      });
};

function getCities() {

    $.ajax({
        url: "libs/php/getCities.php",
        type: "POST",
        dataType: "json",
        data: {
        iso: selectedCountryCode
        },
        success: function (result) {
        
            result.data.forEach(function (item) {
            L.marker([item.lat, item.lng], { icon: cityIcon })
                .bindTooltip(item.name, { direction: "top", sticky: true })
                .addTo(cities);
            });
          }
    });
}
      


function getMountains() {
    $.ajax({
        url: "libs/php/getFeatures.php",
        type: "POST",
        dataType: "json",
        data: {
            q: 'mountain',
          iso: selectedCountryCode
        },
        success: function (result) {
         
            result.data.forEach(function (item) {
              L.marker([item.lat, item.lng], { icon: mountainIcon })
                .bindTooltip(item.name, { direction: "top", sticky: true })
                .addTo(mountains);
            });
          
        }
      });
};

function getWeather()   {
    $.ajax( {
        url: "libs/php/getWeatherInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
          city : selectedCountryCapital
        },
        success: function(result) {
            var resultCode = result.status.code

            if (resultCode == 200) {
              
              var d = result.data;
              
              $('#weatherModalLabel').html(selectedCountryCapital + ", " + selectedCountryName);
              
              $('#todayConditions').html(d.current.conditions);
                $('#todayIcon').attr("src", "./libs/resources/weather-icons/" + d.current.condition_code + '.svg');
                $('#todayTemp').html(Math.round(d.current.maxtemp)); // Round to nearest whole number
                $('#feelsLike').html("Feels Like: " + Math.round(d.current.feelslike)); // Round to nearest whole number
                $('#todayChanceOfRain').html(d.current.chance_of_rain);

                var options = { weekday: 'short', day: 'numeric' };
                var updateOptions = {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false 
                };
                var day1Date = new Date(d.forecast[1].date);
                var day2Date = new Date(d.forecast[2].date);
                var lastUpdated = new Date(d.lastUpdate);

                $('#day1Date').text(new Intl.DateTimeFormat('en-US', options).format(day1Date));
                $('#day1Icon').attr("src", "./libs/resources/weather-icons/" + d.forecast[1].condition_code + '.svg');
                $('#day1MinTemp').text(Math.round(d.forecast[1].mintemp)); // Round to nearest whole number
                $('#day1MaxTemp').text(Math.round(d.forecast[1].maxtemp)); // Round to nearest whole number
                $('#day1chanceOfRain').text(d.forecast[1].chance_of_rain);

                $('#day2Date').text(new Intl.DateTimeFormat('en-US', options).format(day2Date));
                $('#day2Icon').attr("src", "./libs/resources/weather-icons/" + d.forecast[2].condition_code + '.svg');
                $('#day2MinTemp').text(Math.round(d.forecast[2].mintemp)); // Round to nearest whole number
                $('#day2MaxTemp').text(Math.round(d.forecast[2].maxtemp)); // Round to nearest whole number
                $('#day2chanceOfRain').text(d.forecast[2].chance_of_rain);

              
              $('#lastUpdated').text(new Intl.DateTimeFormat('en-GB', updateOptions).format(lastUpdated));
              
              $('#pre-load-weather').addClass("fadeOut");
              
            } else {
      
              $('#weatherModal .modal-title').replaceWith("Error retrieving data");
      
            } 
      
          },
        
      });
};


function getCurrency()  {
    $.ajax( {
        url: "libs/php/getCurrencyInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
          currency: currencyCode.toUpperCase()
        },
        success: function(result) {
         


         exchangeRate = result.data.local / result.data.gbp;
          
         
        }

      });

};

function exchangeMoney(homeMoney) {
    

    return homeMoney*exchangeRate;
    
    
}

function reexchangeMoney(awayMoney)  {

    return awayMoney/exchangeRate;
}

function getNews()  {
    $.ajax({
        type: 'POST',
        url: 'libs/php/getNews.php',
        dataType: 'json',
        data: { 
          countryCode: selectedCountryCode.toLowerCase() // Convert countryCode to lowercase
        },
        success: function(response) {
          newsData = response.data;

          if (newsData.length === 0) {
            
            $("#noNews").show();
            $("#pre-load-news").addClass("fadeOut");
          }
          else {
            $("#noNews").hide();
          $("#news1Img").attr("src", newsData[0].image_url);
          $("#news1Article").attr("href", newsData[0].url);
          $("#news1Article").text(newsData[0].title);
          $("#news1Source").text(newsData[0].source);

          $("#news2Img").attr("src", newsData[1].image_url);
          $("#news2Article").attr("href", newsData[1].url);
          $("#news2Article").text(newsData[1].title);
          $("#news2Source").text(newsData[1].source);

          $("#news3Img").attr("src", newsData[2].image_url);
          $("#news3Article").attr("href", newsData[2].url);
          $("#news3Article").text(newsData[2].title);
          $("#news3Source").text(newsData[2].source);
         
          
          $("#pre-load-news").addClass("fadeOut");
           
          
          }
        },
        error: function(xhr, status, error) {
          console.error('Error fetching news:', error);
        }
      });
};


function getInitialCountryCodes(lat, lng) {
    $.ajax({
        type: 'POST',
        url: 'libs/php/getOpenCageClick.php',
        dataType: 'json',
        data: { 
          lat: lat,
          lng: lng
        },
        

      success: function(response) {

       

        selectedCountryName = response.data.countryName;
        selectedCountryCode= response.data.countryCode;
        currencyCode = response.data.currencyCode;
        currencyName = response.data.currencyName;
        currencySymbol = response.data.currencySymbol;
        driveOn = response.data.driveOn;
        timezone = response.data.timezone;
        continent = response.data.continent;

        
       
        
        
        $('#countrySelect').val(selectedCountryCode).change();
      },

    });      
};

function getChangeCountryCodes() {
    $.ajax({
        type: 'POST',
        url: 'libs/php/getOpenCage.php',
        dataType: 'json',
        data: { 
          country: selectedCountryCode
        },
        

      success: function(response) {

        currencyCode = response.data.currencyCode;
        currencyName = response.data.currencyName;
        currencySymbol = response.data.currencySymbol;
        driveOn = response.data.driveOn;
        timezone = response.data.timezone;
        continent = response.data.continent;

        $('#currency').html(currencyName + " (" + currencySymbol + currencyCode +")");
        $('#driveOn').html(driveOn.charAt(0).toUpperCase() + driveOn.slice(1));
        $('#timezone').html(timezone);
        $('#continent').html(continent);
      },

    });      
};

function getBorder() {
    $.ajax({
        type: 'POST',
        url: 'libs/php/getBordersGeojson.php',
        dataType: 'json',
        data: { 
          countryCode: selectedCountryCode
        },

        success: function(result) {

            countryGeoJSON = result.data;

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

              map.flyToBounds(countryLayer.getBounds(),{
                duration: 1.5,
                easeLinearity: 0.5
              });
            }
    });
};

function getCountryInfo()   {
    $.ajax({
        type: 'POST',
        url: 'libs/php/getCountryInfo.php',
        dataType: 'json',
        data: { 
          country: selectedCountryCode
        },
        success: function(result) {

            selectedCountryCapital = result.data.capital;
            countryPopulation = result.data.population;
            countryArea = result.data.area;
            language = result.data.language;
            
            $('#capitalCity').html(selectedCountryCapital);
            $('#population').html(numeral(countryPopulation).format('0,0'));
            $('#countryArea').html(numeral(countryArea).format('0,0'));
            $('#languages').html(language);
        }

    });
};

function getWiki()   {
  $('#wikiFrame').attr("src", "https://en.wikipedia.org/wiki/" + encodeURIComponent(selectedCountryName));
  $('#pre-load-wiki').addClass("fadeOut");
}