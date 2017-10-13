// @license
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

"use strict";

defineParticle(({Particle}) => {
  return class PassThrough extends Particle {
    setViews(views) {
      views.get('a').get().then(result => {
        views.get('b').set(result);
      });
    }
  }
});