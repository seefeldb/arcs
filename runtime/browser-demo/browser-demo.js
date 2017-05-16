/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

//let runtime = require("../runtime.js");

let Arc = require("../arc.js");
let BrowserLoader = require("../browser-loader.js");
let Resolver = require('../resolver.js');
//let Suggestinator = require("../suggestinator.js");

let recipe = require('../recipe.js');
let systemParticles = require('../system-particles.js');
//require("./trace-setup.js");

let recipes = require('./recipes.js');

function prepareExtensionArc() {
  let loader = new BrowserLoader('../');
  systemParticles.register(loader);
  let Person = loader.loadEntity("Person");
  let Product = loader.loadEntity("Product");
  let arc = new Arc({loader});
  arc.createView(Person.type.viewOf(), "peopleFromWebpage");
  arc.createView(Product.type.viewOf(), "productsFromWebpage");
  arc.createView(Person.type, "personSlot");
  arc.commit([
    new Person({name: "Claire"}), 
    new Product({name: "Book About Minecraft"}), 
    new Product({name: "Power Tool Set"}),
    new Product({name: "Guardians of the Galaxy Figure"})
  ]);
  return arc;
}

let buildRecipe = info => {
  let rb = new recipe.RecipeBuilder();
  info.particles.forEach(pi => {
    let p = rb.addParticle(pi.name);
    Object.keys(pi.constrain).forEach(k => {
      p.connectConstraint(k, pi.constrain[k]);
    });
  });
  return rb.build();
};

let arc = prepareExtensionArc();

let suggest = index => {
  let r = buildRecipe(recipes[index]);
  if (Resolver.resolve(r, arc)) {
    r.instantiate(arc);
  } 
};

let suggestions = recipes.map(r => r.name);

let container = document.querySelector('suggestions');
suggestions.forEach((s, i) => {
  container.appendChild(
    Object.assign(document.createElement("suggest"), {
      index: i,
      textContent: s,
      onclick: e => suggest(e.currentTarget.index)
    })
  );
});

/*
let suggestinator = new Suggestinator();
suggestinator._getSuggestions = a => [r];

let results = suggestinator.suggestinate(arc);
results.then(r => {
  console.log(r);
  //window.trace = tracing.save();
});
*/