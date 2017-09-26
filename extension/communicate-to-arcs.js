// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt


function getSessionId() {
  // TODO(smalls) - use a user id instead of chrome.runtime.id.
  return chrome.runtime.id;
}

function populateIframe(doc) {

  let iframe = doc.getElementById('arcs-if');
  let cdnRoot = 'https://polymerlabs.github.io/arcs-cdn/dev/';

  iframe.src = cdnRoot+"/app/?manifest=arcs-extension.manifest&amkey="+getSessionId();
}