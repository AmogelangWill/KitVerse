const fs = require('fs');

function extractStyles() {
    const listHtml = fs.readFileSync('Bash_ Online Shopping - Shop Clothing, Sports, Home & Electronics Online in SA1.html', 'utf-8');
    const detailHtml = fs.readFileSync('Bash_ Online Shopping - Shop Clothing, Sports, Home & Electronics Online in SA.html', 'utf-8');
    
    // Quick grep-style matching for main layout elements
    console.log("Found List file length:", listHtml.length);
    console.log("Found Detail file length:", detailHtml.length);
}
extractStyles();
