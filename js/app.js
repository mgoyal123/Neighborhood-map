var locations_data = [
  {title: 'Mill Creek Park', location: {lat: 41.098927, lng: -80.676628}},
  {title: 'Edisto Beach state Park', location: {lat: 32.510651, lng: -80.286995}},
  {title: 'Jacobson Park', location: {lat: 37.987938, lng: -84.419792}},
  {title: 'Spring city Park', location: {lat: 35.688900, lng: -84.853401}},
  {title: 'Jungle Hut Road Park', location: {lat: 29.584776, lng: -81.177689}},
  {title: 'Anastasia state Park', location: {lat: 29.875853, lng: -81.280891}},
  {title: 'Juno Beach Park', location: {lat: 26.893070, lng: -80.058220}},
  {title: 'Seward Park', location: {lat: 47.550259, lng: -122.264847}},
  {title: 'Northacres Park', location: {lat: 47.721790, lng: -122.327209}},
  {title: 'Myrtle Edwards Park', location: {lat: 47.620598, lng: -122.361816}},
  {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
  {title: 'Empire state Building, NYC', location: {lat: 40.748817, lng: -73.985428}},
  {title: 'Bank of America Tower', location: {lat: 40.755604, lng: -73.984932}},
  // {title: 'Federation Tower', location: {lat: 55.749695, lng: 37.537540}},
  // {title: 'World Trade center', location: {lat: 24.487249, lng: 54.357464}},
  // {title: 'Citic Plaza', location: {lat: 23.142359, lng: 113.324768}},
  {title: 'Santa Monica Pier A', location: {lat: 34.010090, lng: -118.496948}},
  {title: 'Trump International Hotel and Tower', location: {lat: 41.888866, lng: -87.626396}},
  {title: 'Willis Tower', location: {lat: 41.878876, lng: -87.635918}},
  {title: 'One World Trade center', location: {lat: 40.712742, lng: -74.013382}},
  {title: 'Naval Observatory Flag staff', location: {lat: 35.184017, lng: -111.740417}},
  {title: 'Botanical Reasearch Institute of Texas', location: {lat: 32.742027, lng: -97.362564}},
  {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
  {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
  {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
  {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
  {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

var ViewModel = function() {

  var self = this;
  this.search_val = ko.observable("");
  this.locations_list = ko.observableArray(locations_data);

  var map;
  var markers = [];
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 40.7413549, lng: -73.9980243999996},
    zoom: 16,
    mapTypeControl: false
    });

  var infowindow = new google.maps.InfoWindow();

  var bounds = new google.maps.LatLngBounds();

  this.toggleOptions = function(){

    if($('#options-box').is(":hidden")) {
      $('#options-box').show();
      $('.heading').css('left','30%');
      $('#map').css('left', '30%');
    }
    else {
      $('#options-box').hide();
      $('.heading').css('left','0%');
      $('#map').css('left', '0').css('width', '100%');
      google.maps.event.trigger(map, 'resize');
    }
  }

  showMarkers = function() {
    if (self.locations_list().length != 0){
      var j = 0;
      for (var i=0; i<markers.length; i++){
        if(self.locations_list()[j].title == markers[i].title){
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
          j++;
        }
      }
      map.fitBounds(bounds);
    }
  }

  hideMarkers = function() {
    for(var i=0; i<markers.length; i++){
      markers[i].setMap(null);
    }
  }

  makeMarkerIcon = function(color){
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+color+'|40|_|%E2%80%A2',
        new google.maps.Size(22,36),
        new google.maps.Point(0,0),
        new google.maps.Point(10,34),
        new google.maps.Size(22,36));
    return markerImage;
  }

  stopAnimation = function(marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 700);
  }

  populateInfowindow = function(marker) {
    // console.log(marker);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    stopAnimation(marker);

    if (infowindow.marker != marker){
      infowindow.setContent('');
      infowindow.marker = marker;

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      function getStreetView(data, status) {
        if( status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLoc = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLoc, marker.position);
          infowindow.setContent("<div>" + marker.title + "</div><div id='pano'></div>");
          var panoramaOptions = {
            position: nearStreetViewLoc,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
          var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
        }
        else{
          infowindow.setContent("<div>" + marker.title + "</div><div> No street view found </div>");
        }
      }

      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

      infowindow.open(map, marker);
    }
  };

  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FFFF24');

  for(var i=0; i<self.locations_list().length; i++){
    var position = self.locations_list()[i].location;
    // console.log(position);
    var title = self.locations_list()[i].title;
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
      icon: defaultIcon
    });
    markers.push(marker);
    // console.log(marker.title);
    // console.log(markers[i].position);
    marker.addListener('click', function() {
      populateInfowindow(this);
    });

    marker.addListener('mouseover', function(){
      this.setIcon(highlightedIcon);
    });

    marker.addListener('mouseout', function(){
      this.setIcon(defaultIcon);
    });
  }
  showMarkers();

  this.updateList = function() {
    hideMarkers();
    value = self.search_val().toLowerCase();
    self.locations_list([]);

    locations_data.forEach(function(location) {
      title = location.title.toLowerCase();
      if (title.includes(value)){
        self.locations_list.push(location);
      }
    });
    showMarkers();
  }

  this.showInfo = function(location) {
    for(var i=0; i<markers.length; i++){
      console.log(markers[i].title);
      if(location.title == markers[i].title){
        populateInfowindow(markers[i]);
        break;
      }
    }
  }


};


ko.applyBindings(new ViewModel());