//Coded by Miguel Palencia 21/04/25 


//Our variables
var eventFMOD; //Event from where we want to export
var pathFile = ""; //Path where we will locate the json
var markers = []; //Markers array
var tempoMarker = { tempo: "", numerator: 4, denominator: 4 }; //Tempo marker

//Map the track to push all the markers
function mapTrack(track) {
  track.markers.map(getMarker);
}

//Compare if the marker is valid. If is true, then it is pushed.
function getMarker(marker) {
  if (marker.entity === "TempoMarker") {
    tempoMarker.tempo = marker.tempo;
    tempoMarker.numerator = marker.timeSignatureNumerator;
    tempoMarker.denominator = marker.timeSignatureDenominator;
  } else if (
    marker.entity === "LoopRegion" ||
    marker.entity === "NamedMarker"
  ) {
    var len = -1;

    if (marker.entity === "LoopRegion") len = marker.length;

    markers.push({ name: marker.name, time: marker.position, duration: len });
  }
}

//Just debug pruposes
function showMarkers(listOfMarkers) {
  listOfMarkers.map(function foo(item) {
    console.log("Marker Name: " + item.name + " Time: " + item.time);
  });
}

//Sort by TimePosition
function sortMarkers() {
  markers.sort(function compare(a, b) {
    return a.time - b.time;
  });
}

//Open a file or create if it doesnt exist. Fill the json with our markers
function createJSON() {
  var path = studio.project.filePath;
  path = path.substring(0, path.lastIndexOf("/"));

  var jsonData = {
    tempo: tempoMarker,
    tags: markers,
  };
  var content = JSON.stringify(jsonData, null, 2);

  var file = studio.system.getFile(pathFile + "/" + eventFMOD.name + ".json");
  file.open(studio.system.openMode.ReadWrite);
  file.writeText(content);
  file.close();
}

function exportMarkers() {
  eventFMOD = studio.window.browserCurrent(); //The current event selected
  markers = []; //Clear array

  if (!eventFMOD) {
    console.log("Event not found");
    return;
  }

  eventFMOD.markerTracks.map(mapTrack); //Collect the markers
  sortMarkers(); //Sort them
  //showMarkers(markers);                     //Print
  createJSON(); //Write a JSON
}

//Open a modal to select the path.
function showModal() {
  pathFile = studio.project.filePath.substring(
    0,
    studio.project.filePath.lastIndexOf("/")
  );
  studio.ui.showModalDialog({
    windowTitle: "Select Directory Path:",
    windowWidth: 360,
    windowHeight: 50,
    widgetType: studio.ui.widgetType.Layout,
    layout: studio.ui.layoutType.VBoxLayout,
    items: [
      {
        widgetType: studio.ui.widgetType.PathLineEdit,
        widgetId: "id_Path",
        caption: "Export Path",
        label: "Select Path",
        text: pathFile,
        pathType: studio.ui.pathType.Directory,
      },
      {
        widgetType: studio.ui.widgetType.PushButton,
        text: "Export",
        onClicked: function () {
          pathFile = this.findWidget("id_Path").text();
          exportMarkers();
          this.closeDialog();
        },
      },
    ],
  });
}

//Create a Menu item. It will just be enabled if we select an event
studio.menu.addMenuItem({
  name: "Export Markers",
  execute: function () {
    showModal();
  },
  isEnabled: function foo() {
    return studio.window.browserCurrent();
  },
});
