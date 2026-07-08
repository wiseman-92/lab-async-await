const chai = require('chai');
global.expect = chai.expect;

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const babel = require('@babel/core');

// Load HTML content
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');

// Transform JavaScript using Babel
const { code: transformedScript } = babel.transformFileSync(
  path.resolve(__dirname, '..', 'index.js'),
  { presets: ['@babel/preset-env'] }
);

// Initialize JSDOM
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

//Handle fetch
const fetchPkg = 'node_modules/whatwg-fetch/dist/fetch.umd.js';
dom.window.eval(fs.readFileSync(fetchPkg, 'utf-8'));

// Inject the transformed JavaScript into the virtual DOM
const scriptElement = dom.window.document.createElement("script");
scriptElement.textContent = transformedScript;
dom.window.document.body.appendChild(scriptElement);

// Expose JSDOM globals to the testing environment
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.XMLHttpRequest = dom.window.XMLHttpRequest;

const waitFor = (condition, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (condition()) return resolve();
      if (Date.now() - start >= timeout) return reject(new Error('Timed out waiting for condition'));
      setTimeout(check, 50);
    };
    check();
  });
};

// Sample test suite for JavaScript event handling
describe('Asynchronous Fetching ', () => {
  it('should fetch to external api and add information to page', async() => {
    await waitFor(() => document.querySelector('#post-list').children.length > 0);
    let postDisplay = document.querySelector('#post-list');
    expect(postDisplay.innerHTML).to.include('sunt aut');
  });

  it('should create an h1 and p element to add', async() => {
    await waitFor(() => document.querySelector('h1'));
    let h1 = document.querySelector('h1');
    let p = document.querySelector('p');
    expect(h1.textContent).to.include('sunt aut facere repellat');
    expect(p.textContent).to.include('quia et suscipit\nsuscipit');
  });
});