// Client id and secret variables to make Foursquare api call
var CLIENT_ID = "3SJU4035GEAO5AZRNFZUQWRN2XMTBM5BVZAHBYHOFLHHDPGX";
var CLIENT_SECRET = "DF5HA2MSN4Z40LO2GJH0HV24Z2VEULR14MGI5HZKANEC1GLF"

// Global variable map
var map;
var locations_data = [];
var infowindow;

// Callback function to initalize map on the screen
initMap = function() {
    map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 40.7413549, lng: -73.9980243999996},
    zoom: 13,
    });
    infowindow = new google.maps.InfoWindow();
    createMarkers();
}

// Callback error function if maps api does not load
errorOnLoad = function() {
  window.alert("There was an error in loading maps. Please try again..!!")
}

// Method to get details of places near user entered location using foursquare api
httpGet = function(entered_loc)
{
  theUrl = 'https://api.foursquare.com/v2/venues/explore?near=' + entered_loc + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=20171224';
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
  xmlHttp.send( null );
  var data = JSON.parse(xmlHttp.responseText);
  locations_data = [];
  if(data["meta"]["code"] == 200){
    var base = data.response.groups[0].items;
    var len = base.length;

    for (var i=0; i<len; i++) {
      var loc_details = {};
      loc_details.title = base[i].venue.name;
      loc_details.location = {
        lat: base[i].venue.location.lat,
        lng: base[i].venue.location.lng
      };

      if(base[i].venue.categories.name) {
        loc_details.category = base[i].venue.categories.name;
      }
      if(base[i].venue.contact.phone) {
        loc_details.contact = base[i].venue.contact.phone;
      }
      if(base[i].venue.url) {
        loc_details.url = base[i].venue.url;
      }
      locations_data.push(loc_details);
    }
  }
  else {
    window.alert("Failed to retrive information for current location.Please try some other location..!!");
  }
}


var ViewModel = function() {

  var self = this;
  this.search_val = ko.observable("");
  this.entered_loc = ko.observable("NYC");
  this.locations_list = ko.observableArray([]);
  this.is_opt_shown = ko.observable(true);
  var markers = [];
  httpGet(self.entered_loc());
  locations_data.forEach(function(location) {
    self.locations_list.push(location);
  });


  // This method is called when user enters a location and hits search button
  this.showList = function() {
    self.search_val("");
    hideMarkers();
    markers=[];
    self.locations_list([]);
    httpGet(self.entered_loc());
    locations_data.forEach(function(location) {
        self.locations_list.push(location);
    });
    createMarkers();
  }


  // This updates the ko observable array and markers according to the filter value
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


  // This is invoked when user hits a location from list
  this.showInfo = function(location) {
    for(var i=0; i<markers.length; i++){
      if(location.title == markers[i].title){
        populateInfowindow(markers[i]);
        break;
      }
    }
  }

  // // When hamburger icon is clicked, the options bar toggles
  this.toggleOptions = function(){
    if(self.is_opt_shown()) {
      self.is_opt_shown(false);
      google.maps.event.trigger(map, 'resize');
    }
    else {
      self.is_opt_shown(true);
    }
  }


  // This function will loop through the markers array and display them all.
  showMarkers = function() {
    var bounds = new google.maps.LatLngBounds();
    var l = self.locations_list().length;
    if (l != 0) {
      var j = 0;
      for (var i=0; i<markers.length, j<l; i++) {
        if(self.locations_list()[j].title == markers[i].title) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
          j++;
        }
      }
      map.fitBounds(bounds);
    }
  }

  // This function will loop through the listings and hide them all.
  hideMarkers = function() {
    for(var i=0; i<markers.length; i++){
      markers[i].setMap(null);
    }
  }

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 22 px wide by 36 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  makeMarkerIcon = function(color){
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+color+'|40|_|%E2%80%A2',
        new google.maps.Size(22,36),
        new google.maps.Point(0,0),
        new google.maps.Point(10,34),
        new google.maps.Size(22,36));
    return markerImage;
  }

  // This function stops the bounce animation of marker after 700 milliseconds
  stopAnimation = function(marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 700);
  }

  // This function populates the infowindow with its street view and other details when the marker is clicked.
  populateInfowindow = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    stopAnimation(marker);

    if (infowindow.marker != marker){
      infowindow.setContent('');
      infowindow.marker = marker;

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });

      var content = "";
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      var details = marker.customInfo;
      if(details.category) {
        content = '<div>Category:' + details.category + '</div><br>';
      }
      if(details.contact) {
        content = content + '<div>Contact No.:' + details.contact + '</div><br>';
      }
      if(details.url) {
        content = content + '<div><a target="_blank "href="' + details.url + '">For more information, Click here!</a></div>';
      }

      function getStreetView(data, status) {
        if( status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLoc = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLoc, marker.position);
          infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>' + content);
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
          infowindow.setContent("<div>" + marker.title + "</div><div> No street view found </div>" + content);
        }
      }

      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      infowindow.open(map, marker);
    }
  }

  // The following function uses the locations_list array to create an array of markers on initialize.
  createMarkers = function() {
    var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    for(var i=0; i<self.locations_list().length; i++){
      var position = self.locations_list()[i].location;
      var title = self.locations_list()[i].title;

      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i,
        icon: defaultIcon
      });
      var customInfo = {};

      if (self.locations_list()[i].url){
        customInfo.url = self.locations_list()[i].url;
      }
      if (self.locations_list()[i].contact){
        customInfo.contact = self.locations_list()[i].contact;
      }
      if (self.locations_list()[i].category){
        customInfo.category = self.locations_list()[i].category;
      }

      marker.customInfo = customInfo;

      markers.push(marker);

      // Create an onclick event to open the infowindow at each marker.
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
  }

};

var viewmodel = new ViewModel();
viewmodel.search_val.subscribe(viewmodel.updateList);
ko.applyBindings(viewmodel);