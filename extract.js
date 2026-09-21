const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('Bash_ Online Shopping - Shop Clothing, Sports, Home & Electronics Online in SA1.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// The foschini "My Orders" container usually has a specific class or text.
const mainElement = document.querySelector('main') || document.querySelector('.vtex-account');
if (mainElement) {
    // Let's dump the class structure of the account section
    console.log(mainElement.innerHTML.substring(0, 5000));
}
