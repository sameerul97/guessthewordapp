const fs = require('fs');
const jwt = require('jsonwebtoken');
var path = require('path');
var keys = {
    private: fs.readFileSync(path.resolve('./private.key')),
    public: fs.readFileSync(path.resolve('./public.key'))
};
// use 'utf8' to get string instead of byte array  (512 bit key)
// var privateKEY = fs.readFileSync('../private.key', 'utf8');
// var publicKEY = fs.readFileSync('../public.key', 'utf8');
module.exports = {
    sign: (payload, $Options) => {
        /*
         sOptions = {
          issuer: "Authorizaxtion/Resource/This server",
          subject: "iam@user.me", 
          audience: "Client_Identity" // this should be provided by client
         }
        */
        // Token signing options
        var signOptions = {
            issuer: $Options.issuer,
            subject: $Options.subject,
            audience: $Options.audience,
            expiresIn: "10m",    // 30 days validity
            algorithm: "RS256"
        };
        return jwt.sign(payload, keys.private, signOptions);
    },
    verify: (token, $Option) => {
        /*
         vOption = {
          issuer: "Authorization/Resource/This server",
          subject: "iam@user.me", 
          audience: "Client_Identity" // this should be provided by client
         }  
        */
        var verifyOptions = {
            issuer: $Option.issuer,
            subject: $Option.subject,
            audience: $Option.audience,
            expiresIn: "30d",
            algorithm: ["RS256"]
        };
        try {
            return jwt.verify(token, key.public, verifyOptions);
        } catch (err) {
            return false;
        }
    },
    decode: (token) => {
        return jwt.decode(token, { complete: true });
        //returns null if token is invalid
    }
}

// PAYLOAD
var payload = {
    data1: "Data 1",
    data2: "Data 2",
    data3: "Data 3",
    data4: "Data 4",
};

var i = 'GuessthewordApp';          // Issuer 
var s = 'sameer@sameer.com';        // Subject 
var a = 'http://mysoftcorp.in'; // Audience
// SIGNING OPTIONS
var signOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: "12h",
    algorithm: "RS256"
};
  // var token = jwtService.sign(payload, signOptions);
  // console.log("Token - " + token)
