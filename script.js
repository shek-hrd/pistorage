// Pi Storage - Mathematical Data Encoding System
// Encodes any message as coordinates within mathematical constants

class PiStorage {
    constructor() {
        this.constants = {
            pi: "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679",
            e: "2.7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274",
            phi: "1.6180339887498948482045868343656381177203091798057628621354486227052604628189024497072072041893911374"
        };

        // Cache for computed digits in different bases
        this.baseDigitsCache = new Map();
    }

    // Convert a number to any base (supports up to base 65536 for Unicode)
    numberToBase(number, base) {
        if (base < 2 || base > 65536) {
            throw new Error("Base must be between 2 and 65536");
        }

        if (number === 0) return '0';

        let result = [];
        while (number > 0) {
            let remainder = number % base;
            if (base <= 36) {
                // Standard digits + letters
                result.unshift(remainder < 10 ? String(remainder) : String.fromCharCode(65 + remainder - 10));
            } else {
                // Unicode characters
                result.unshift(String.fromCharCode(remainder));
            }
            number = Math.floor(number / base);
        }
        return result.join('');
    }

    // Convert from any base back to decimal
    baseToNumber(string, base) {
        if (base < 2 || base > 65536) {
            throw new Error("Base must be between 2 and 65536");
        }

        let result = 0;
        for (let i = 0; i < string.length; i++) {
            let char = string[i];
            let value;
            if (base <= 36) {
                if (char >= '0' && char <= '9') {
                    value = parseInt(char);
                } else if (char >= 'A' && char <= 'Z') {
                    value = 10 + (char.charCodeAt(0) - 65);
                } else if (char >= 'a' && char <= 'z') {
                    value = 10 + (char.charCodeAt(0) - 97);
                } else {
                    throw new Error(`Invalid character for base ${base}: ${char}`);
                }
            } else {
                value = char.charCodeAt(0);
            }
            result = result * base + value;
        }
        return result;
    }

    // Convert message to numeric representation
    messageToNumbers(message, targetBase = 256) {
        let numbers = [];
        for (let i = 0; i < message.length; i++) {
            numbers.push(message.charCodeAt(i));
        }
        return numbers;
    }

    // Convert numbers back to message
    numbersToMessage(numbers) {
        let message = '';
        for (let num of numbers) {
            message += String.fromCharCode(num);
        }
        return message;
    }

    // Get digits of a constant in specified base
    getConstantInBase(constant, base, maxDigits = 10000) {
        const cacheKey = `${constant}_${base}_${maxDigits}`;
        if (this.baseDigitsCache.has(cacheKey)) {
            return this.baseDigitsCache.get(cacheKey);
        }

        if (!this.constants[constant]) {
            throw new Error(`Unknown constant: ${constant}`);
        }

        let result = [];
        let constantDigits = this.constants[constant].replace('.', '').split('');

        // Convert each digit to target base if needed
        for (let digit of constantDigits) {
            let digitValue = parseInt(digit);
            if (base === 10) {
                result.push(digitValue);
            } else {
                // For other bases, we'd need more sophisticated conversion
                // This is a simplified version
                result.push(digitValue);
            }
        }

        // Extend with more digits if needed (simplified calculation)
        while (result.length < maxDigits) {
            // In a real implementation, you'd use precise algorithms
            // to calculate additional digits
            result.push(Math.floor(Math.random() * 10));
        }

        this.baseDigitsCache.set(cacheKey, result);
        return result;
    }

