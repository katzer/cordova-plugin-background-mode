/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var util = require('util');
var CommonMunger = require('cordova-common').ConfigChanges.PlatformMunger;

function PlatformMunger(platform, project_dir, platformJson, pluginInfoProvider) {
    CommonMunger.apply(this, arguments);
}

util.inherits(PlatformMunger, CommonMunger);

/**
 * This is an override of apply_file_munge method from cordova-common's PlatformMunger class.
 * In addition to parent's method logic also removes capabilities with 'uap:' prefix that were
 * added by AppxManifest class
 *
 * @param {String}  file   A file name to apply munge to
 * @param {Object}  munge  Serialized changes that need to be applied to the file
 * @param {Boolean} [remove=false] Flag that specifies whether the changes
 *   need to be removed or added to the file
 */
PlatformMunger.prototype.apply_file_munge = function (file, munge, remove) {
    // Call parent class' method
    PlatformMunger.super_.prototype.apply_file_munge.call(this, file, munge, remove);

    // CB-11066 If this is a windows10 manifest and we're removing the changes
    // then we also need to check if there are <Capability> elements were previously
    // added and schedule removal of corresponding <uap:Capability> elements
    if (remove && file === 'package.windows10.appxmanifest') {
        var uapCapabilitiesMunge = generateUapCapabilities(munge);
        // We do not check whether generated munge is empty or not before calling
        // 'apply_file_munge' since applying empty one is just a no-op
        PlatformMunger.super_.prototype.apply_file_munge.call(this, file, uapCapabilitiesMunge, remove);
    }
};

/**
 * Generates a new munge that contains <uap:Capability> elements created based on
 * corresponding <Capability> elements from base munge. If there are no such elements
 * found in base munge, the empty munge is returned (selectors might be present under
 * the 'parents' key, but they will contain no changes).
 *
 * @param {Object} munge A munge that we need to check for <Capability> elements
 * @return {Object} A munge with 'uap'-prefixed capabilities or empty one
 */
function generateUapCapabilities(munge) {

    function hasCapabilityChange(change) {
        return /^\s*<Capability\s/.test(change.xml);
    }

    function createPrefixedCapabilityChange(change) {
        return {
            xml: change.xml.replace(/Capability/, 'uap:Capability'),
            count: change.count,
            before: change.before
        };
    }

    // Iterate through all selectors in munge
    return Object.keys(munge.parents)
    .reduce(function (result, selector) {
        result.parents[selector] = munge.parents[selector]
        // For every xml change check if it adds a <Capability> element ...
        .filter(hasCapabilityChange)
        // ... and create a duplicate with 'uap:' prefix
        .map(createPrefixedCapabilityChange);

        return result;
    }, { parents: {} });
}

exports.PlatformMunger = PlatformMunger;
