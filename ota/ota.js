var versions = {};

function parse_otas(jsonObject) {
	var otas = jsonObject.Assets;
	for (var i = 0; i < otas.length; i++) {
		var obj = otas[i];
    	if (obj.AllowableOTA == false) continue;

		var version = obj.OSVersion;
		var devices = obj.SupportedDevices;

		if (!versions[version])
			{versions[version] = {} };

		for (var j = 0; j < devices.length; j++){
			var device = devices[j];
			if (!versions[version][device]) {versions[version][device] = {}};
		};
	};

	var sortableVersions = [];
	for (var version in versions){
		var sortableDevices = [];
		sortableDevices.push(version);

		for (var device in versions[version]) {
			var sorted = false;
			for (var i = 0; i< sortableDevices.length; i++){
				if (sortableDevices[i+1] > device){
					sortableDevices.splice(i+1,0,device);
					sorted = true;
					break;
				}
			}
			if (! sorted) sortableDevices.push(device);
		};
		//Sort devices
		var sorted = false;
		for (var i = 0; i< sortableVersions.length; i++){
			if (sortableVersions[i][0] > version){
				sortableVersions.splice(i,0,sortableDevices);
				sorted = true;
				break;
			}
		}
		if (! sorted) sortableVersions.push(sortableDevices);
	}
	return sortableVersions;
}

function loadDoc() {
  var xhttp = new XMLHttpRequest();
	xhttp.timeout = 10000;
  xhttp.onload = function() {
	 	var sorted = parse_otas(PlistParser.parse(xhttp.responseText));

	 	//remove loading
	 	removeLoading();

	 	console.log("Loaded!");
	 	// process the response.
	 	printOtas(sorted);
  };
  xhttp.onerror = function() {
  	document.getElementById("error").innerHTML = "Download did not work! Please try again.";
  	removeLoading();
  };
	xhttp.ontimeout = function() {
		console.log("Had timeout. Retries with crossorigin!");
		xhttp.open("GET", "http://mesu.apple.com/assets/com_apple_MobileAsset_SoftwareUpdate/com_apple_MobileAsset_SoftwareUpdate.xml", true);
	};
  //xhttp.open("GET", "https://crossorigin.me/http://mesu.apple.com/assets/com_apple_MobileAsset_SoftwareUpdate/com_apple_MobileAsset_SoftwareUpdate.xml", true);
  xhttp.open("GET", "http://mesu.apple.com/assets/com_apple_MobileAsset_SoftwareUpdate/com_apple_MobileAsset_SoftwareUpdate.xml", true);
  //xhttp.open("GET", "https://crossorigin.me/http://mesu.apple.com/assets/com_apple_MobileAsset_SoftwareUpdate/com_apple_MobileAsset_SoftwareUpdate.xml", true);
	xhttp.send();
}

function truncateAtNumber(str){
	return str.split(/[0-9]/)[0];
}

function printOtas(otas) {
	var div = document.getElementById("ota-list");
	for (var i = 0; i < otas.length; i++) {
		var version = otas[i];
		var outerList = document.createElement("ul");
		var heading = document.createElement("li");
		heading.appendChild(document.createTextNode("iOS "+version[0]));
		outerList.appendChild(heading);
		div.appendChild(outerList);

		var lastInnerList = document.createElement("ul");
		outerList.appendChild(lastInnerList);
		for (var j = 1; j < version.length; j++)
		{
			var item = document.createElement("li");
			item.appendChild(document.createTextNode(version[j]));
			// Teste auf namen im gerÃ¤t also iPhone, iPad...
			if (j==1 || truncateAtNumber(version[j])==truncateAtNumber(version[j-1])) {
				lastInnerList.appendChild(item);
			}else{
				lastInnerList = document.createElement("ul");
				outerList.appendChild(lastInnerList);
				lastInnerList.appendChild(item);
			};
		};
	};
}

function removeLoading(){
	var loadingText = document.getElementById("loading");
 	loadingText.parentNode.removeChild(loadingText);
 	var spinner = document.getElementById("spinner");
 	spinner.parentNode.removeChild(spinner);
}



console.log("LOADED!");
loadDoc();