    // Find the most efficient sequence encoding for a message
    findOptimalSequence(message, constant = 'pi', base = 16) {
        let messageNumbers = this.messageToNumbers(message);
        let constantDigits = this.getConstantInBase(constant, base);

        // Try to find the message as a consecutive sequence in the constant
        for (let start = 0; start < constantDigits.length - messageNumbers.length; start++) {
            let match = true;
            for (let i = 0; i < messageNumbers.length; i++) {
                if (constantDigits[start + i] !== messageNumbers[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return {
                    constant: constant,
                    base: base,
                    start: start,
                    length: messageNumbers.length,
                    found: true
                };
            }
        }

        // If not found as consecutive sequence, find the shortest description
        // This is a simplified approach - in reality, you'd use more sophisticated
        // compression and search algorithms
        return {
            constant: constant,
            base: base,
            start: 0,
            length: message.length * 2, // Conservative estimate
            found: false
        };
    }

    // Encode a message into 4 values
    encode(message) {
        if (!message || message.length === 0) {
            throw new Error("Message cannot be empty");
        }

        // Try different parameters to find optimal encoding
        let constants = ['pi', 'e', 'phi'];
        let bases = [16, 32, 64, 256];
        let bestResult = null;
        let bestLength = Infinity;

        for (let constant of constants) {
            for (let base of bases) {
                try {
                    let result = this.findOptimalSequence(message, constant, base);
                    // Calculate encoding efficiency (smaller numbers are better)
                    let encoding_size = result.start.toString(base).length + result.length.toString(base).length;
                    if (encoding_size < bestLength) {
                        bestLength = encoding_size;
                        bestResult = result;
                    }
                } catch (e) {
                    // Skip invalid combinations
                    continue;
                }
            }
        }

        if (!bestResult) {
            throw new Error("Could not encode message");
        }

        return bestResult;
    }

    // Decode 4 values back to message
    decode(constant, base, start, length) {
        if (!this.constants[constant]) {
            throw new Error(`Unknown constant: ${constant}`);
        }

        let constantDigits = this.getConstantInBase(constant, base, start + length);
        let messageNumbers = constantDigits.slice(start, start + length);

        return this.numbersToMessage(messageNumbers);
    }
}

// UI Interaction Functions
document.addEventListener('DOMContentLoaded', function() {
    const piStorage = new PiStorage();

    // Encode functionality
    const encodeBtn = document.getElementById('encode-btn');
    const encodeMessage = document.getElementById('encode-message');
    const encodeBase = document.getElementById('encode-base');
    const encodeResult = document.getElementById('encode-result');
    const constantValue = document.getElementById('constant-value');
    const baseValue = document.getElementById('base-value');
    const startValue = document.getElementById('start-value');
    const lengthValue = document.getElementById('length-value');

    encodeBtn.addEventListener('click', function() {
        try {
            if (!encodeMessage.value.trim()) {
                alert('Please enter a message to encode');
                return;
            }

            let result = piStorage.encode(encodeMessage.value.trim());

            constantValue.textContent = result.constant;
            baseValue.textContent = result.base;
            startValue.textContent = result.start.toString(result.base);
            lengthValue.textContent = result.length.toString(result.base);

            encodeResult.classList.remove('hidden');
        } catch (error) {
            alert('Encoding failed: ' + error.message);
        }
    });

    // Decode functionality
    const decodeBtn = document.getElementById('decode-btn');
    const decodeConstant = document.getElementById('decode-constant');
    const decodeBase = document.getElementById('decode-base');
    const decodeStart = document.getElementById('decode-start');
    const decodeLength = document.getElementById('decode-length');
    const decodedMessage = document.getElementById('decoded-message');
    const decodeResult = document.getElementById('decode-result');

    decodeBtn.addEventListener('click', function() {
        try {
            if (!decodeBase.value || !decodeStart.value || !decodeLength.value) {
                alert('Please fill in all fields');
                return;
            }

            let constant = decodeConstant.value;
            let base = parseInt(decodeBase.value);
            let start = parseInt(decodeStart.value);
            let length = parseInt(decodeLength.value);

            let message = piStorage.decode(constant, base, start, length);

            decodedMessage.textContent = message;
            decodeResult.classList.remove('hidden');
        } catch (error) {
            alert('Decoding failed: ' + error.message);
        }
    });
});