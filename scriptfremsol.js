const sequenceInput = document.getElementById('sequence');
const findButton = document.getElementById('find');
const progressDiv = document.getElementById('progress');

let progress = 0;
let sequence = '';
let eDigits = [];
let found = false;

// Function to calculate e on the fly
function calcEDigits() {
    let a = 1;
    let b = 1;
    let e = 2;
    let term = 1;
    while (true) {
        if (found) break;
        term++;
        a *= term;
        b *= term;
        e += 1 / a;
        eDigits.push(Math.floor(e * Math.pow(10, term)).toString());
        if (eDigits.join('').includes(sequence)) {
            const pos = eDigits.join('').indexOf(sequence);
            progressDiv.innerText = `Sequence found at position ${pos + 1}`;
            found = true;
        } else {
            progressDiv.innerText = `Progress: ${eDigits.length} digits`;
        }
    }
}

findButton.addEventListener('click', () => {
    sequence = sequenceInput.value;
    eDigits = [];
    found = false;
    progressDiv.innerText = 'Searching...';
    calcEDigits();
});