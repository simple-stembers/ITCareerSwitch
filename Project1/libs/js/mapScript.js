L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  
  fetch('countryBorders.geo.json')
  .then(response => response.json())
  .then(data => {
  var countryBorders = L.geoJSON(data, {
    style:{
      weight: 1,
      color: 'lightgreen',
      opacity: 0,
      fillOpacity: 0,
    },
    onEachFeature: function(feature, layer) {
     var clickInitial;
        
      layer.on({
        mouseover: function() {
          layer
         .setStyle({
           weight: 2,
           color: 'lightgreen',
           opacity: 0.4,
           fillOpacity: 0.4,
           className: 'countryBorders'
         });
        
       },
        mouseout: function() {
        layer
        .setStyle({
            weight: 2,
            color: 'lightgreen',
            opacity: 0,
            fillOpacity: 0,
            
         });
         
        },
        mousedown: function() {
          clickInitial= new Date().getTime();
        },
        mouseup: function(e) {
            var clickDuration = new Date().getTime() - clickInitial; 
            if (clickDuration < 200)  {
            var mapElement = document.getElementById('map');
            var event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
             view: window,
            target: mapElement,
            clientX: e.clientX
             });
             mapElement.dispatchEvent(event);
             var latlng = map.mouseEventToLatLng(e.originalEvent);
           // Zoom to the clicked coordinates
           map.flyTo(latlng, 9, { duration: 1 });

           var clickEvent = new CustomEvent('mapClick', { detail: e.clientX });
          document.dispatchEvent(clickEvent);
        }},

        touchstart: function(e) {
          clickInitial = new Date().getTime();
        },
        touchend: function(e) {
          var clickDuration = new Date().getTime() - clickInitial;
          if (clickDuration < 200) {
            var mapElement = document.getElementById('map');
            var event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
              target: mapElement,
              clientX: e.touches[0].clientX
            });
            mapElement.dispatchEvent(event);
            var latlng = map.mouseEventToLatLng(e);
            // Zoom to the clicked coordinates
            map.flyTo(latlng, 9, { duration: 1 });
        
            var clickEvent = new CustomEvent('mapClick', { detail: e.touches[0].clientX });
            document.dispatchEvent(clickEvent);
          }
        }
      });
    }
  
 }).addTo(map);
})
