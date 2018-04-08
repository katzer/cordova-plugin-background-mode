#!/usr/bin/env javascript

/*
  Copyright (c) Microsoft. All rights reserved.
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/
var fs = require("fs");
var path = require("path");
var Q;
var glob;
var xml2js = require('xml2js');

var requiredCapabilities = [
  {
    name: "backgroundMediaPlayback",
    present: false,
    tag: "uap3:Capability",
    namespace: { name: "uap3", uri: "http://schemas.microsoft.com/appx/manifest/uap/windows10/3" }
  } /*, {
    name: "extendedExecutionUnconstrained",
    present: false,
    tag: "rescap:Capability",
    namespace: {name: "rescap", uri:"http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"}
  }*/
];

module.exports = function(context) {

  console.log("Adding proper capability to windows manifests");

  // Grab the Q, glob node modules from cordova
  Q=context.requireCordovaModule("q");
  glob=context.requireCordovaModule("glob");

  // Need to return a promise since glob is async
  var deferred = Q.defer();

  // Find all custom framework files within plugin source code for the iOS platform
  glob("platforms/windows/package.*.appxmanifest", function(err, manifests) {
    if(err) {
      deferred.reject(err);
    } else {
      // Folder symlinks like "Header" will appear as normal files without an extension if they came from
      // npm or were sourced from windows. Inside these files is the relative path to the directory the
      // symlink points to. So, start detecting them them by finding files < 1k without a file extension.
      manifests.forEach(function(manifest) {
        manifest = path.join(context.opts.projectRoot, manifest);

        fs.readFile(manifest, 'utf8', function(err, data) {
          console.log("Processing:", manifest);
          if (err) {
            return console.log(err);
          }

          xml2js.parseString(data, function(err, xml) {
            if (err) {
              return console.log(err);
            }
            var capabilities = xml['Package']['Capabilities'][0];
            if (typeof capabilities === "undefined") {
              capabilities = {};
            }
            // Check if capability is already present
            requiredCapabilities.forEach(function (req) {
              if (typeof capabilities[req.tag] !== "undefined") {
                capabilities[req.tag].forEach(function(capability) {
                  if (capability["$"] && capability["$"]["Name"] == req.name) {
                    req.present = true;
                  }
                });
              }
            });

            requiredCapabilities.forEach(function (req) {
              if (!req.present) {
                console.log ("Adding", req.name)
                if (typeof capabilities[req.tag] === "undefined") {
                  capabilities[req.tag] = [];
                }
                capabilities[req.tag].push({"$": { "Name" : req.name }})
                if (req.namespace && !xml['Package']['$']['xmlns:' + req.namespace.name]) {
                  xml['Package']['$']['xmlns:' + req.namespace.name] = req.namespace.uri;
                }
              }
            });
            var namespaces = [];
            for (ns in xml['Package']['$']) {
              if (ns.match(/^xmlns:/)) {
                namespaces.push(ns.split(":")[1]);
              }
            };
            xml['Package']['$']['IgnorableNamespaces'] = namespaces.join(" ");

            xml['Package']['Capabilities'] = capabilities;

            // write modified appxmanifest
            var builder = new xml2js.Builder();
            fs.writeFile(manifest, builder.buildObject(xml), function(err) {
              if(err) {
                return console.log(err);
              }
            });
          });
        });
      });
      deferred.resolve();
    }
  });

  return deferred.promise;
}
