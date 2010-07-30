// Suggestion global state
var suggestionInfoWindow;
var imageInfoWindow;
var suggestionList = [];

jQuery(function() {
  // By using the same info window as the google search there will
  // only be one window open at a time.
  suggestionInfoWindow = gInfoWindow;
  imageInfoWindow = gInfoWindow;
  var postInfoWindow = gInfoWindow;

  for( var i = 0; i < suggestions.length; i++) {
    suggestionList.push( new Suggestion(suggestions[i]) );
  }
  
  var bikeLayer = new google.maps.BicyclingLayer();
  bikeLayer.setMap(gMap);

  jQuery(posts).each(function f(i, post) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(post.latitude, post.longitude),
      map: gMap,
      title: post.title,
      //draggable: true,
      icon: post.icon_path,
    });
    google.maps.event.addListener(marker, 'click',
      function() { 
        postInfoWindow.setContent('<h3>'+ marker.title +'</h3>' + '<h4>' + post.content + '</h4>')
        postInfoWindow.open(gMap,marker); 
      });
  });

  jQuery(images).each(function f(i, image) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(image.latitude, image.longitude),
      map: gMap,
      title: image.url,
      //draggable: true,
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

  $(".close_info").live("click", function(e) {
      e.preventDefault(); 
      $(".message").slideUp(600);
      addingSuggestion = false;
  });
  var addingSuggestion = false;
  jQuery(".make_suggestion").click(function(e) {
    e.preventDefault();
    if(logged_in) {
      addingSuggestion = true;
      jQuery(".message").html("<h3> Please click on the map <a class='close_info' href=''>X</a> </h3>").slideDown(600);
    }
    else {
      addingSuggestion = false;
      jQuery(".message").html("<h3> Please <a href='/openid'> sign in</a> to make a suggestion. <a class='close_info' href=''>X</a></h3>").slideDown(600);
    }
  });

  // Hook into the form submission of any new suggestion, and 
  // send to the server via ajax instead.
  jQuery("#new_suggestion").live("submit", function(event) {
      var self = jQuery(this);
      jQuery.post(this.action, self.serialize(), function(res, text_status) {
        if(res.errors) {
          jQuery("#suggestion_errors").html('<ul><li>' + res.errors.join('</li><li>') + '</li></ul>').fadeIn(500);
          jQuery.fancybox.resize();
        }
        else {
          new Suggestion(res);
          jQuery.fancybox.close();
          $(".message").slideUp(600);
        }
      }, "json");
      return false;
  });

  google.maps.event.addListener(gMap, 'click', function(e) {
    if(addingSuggestion) {

      var p = e.latLng;
      jQuery.get("/map/new_suggestion", { lat: p.lat(), lng: p.lng() }, function(stuff) {
        jQuery.fancybox({ content: stuff, scrolling: "no" });
      });
    }
  }); 
});

// Suggestion class
function Suggestion(somesuggestion) {
  var me = this;
  me.suggestion_ = somesuggestion;
  me.title = somesuggestion.title;
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
      title: me.title,
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
  var title = document.createElement("h3");
  title.appendChild(document.createTextNode(me.title));
  var moreContent = document.createElement("h4");
  moreContent.appendChild(document.createTextNode(me.content));
  container.appendChild(title);
  container.appendChild(moreContent);
  return container;
}
