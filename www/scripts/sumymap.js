"use strict";
//--global--
let right_corner =  L.point(0, 0);
let left_corner =  L.point(0, 0);
let addMarker = L.marker();
let map = L.map('mapid',{
	center: [50.9072, 34.8029],
	zoom: 13,
	maxBounds: L.latLngBounds([50.97, 34.68], [50.85, 34.91]),
	minZoom: 13,
});

//--main--
document.getElementById("mapid").style.height = String(window.innerHeight - 60) + 'px';
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
setMapClickArea(left_corner, 
	L.point(window.innerWidth, window.innerHeight));
map.invalidateSize();

window.addEventListener('resize', function(event){
	document.getElementById("mapid").style.height = String(window.innerHeight - 60) + 'px';
	map.invalidateSize();
});

//--functions--
//Move zoom focus from marker begore adding overlay
L.Map.prototype.setViewOffset = function (latlng, offset, targetZoom) {
    var targetPoint = this.project(latlng, targetZoom).subtract(offset),
    targetLatLng = this.unproject(targetPoint, targetZoom);
    return this.setView(targetLatLng, targetZoom);
}

//Change map interaction area
function setMapClickArea (corner1, corner2) {
	if( typeof corner1 !== 'undefined' && typeof corner2 !== 'undefined')
	{
			left_corner = corner1;
			right_corner = corner2;
			map.on('contextmenu', startAdding);
			map.on('click', stopAdding);
	}	
}

//Check if point is in interaction area
function isPointInMap (point) {
	if (right_corner.contains(point) && point.contains(left_corner))
		return true;
	else return false;
}

//Turn off all map overlays
function offAllOverlays () {
	document.getElementById("addMarkerPanel").style.display = "none";
	document.getElementById("loginBar").style.display = "none";

	/*document.getElementById("logButton").style.background = "#18386b";
	document.getElementById("logLink").style.color = "#ffffff";*/

	setMapClickArea (L.point(0, 0),
		L.point(window.innerWidth, window.innerHeight));
	map.invalidateSize()
}

//Place marker and start adding problem (right mouse handler)
function startAdding (e) {
	/*
	console.log('left ' + left_corner);
	console.log('right ' + right_corner);
	console.log('e ' + e.containerPoint);
	*/
	if (isPointInMap(e.containerPoint))
	{
		//select point		
		addMarker
			.setLatLng(e.latlng)
			.addTo(map);
		let newZoom = (map.getZoom() >= 16)? map.getZoom() : 16;
		map.setViewOffset(e.latlng, [-150,0], newZoom);
		//show overlay
		offAllOverlays();
		document.getElementById("addMarkerPanel").style.display = "block";
		document.getElementById("addMarkerPanel").style.height = String(window.innerHeight - 90) + 'px';
		//set current map area size
		setMapClickArea(left_corner, 
			L.point(window.innerWidth - 350, window.innerHeight));
		//show coordinates
		document.getElementById("latlng1").innerHTML = String(e.latlng.lat) + '; ' + String(e.latlng.lng) + ';';
	}
}

//Cancel adding problem (left mouse handler)
function stopAdding (e) {
	if (isPointInMap(e.containerPoint))
	{
		//hide overlay
		offAllOverlays();
		//set current map area size
		setMapClickArea(left_corner, 
			L.point(window.innerWidth, window.innerHeight));
		//remove marker
		addMarker.remove();
	}
}
