// Suggestion global state
var suggestionInfoWindow;
var imageInfoWindow;
var suggestionList = [];

jQuery(function() {
  // By using the same info window as the google search there will
  // only be one window open at a time.
  suggestionInfoWindow = gInfoWindow;
  imageInfoWindow = gInfoWindow;

  for( var i = 0; i < suggestions.length; i++) {
    suggestionList.push( new Suggestion(suggestions[i]) );
  }
  
  var bikeLayer = new google.maps.BicyclingLayer();
  bikeLayer.setMap(gMap);

  jQuery(images).each(function f(i, image) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(image.latitude, image.longitude),
      map: gMap,
      title: image.url,
      draggable: true,
      icon: "/images/map_icons/picture_icon.png"
    });
    google.maps.event.addListener(marker, 'dragend', function(evt) {
      image.latitude = evt.latLng.lat()
      image.longitude = evt.latLng.lng()
      jQuery.post("/flickr/update_location", image)
    });
    google.maps.event.addListener(marker, 'click',
      function() { 
        imageInfoWindow.setContent('<img border="0" style="height:auto; width: auto;" src="' + marker.title + '"/>')
        imageInfoWindow.open(gMap,marker); 
      });
  });

  var addingPark = false;
  jQuery("#make_suggestion").click(function() {
    addingPark = true;
    jQuery("#make_suggestion").html("Click on the map to show us where your suggestion resides");
  });

  google.maps.event.addListener(gMap, 'click', function(e) {
    if(addingPark) {
      jQuery("#make_suggestion").html("Add a suggestion?");
      addingPark = false;

      var p = e.latLng;
      jQuery.get("/map/new_suggestion", { lat: p.lat(), lng: p.lng(), icon_id: iconId }, function(stuff) {
        jQuery.fancybox({ content: stuff, scrolling: "no" });
      });
    }
  }); 
});

// Suggestion class
function Suggestion(somesuggestion) {
  var me = this;
  me.suggestion_ = somesuggestion;
  me.name = somesuggestion.name;
  me.lat = somesuggestion.latitude;
  me.lng = somesuggestion.longitude;
  me.icon_path = somesuggestion.icon_path;
  me.content = somesuggestion.content;
  me.marker_ = me.marker();
}

Suggestion.prototype.marker = function() {
  var me = this;
  if (me.marker_) return me.marker_;
  var marker = me.marker_ = new google.maps.Marker({
      position: new google.maps.LatLng(me.lat, me.lng),
      map: gMap,
      title: me.name,
      draggable: false,
      icon: me.icon_path,
    });
    google.maps.event.addListener(marker, "click", function() {
      me.select();
    });
  return marker;
};

Suggestion.prototype.select = function() {
  suggestionInfoWindow.setContent(this.html(true));
  suggestionInfoWindow.open(gMap, this.marker());
};

Suggestion.prototype.html = function() {
  var me = this;
  var container = document.createElement("div");
  container.className = "suggestionInfo";
  var name = document.createElement("h3");
  name.appendChild(document.createTextNode(me.name));
  var moreContent = document.createElement("h4");
  moreContent.appendChild(document.createTextNode(me.content));
  container.appendChild(name);
  container.appendChild(moreContent);
  return container;
}
