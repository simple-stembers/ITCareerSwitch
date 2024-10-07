//importing the minimalist tyleset for the map

var map;

var countryBorders;

var minimal = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  });

// Get the modal overlay and content elements
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.querySelector('.modal-content');

// initial variables that will be used throughout. The long click variable is used to determine whether the user is scrolling the map or clicking it.
const closeButton = document.getElementById('close-modal');
let isModalOpen=false;
let isLongClick = false;
let clickInitial = 0;

document.addEventListener('pointerdown', (e) => {
  clickInitial = new Date().getTime();
});

document.addEventListener('pointerup', (e) => {
  
  const clickDuration = new Date().getTime() - clickInitial;

  if (clickDuration > 200) { // adjust this value to your liking
    isLongClick = true;
  } else {
    isLongClick = false;
  }
});






// This is the close button for the modal overlay
closeButton.addEventListener('click', () => {
 
  modalOverlay.classList.remove('show');
  console.log(modalOverlay.classList);
  // This is just a timeout to match the animation time of the fade out
  setTimeout(() => {
    modalOverlay.classList.remove('left-modal', 'right-modal');
    isModalOpen = false;
    console.log(modalOverlay.classList);
  }, 800);

  
  
});

  function openModalWithTab(tabId) {
    // Show the modal
    
    if (!isModalOpen) {
      
      modalOverlay.classList.add('right-modal');
      modalOverlay.classList.add('show');
      isModalOpen = true;
    };
    
    // Deactivate all tabs and tab content
    document.querySelectorAll('.nav-link').forEach(function(tab) {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(function(content) {
      content.classList.remove('active');
    });
  
    // Activate the specified tab and its content
    var tabLink = document.getElementById(tabId + '-tab');
    var tabContent = document.getElementById(tabId);
    if (tabLink && tabContent) {
      tabLink.classList.add('active');
      tabContent.classList.add('active', 'show');
    } else {
      console.error('Tab link or tab content element not found');
    }
  };
  
  
  


  var demoBtn = L.easyButton("fa-info fa-xl", function(btn, map) {
  openModalWithTab('demo');
});

var currencyBtn = L.easyButton("fa-coins fa-xl", function(btn, map) {
  openModalWithTab('currency');
});

var weatherBtn = L.easyButton("fa-sun fa-xl", function(btn, map) {
  openModalWithTab('weather');
});

var wikiBtn = L.easyButton("fa-book fa-xl", function(btn, map) {
  openModalWithTab('wiki');
});

var localBtn = L.easyButton("fa-map-marked-alt fa-xl", function(btn, map) {
  openModalWithTab('local');
});

var newsBtn = L.easyButton("fa-newspaper fa-xl", function(btn, map) {
  openModalWithTab('news');
});

  var basemaps = {
    "Minimal": minimal,
    "Satellite": satellite
  };
  
  map= L.map('map', {
    layers: [minimal]
    })
    .locate({setView: true, maxZoom: 6});

    layerControl = L.control.layers(basemaps).addTo(map);

     markerGroup = L.layerGroup().addTo(map);

     var maxBounds = L.latLngBounds(
      L.latLng(-90, -180),
      L.latLng(90, 180)
     );

     map.setMaxBounds(maxBounds);
     map.setMinZoom(3);
     

      demoBtn.addTo(map); 
      localBtn.addTo(map);
      newsBtn.addTo(map);
      weatherBtn.addTo(map);
      currencyBtn.addTo(map);
      wikiBtn.addTo(map);
     
  
      function addEventListeners(layer) {
        layer.on({
          mouseover: function() {
            layer.setStyle({
              weight: 2,
              color: 'lightgreen',
              opacity: 0.4,
              fillOpacity: 0.4,
              className: 'countryBorders'
            });
          },
          mouseout: function() {
            layer.setStyle({
              weight: 2,
              color: 'lightgreen',
              opacity: 0,
              fillOpacity: 0,
            });
          },
          mousedown: function() {
            clickInitial = new Date().getTime();
          },
          
        });
      }
      
      // Initial setup of the layers
      fetch('./libs/resources/countryBorders.geo.json')
        .then(response => response.json())
        .then(data => {
          var countryBorders = L.geoJSON(data, {
            style: {
              weight: 1,
              color: 'lightgreen',
              opacity: 0,
              fillOpacity: 0,
            },
            onEachFeature: function(feature, layer) {
              addEventListeners(layer);
            }
          }).addTo(map);

          
        });
      
      // Function to handle country selection from the dropdown
      function onCountrySelect() {
        var countrySelect = document.getElementById('countrySelect');
        var selectedCountry = countrySelect.options[countrySelect.selectedIndex].text;
        console.log('Selected country:', selectedCountry);
      
        // Reattach event listeners to all layers
        map.eachLayer(function(layer) {
          if (layer.feature && layer.feature.properties) {
            addEventListeners(layer);
          }
        });
      }
      
  //applying the GeoJSON border data to make interactable countries on the map
 
  let airportsData = [];
  let markers; // Variable to keep track of the marker cluster group
  
  // Fetch the JSON data
  fetch('libs/resources/airports.json')
    .then(response => response.json())
    .then(data => {
      airportsData = data;
      console.log('Airports data loaded:', airportsData);
  
      function showAirports() {
        if (markers) {
          // If markers are already displayed, remove them
          map.removeLayer(markers);
          markers = null;
        } else {
          // If markers are not displayed, create and add them
          
          var selectedCountry = selectedCountryName;
          var countryAirports = airportsData.filter(function(airport) {
            return airport.country.toLowerCase() === selectedCountry.toLowerCase();
          });
  
          markers = L.markerClusterGroup();
          console.log(countryAirports);
          console.log(selectedCountry);
          countryAirports.forEach(function(airport) {
            var marker = L.marker([airport.lat, airport.lon], {
              icon: L.icon({
                iconUrl: './libs/resources/airport.png',
                className: 'Airportmarker',
                iconSize: [30, 30],
                iconAnchor: [15, 20],
              })
            })
            .bindPopup(airport.name);
            markers.addLayer(marker);
          });
  
          map.addLayer(markers);
        }
      }
  
      // Create an easyButton and add it to the map
      var airportsBtn = L.easyButton("fa-plane fa-xl", function(btn, map) {
        showAirports();
      }).addTo(map);
  
      // Event listener for the dropdown menu
      document.getElementById('countrySelect').addEventListener('change', function(event) {
        var selectedCountry = event.target.value;
        console.log('Selected country:', selectedCountry);
      });
    })
    .catch(error => console.error('Error loading airports data:', error));