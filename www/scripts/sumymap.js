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
let markers = L.layerGroup();
updateMarkers();
isOnline();


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
    let targetPoint = this.project(latlng, targetZoom).subtract(offset),
    targetLatLng = this.unproject(targetPoint, targetZoom);
    return this.setView(targetLatLng, targetZoom);
}

//Change map interaction area
function setMapClickArea(corner1, corner2){
	if( typeof corner1 !== 'undefined' && typeof corner2 !== 'undefined')
	{
			left_corner = corner1;
			right_corner = corner2;
			map.on('contextmenu', startAdding);
			map.on('click', stopAdding);
	}	
}

//Check if point is in interaction area
function isPointInMap(point){
	if (right_corner.contains(point) && point.contains(left_corner))
		return true;
	else return false;
}

//Turn off all map overlays
function offAllOverlays(){
	document.getElementById("addMarkerPanel").style.display = "none";
	document.getElementById("showMarkerPanel").style.display = "none";
	document.getElementById("loginBar").style.display = "none";

	/*document.getElementById("logButton").style.background = "#18386b";
	document.getElementById("logLink").style.color = "#ffffff";*/

	setMapClickArea (L.point(0, 0),
		L.point(window.innerWidth, window.innerHeight));
	map.invalidateSize()
}

//load/update markers
function updateMarkers(){
	//clean markers
	markers.clearLayers();

	let xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
	xmlhttp.responseType = "text";
	xmlhttp.onreadystatechange = function() {
		        if (this.readyState == 4 && this.status == 200) {
		        	//console.log(this.responseText);
		            let mList = JSON.parse(this.responseText);
		            //console.log(mList);
		            //loadind markers to map
		            for (let i = 0; i < mList.length; i++){
		            	//console.log(mList[i]);
		            	let marker = L.marker(L.latLng(mList[i].position.x, mList[i].position.y));
		            	marker.title = mList[i].title;
		            	marker.user_id = mList[i].user_id;
		            	marker.marker_id = mList[i].marker_id;

		            	//popup
		            	marker.bindPopup(marker.title);
				        marker.on('mouseover', function (e) {
							this.openPopup();
				        });
				        marker.on('mouseout', function (e) {
							this.closePopup();
				        });
				        //click
				        marker.on('click', function (e) {
							showMarkerInfo(this);
				        });
				        
		            	marker.addTo(markers);
		            	//console.log("+1");
		            }
		            markers.addTo(map);
		        }
		    }
	xmlhttp.open("GET", "/getmarkers");
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.send( null );
}

//show specific marker
function showMarkerInfo(marker){
	//form request
	let req = {};
	req.marker_id = marker.marker_id;
	req.user_id = marker.user_id;
	let xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
	xmlhttp.responseType = "text";
	xmlhttp.onreadystatechange = function() {
		        if (this.readyState == 4 && this.status == 200) {
		        	//console.log(this.responseText);
		        	let mInfo = JSON.parse(this.responseText);
		        	//put data in html
					//zoom	
					let newZoom = (map.getZoom() >= 16)? map.getZoom() : 16;
					map.setViewOffset(marker.getLatLng(), [-150,0], newZoom);
					//show overlay
					offAllOverlays();
					document.getElementById("showMarkerPanel").style.display = "block";
					document.getElementById("showMarkerPanel").style.height = String(window.innerHeight - 90) + 'px';
					//set current map area size
					setMapClickArea(left_corner, 
						L.point(window.innerWidth - 350, window.innerHeight));
					//show coordinates
					document.getElementById("latlng2").innerHTML = String(marker.getLatLng().lat) + '; ' + String(marker.getLatLng().lng) + ';';
					document.getElementById("showDescription").innerHTML = mInfo.description;
					document.getElementById("markerTitle").innerHTML = marker.title;
					document.getElementById("showAuthor").innerHTML = mInfo.sname + " " + mInfo.fname;
					
					//TODO: implement cookies
					let current = getCookie("token").replace(/"/g, '');
					console.log(mInfo, current);
					if (mInfo.online == current){
						document.getElementById("delBtn").style.display = "block";
						document.getElementById("delBtn").addEventListener('click', function(e){removeMarker(marker);});
					} else{
						document.getElementById("delBtn").style.display = "none";
						document.getElementById("delBtn").onclick = null;
					}	            
		        }
		    }
	xmlhttp.open("POST", "/onemarker");
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.send(JSON.stringify(req));
	console.log(JSON.stringify(req));
}

//remove marker

//Place marker and start adding problem (right mouse handler)
function startAdding(e){
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
function stopAdding(e){
	if (isPointInMap(e.containerPoint))
	{
		_stopAdding();
	}
}

function _stopAdding(){
	//hide overlay
		offAllOverlays();
		//set current map area size
		setMapClickArea(left_corner, 
			L.point(window.innerWidth, window.innerHeight));
		//remove marker
		addMarker.remove();
}

function saveMarker(e){
	if (addMarker != null){
		let mName = document.getElementById("markerName").value;
		let mDesc = document.getElementById("markerDesc").value;
		let error = "";
		if (mName != "" && mDesc != ""){
			let data = {};
			data.lat = addMarker.getLatLng().lat;
			data.lng = addMarker.getLatLng().lng;
			data.name = mName;
			data.desc = mDesc;

			//TODO: implement cookies
			data.token = getCookie("token");

			let xmlhttp = new XMLHttpRequest();   
			xmlhttp.responseType = "text";
			//here responsetext containes error description
			xmlhttp.onreadystatechange = function() {
		        if (this.readyState == 4 && this.status == 200) {
		            if (this.responseText == ""){
		            	_stopAdding();
		            	updateMarkers();
		            }
		          	else error += "<p>" + this.responseText + "</p>";
		        }
		    }
			xmlhttp.open("POST", "/addmarker");
			xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xmlhttp.send(JSON.stringify(data));
			console.log(JSON.stringify(data));
		}
		else error += "<p>-Ви не заповнили всі поля</p>";
		document.getElementById("addError").innerHTML = error;
	}	
}

function removeMarker(marker){
	if (marker != null){
		let req = {};
		req.marker_id = marker.marker_id;
		req.token = getCookie("token");
		//req.token.replace("\"","");
		console.log(marker);
		let xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
		xmlhttp.responseType = "text";
		xmlhttp.onreadystatechange = function() {
			        if (this.readyState == 4 && this.status == 200) {
			        	//console.log(this.responseText);
			        	if(this.responseText != ""){
			        		offAllOverlays();
			        		marker.remove();
			        	}
			        	else alert("Не вдалося видалити маркер");
						
						//show coordinates            
			        }
			    }
		xmlhttp.open("POST", "/removemarker");
		xmlhttp.setRequestHeader("Content-Type", "application/json");
		xmlhttp.send(JSON.stringify(req));
		}	
}