const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let divStack = [];
    let inJsx = false;
    let issues = [];

    lines.forEach((line, index) => {
        // Check if we're entering or exiting JSX
        if (line.includes('return (') || line.includes('=> (')) {
            inJsx = true;
        } else if (line.includes(');')) {
            inJsx = false;
        }

        // Skip if not in JSX
        if (!inJsx) return;

        // Check for opening divs
        const openDivMatch = line.match(/<div([^>]*)>/g);
        if (openDivMatch) {
            openDivMatch.forEach(() => {
                divStack.push(index + 1); // 1-based line numbers
            });
        }

        // Check for closing divs
        const closeDivMatch = line.match(/<\/div>/g);
        if (closeDivMatch) {
            closeDivMatch.forEach(() => {
                if (divStack.length > 0) {
                    divStack.pop();
                } else {
                    issues.push({
                        type: 'extra',
                        line: index + 1,
                        message: 'Extra closing div tag found'
                    });
                }
            });
        }
    });

    // Check for unclosed divs
    divStack.forEach(line => {
        issues.push({
            type: 'unclosed',
            line,
            message: 'Unclosed div tag found'
        });
    });

    return issues;
}

// Find all module files
const moduleFiles = fs.readdirSync(componentsDir)
    .filter(file => file.endsWith('Module.tsx'))
    .map(file => path.join(componentsDir, file));

// Check each file
console.log('Checking for unclosed divs in module files...\n');

let totalIssues = 0;
moduleFiles.forEach(file => {
    const issues = checkFile(file);
    if (issues.length > 0) {
        console.log(`\n${path.basename(file)}:`);
        issues.forEach(issue => {
            console.log(`  Line ${issue.line}: ${issue.message}`);
            totalIssues++;
        });
    }
});

console.log('\nScan complete.');
if (totalIssues > 0) {
    console.log(`\nFound ${totalIssues} issues in total.`);
} else {
    console.log('No unclosed div tags found in module files.');
}
