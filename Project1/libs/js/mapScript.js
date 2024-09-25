//importing the minimalist tyleset for the map
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  
  //applying the GeoJSON border data to make interactable countries on the map
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
      //this mouseover feature causes the country to be highlighted, and then the mouseout dehighlights the country  
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
        //this function registers the click with the map script, despite the GeoJSON being clicked. It also causes the zoom to the clicked area with the flyTo map function
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

        

        
      });
    }
  
 }).addTo(map);
})
