var CLIENT_ID = "3SJU4035GEAO5AZRNFZUQWRN2XMTBM5BVZAHBYHOFLHHDPGX";
var CLIENT_SECRET = "DF5HA2MSN4Z40LO2GJH0HV24Z2VEULR14MGI5HZKANEC1GLF"

var locations_data = [
  {title: 'Statue of Liberty', location: {lat: 40.689249, lng: -74.044500}},
  {title: 'Central Park', location: {lat: 40.782865, lng: -73.965355}},
  {title: 'Rockefeller Center and Top of the Rock Observation Deck', location: {lat: 40.759243, lng: -73.979294}},
  {title: 'Metropolitan Museum of Art', location: {lat: 40.779437, lng: -73.963244}},
  {title: 'Broadway and the Theater District', location: {lat: 40.758709, lng: -73.985367}},
  {title: '9/11 Memorial and Museum', location: {lat: 40.711484, lng: -74.012725}},
  {title: 'High Line', location: {lat: 40.747993,lng: -74.004765}},
  {title: 'Times Square', location: {lat: 40.758895, lng: -73.985131}},
  {title: 'Brooklyn Bridge', location: {lat: 40.706086, lng: -73.996864}},
  {title: 'Friends Apartment', location: {lat: 40.732398, lng: -74.005317}},
  {title: 'Fifth Avenue', location: {lat: 40.731412, lng: -73.996985}},
  {title: 'Empire state Building, NYC', location: {lat: 40.748817, lng: -73.985428}},
  {title: 'Bank of America Tower', location: {lat: 40.755604, lng: -73.984932}},
  {title: 'One World Trade center', location: {lat: 40.712742, lng: -74.013382}},
  {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
  {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
  {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
  {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
  {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}},
  {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}}
];


var map;
var infowindow;
var bounds;

initMap = function() {
    map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 40.7413549, lng: -73.9980243999996},
    zoom: 16,
    mapTypeControl: false
    });
    infowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    createMarkers();

}


errorOnLoad = function() {
  window.alert("There was an error in loading maps. Please try again..!!")
}


var ViewModel = function() {

  var self = this;
  this.search_val = ko.observable("");
  this.locations_list = ko.observableArray(locations_data);
  var markers = [];


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
      if(location.title == markers[i].title){
        populateInfowindow(markers[i]);
        break;
      }
    }
  }


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
    marker.setAnimation(google.maps.Animation.BOUNCE);
    stopAnimation(marker);

    if (infowindow.marker != marker){
      infowindow.setContent('');
      infowindow.marker = marker;

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });

      var lat = marker.getPosition().lat();
      var lng = marker.getPosition().lng();
      var content = "";
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;

      $.ajax({
          type: "GET",
          dataType: "jsonp",
          timeout: 5000,
          url: 'https://api.foursquare.com/v2/venues/explore?ll=' + lat + ',' + lng + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=20171224',
          success: function(data){
            var base = data.response.groups[0].items[0];
            if(base.venue.categories[0].name) {
              var categories = base.venue.categories[0].name;
              content = '<div id="category">Category:' + categories + '</div><br>';
            }
            if(base.venue.contact.phone) {
              var phone = base.venue.contact.phone;
              content = content + '<div id="phone">Contact no:' + phone + '</div><br>';
            }
            if(base.venue.hours) {
              if(base.venue.hours.status) {
                var present_status = base.venue.hours.status;
                content = content + '<div id="status">Status:' + present_status + '</div><br>';
              }
            }
            if(base.venue.url) {
              var url = base.venue.url;
              content = content + '<div id="url"><a target="_blank "href="' + url + '">For more information, Click here!</a></div>';
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
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            infowindow.open(map, marker);
          },
          error : function(data, staus) {
            window.alert("Failed to retrive information for current Marker.Please try again later..!!");
          }
      });
    }
  }


  createMarkers = function() {
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

    for(var i=0; i<self.locations_list().length; i++){
      var position = self.locations_list()[i].location;
      var title = self.locations_list()[i].title;
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i,
        icon: defaultIcon
      });
      markers.push(marker);
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


ko.applyBindings(new ViewModel());