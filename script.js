var cred = {
    clientId : "467330584122-mo8qhohb1jfhksdhai30kbfm2s5m7som.apps.googleusercontent.com"
}

function checkAuth() {
    gapi.auth.authorize
    ({"client_id" : cred.clientId,
      "immediate" : false,
      "scope"     : "https://www.googleapis.com/auth/drive.readonly"
     }, authCB);
}

function authCB(token) {
    if(token.error != undefined) {
	console.error("Authentication error! ", token.error);
    } else {
	var req = gapi.client.request(
	    { "path": "drive/v2/files/folderId/children",
	      "params": {
		  "folderId" : "0BxtOCdpGh8cjV0VGR3NvaHZpNzQ"
	      }});

	req.then(
	    function(response) {
		fetchFiles(response.result.items, showFiles);
	    },
	    function(error) {
		console.error("Request failure!");
	    })
					
    }
	
}

function req(path, params) {
    var prom = [function(r){console.debug("Success!", r)},
		function(e){console.debug("Error!"  , e)}]
    gapi.client.request(path, params).then(prom[0], prom[1]);
}


function map(f, l) {
    var lp = [];
    for(i in l) {lp[i] = f(l[i])}
    return lp;
}


/*  fetch a single file 
 */ 
function fetchFile(file, callback) {
    gapi.client.request("drive/v2/files/" + file.id)
	.then(
	    function(r) {
		callback(r.result)
	    },
	    function(e) {
		console.debug("Error!", e);
	    });
}

function fetchFiles(files, callback) {
    var batch = gapi.client.newBatch();
    var requests = map(
	function(file) {
	    var id = file.id; 
	    return [gapi.client.request("drive/v2/files/" + id), id];
	}, files);

    for(i in requests) {
	batch.add(requests[i][0], {"id": requests[i][1]});
    }

    batch.then(function(r) {
	console.debug("Success!", r)
	callback(r.result);
    }, function(e) {
	console.error("Error!", e);
    });
}


/* Returns a list item with an url to a file 
 * 
 */ 
function presentFile(f){
    var li = document.createElement("li");
    var a  = document.createElement("a");
    console.debug(f);
    a.href = f.alternateLink;
    a.textContent = f.title;
    li.appendChild(a);
    return li;
}

/*
 * 
 */
function showFiles(files) {
    var t = files;
    files = [];
    for(i in t) {
	files.push(t[i].result);
    }
    
    files.sort(function(fileA, fileB) {
	var getTS = function(f) {
	    return (new Date(Date.parse(f.createdDate))).getTime();
	}; 
	return getTS(fileA) > getTS(fileB); 
    });

    var mins = document.getElementById("minutes");
    for(i in files) {
	mins.appendChild(presentFile(files[i]));
    }
}
