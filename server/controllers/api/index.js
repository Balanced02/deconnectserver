var http = require("https");
var querystring = require("querystring");
var OauthParams = require("../../OauthParams");

/**
 * Handshake with linkedin api once the redirect URI is called by linked in to provide teh client secret and other required details
 * @param code
 * @param hres
 */
export const handshake = (code, hreq, hres) => {
  //set all required post parameters
  var data = querystring.stringify({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: OauthParams.redirect_uri, //should match as in Linkedin application setup
    client_id: OauthParams.client_id,
    client_secret: OauthParams.client_secret // the secret
  });

  var options = {
    host: "www.linkedin.com",
    path: "/oauth/v2/accessToken",
    protocol: "https:",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(data)
    }
  };
  var req = http.request(options, function(res) {
    var data = "";
    res.setEncoding("utf8");
    res.on("data", function(chunk) {
      data += chunk;
    });
    res.on("end", function() {
      let responseData = JSON.parse(data);
      getProfileInformation(responseData.access_token, (data, err) => {
        if (err) {
          hres.status(500).json(err);
        }
        if (!hreq.session.profileInformation) {
          hreq.session.profileInformation = data;
          console.log(JSON.parse(hreq.session.profileInformation));
        }
        hres.json(JSON.parse(data));
      });
    });
    req.on("error", function(e) {
      console.log("problem with request: " + e.message);
    });
  });
  req.write(data);
  req.end();
};

export const getProfileInformation = (access_token, callback) => {
  var options = {
    host: "api.linkedin.com",
    path: "/v2/me",
    protocol: "https:",
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token
    }
  };
  var req = http.request(options, function(res) {
    res.setEncoding("utf8");
    var data = "";
    res.on("data", chunk => {
      console.log("PROFILE DATA  ", chunk);
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
      console.log("No more data in response.");
    });
    req.on("error", function(e) {
      console.log("problem with request: " + e.message);
      callback(null, err);
    });
  });
  req.end();
};

// Toingrick =>  Mentor

export const CreateUser = (req, res) => {
  if (req.session.profileInformation) {
    let userProfileInfo = JSON.parse(req.session.profileInformation);
    const { localizedLastName, firstName, profilePicture } = userProfileInfo;
    let newUser = { lastName: localizedLastName, firstName, profilePicture };
    console.log(newUser);
  }
};
