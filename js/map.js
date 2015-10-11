
Parse.initialize("4EKumHrtgH5GtrGswrjWCQVDrKRCcdihxaG006eo", "OEhXvtCNHGIjsEQOfRFdk6RZUJ8A2CW0nzHxKfu9");
var map;
var myLatLng = {};
var found = false;
function initMap() {
  //Load map based on geolocation or default to Berkeley
  //var myLatLng;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      myLatLng = {
        lat: position.coords.latitude + 0.0002,
        lng: position.coords.longitude + 0.0002
      }
      found = true;
      map = new google.maps.Map(document.getElementById('map'), {
      center: myLatLng,
      zoom: 15
      });
      addMarkers();
    })
  } if (!found) {
    myLatLng = {lat: 37.869749, lng: -122.261953};
    map = new google.maps.Map(document.getElementById('map'), {
      center: myLatLng,
      zoom: 15
    });
    addMarkers();
  }
  $('#submit').on('click', function(e) {
    alert("Please wait for your song to upload before continuing! This process usually takes 10-20 seconds.");
    var x = document.getElementById("form1");
    var name = x.elements["name"].value;
    var artist = x.elements["artist"].value;
    var file_name = x.elements["song"].value;

    e.preventDefault();
    if (name === '' || artist === '' || file_name === '') {
      alert('Please fill out all fields.');
      return;
    }


    var fileUploadControl = $("#audio")[0];
    if (fileUploadControl.files.length > 0) {
      var file = fileUploadControl.files[0];
      var song_name = "song.mp3";

      var parseFile = new Parse.File(song_name, file);
      parseFile.save().then(function() {
      // The file has been saved to Parse.
      }, function(error) {
      // The file either could not be read, or could not be saved to Parse.
        alert('Could not upload song file.');
          });
    }
    var marker1 = new google.maps.Marker({
      position: myLatLng,
      map: map,
      icon: 'img/fire.png'
    });
    marker1.setMap(map);

    $('#songname').val('');
    $('#artistname').val('');
    $('#audio').val('');
    var marker1_mess = ""
    var MarkerObject = Parse.Object.extend("MarkerObject");
    var newMarker = new MarkerObject();
    newMarker.set("position", myLatLng);
    newMarker.set("artist", artist);
    newMarker.set("song", name);
    newMarker.set("audio", parseFile);
    newMarker.set("likes", 0);
    newMarker.set("dislikes", 0);
    newMarker.set("circle", null);
    newMarker.set("liked", false);
    marker1.set("markerobject", newMarker);
    newMarker.save(null, {
      success: function(newMarker) {
        alert('Successfully added song!');
        marker1_mess = '<h3>Song: ' + newMarker.get('song') + '</h3>' + '<h2>Artist: ' + newMarker.get('artist') + '</h3>' +
    '<h2><audio controls><source src = ' + newMarker.get('audio').url() + ' type = "audio/mp3"></audio></h2><p>' + '<span id="number">0</span>' +'<a id="likes" onclick="like(1);">&nbsp&nbsp&nbspLike</a></p><p>' + 
    '<span id="number2">0</span>' + '<a id="dislikes" onclick="like(-1);">&nbsp&nbsp&nbspDislike</a></p>';
    
      attachSecretMessage(marker1, marker1_mess);
      },
      error: function(newMarker, error) {
        alert('Failed to add song!');
      }

    })
  });
}

function like(amount) {
  if (curr_marker.liked) {
    return;
  }
  curr_marker.liked = true;
  if (amount == -1) {
    curr_marker.markerobject.increment("dislikes", -1);
    curr_marker.markerobject.save();
    var update = ""
    update += curr_marker.markerobject.get("dislikes");
    $('#number2').text(update);
  } else {
    curr_marker.markerobject.increment("likes", 1);
    curr_marker.markerobject.save();
    $('#number').text(curr_marker.markerobject.get("likes"));
  }
}

function addMarkers() {
  var MarkerObject = Parse.Object.extend("MarkerObject");
  var queryMarker = new Parse.Query(MarkerObject);

  queryMarker.find({
    success: function (results) {
      for (var i = 0; i < results.length; i++) {
        var temp_MarkerObject = results[i];
        var temp_mark = new google.maps.Marker({
        position: temp_MarkerObject.get('position'),
        map: map,
        icon: 'img/fire.png',
        markerobject: temp_MarkerObject,
        circle: null,
        liked: false
        });
        temp_mark.setMap(map);
        var secret = '<h3>Song: ' + temp_MarkerObject.get('song') + '</h3>' + '<h3>Artist: ' + temp_MarkerObject.get('artist') + '</h3>' +
    '<h2><audio controls><source src = ' + temp_MarkerObject.get('audio').url() + ' type = "audio/mp3"></audio></h2><p>' + '<span id="number">' + temp_MarkerObject.get('likes') 
    + '</span>' + '<a id="likes" onclick="like(1);">&nbsp&nbsp&nbspLike</a></p><p>'+ '<span id="number2">' + temp_MarkerObject.get('dislikes') + '</span><a id="dislikes" onclick="like(-1);">&nbsp&nbsp&nbspDislike</a></p>';
        attachSecretMessage(temp_mark, secret);
      }
    },
    error: function(error) {
      alert("Could not fetch data!");
    }
  });
}

  // Attaches an info window to a marker with the provided message. When the
// marker is clicked, the info window will open with the secret message.
var curr_marker = null;
function attachSecretMessage(marker, secretMessage) {
  marker.infowindow = new google.maps.InfoWindow({
    content: secretMessage
  });

marker.addListener('click', function() {
  var diff;
  if (curr_marker === marker) {
    marker.infowindow.close(marker.get('map'), marker);
    curr_marker.circle.setVisible(false);
    curr_marker = null;
    return;
  } else {
    diff = marker.markerobject.get('likes') + marker.markerobject.get('dislikes');
    if (diff < 0) {
      diff = 0;
    }
    marker.circle = new google.maps.Circle({
     strokeColor: '#FF0000 ',
     strokeOpacity: 0.8,
     strokeWeight: 2,
     fillColor: '#FF0000 ',
     fillOpacity: 0.35,
     map: map,
     center: marker.get('position'),
     radius: diff * 100
   });
    if (curr_marker === null) {
    marker.infowindow.open(marker.get('map'), marker);
    curr_marker = marker;
    } else if (curr_marker !== null) {
    curr_marker.circle.setVisible(false);
    curr_marker.infowindow.close(curr_marker.get('map'), curr_marker);
    marker.infowindow.open(marker.get('map'), marker);
    curr_marker = marker;
  }
  }
});
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
infoWindow.setPosition(pos);
infoWindow.setContent(browserHasGeolocation ?
  'Error: The Geolocation service failed.' :
  'Error: Your browser doesn\'t support geolocation.');

}