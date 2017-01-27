#!/usr/bin/env node

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 
var path    = require('path'),
    fs      = require('fs'),
    shjs    = require('shelljs'),
    zip     = require('adm-zip'),
    Q       = require('q'),
    clean   = require('./clean'),
    check_reqs = require('./check_reqs'),
    platformWwwDir          = path.join('platforms', 'browser', 'www'),
    platformBuildDir        = path.join('platforms', 'browser', 'build'),
    packageFile             = path.join(platformBuildDir, 'package.zip');

/**
 * run
 *   Creates a zip file int platform/build folder
 */
module.exports.run = function(){

    return check_reqs.run()
    .then(function(){
            return clean.cleanProject();
        },
        function checkReqsError(err){
            console.error('Please make sure you meet the software requirements in order to build a browser cordova project');
    })
    .then(function(){

        if (!fs.existsSync(platformBuildDir)) {
            fs.mkdirSync(platformBuildDir);
        }

        // add the project to a zipfile
        var zipFile = zip();
        zipFile.addLocalFolder(platformWwwDir, '.');
        zipFile.writeZip(packageFile);

        return Q.resolve();

    });
};

module.exports.help = function() {
    console.log('Usage: cordova build browser');
    console.log('Build will create the packaged app in \''+platformBuildDir+'\'.');
};
