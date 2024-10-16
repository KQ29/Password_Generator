document.addEventListener('DOMContentLoaded', () => {
    // Selecting all necessary DOM elements
    const lengthSlider = document.querySelector(".pass-length input");
    const options = document.querySelectorAll(".option input");
    const copyIcon = document.querySelector(".input-box span");
    const passwordInput = document.querySelector(".input-box input");
    const passIndicator = document.querySelector(".pass-indicator");
    const generateBtn = document.querySelector(".generate-btn");
    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.querySelector(".clear-history-btn");

    const characters = {
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        numbers: "0123456789",
        symbols: "!$%&|[](){}:;.,*+-#@<>~"
    };

    let passwordHistory = [];
    let staticPassword = "";

    // Function to display error messages
    const showError = (message) => {
        const errorMessageEl = document.getElementById('error-message');
        errorMessageEl.textContent = message;
    };

    // Function to clear error messages
    const clearError = () => {
        const errorMessageEl = document.getElementById('error-message');
        errorMessageEl.textContent = '';
    };

    // Function to generate cryptographically secure random numbers
    const getRandomIndex = (max) => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    };

    // Function to add password to history
    const addPasswordToHistory = (password) => {
        if (passwordHistory.length >= 10) {
            passwordHistory.shift();  // Remove oldest if history exceeds 10
        }
        passwordHistory.push(password);
        updateHistoryUI();
    };

    // Function to update the history in the UI
    const updateHistoryUI = () => {
        historyList.innerHTML = "";  // Clear the current history list
        passwordHistory.forEach(password => {
            const listItem = document.createElement("li");
            listItem.textContent = password;
            historyList.appendChild(listItem);
        });
    };

    // Function to clear the password history
    const clearHistory = () => {
        passwordHistory = [];  // Reset the history array
        updateHistoryUI();  // Update the UI to reflect the cleared history
    };

    // Function to generate password
    const generatePassword = (saveToHistory = true) => {
        staticPassword = "";
        let randomPassword = "",
            excludeDuplicate = false,
            passLength = parseInt(lengthSlider.value),
            mandatoryChars = [];

        options.forEach(option => {
            if (option.checked) {
                if (option.id !== "exc-duplicate" && option.id !== "spaces") {
                    staticPassword += characters[option.id];
                    // Add one mandatory character from each selected type
                    mandatoryChars.push(characters[option.id][getRandomIndex(characters[option.id].length)]);
                } else if (option.id === "spaces") {
                    staticPassword += ` ${staticPassword} `;
                } else if (option.id === "exc-duplicate") {
                    excludeDuplicate = true;
                }
            }
        });

        // Validation checks
        if (staticPassword.length === 0) {
            showError("Please select at least one character type.");
            return;
        } else {
            clearError();
        }

        if (passLength < mandatoryChars.length) {
            showError(`Password length should be at least ${mandatoryChars.length} to include all selected character types.`);
            lengthSlider.value = mandatoryChars.length;
            updateSlider();
            return;
        } else if (passLength < 8) {
            showError("Password length should be at least 8 characters for better security.");
            lengthSlider.value = 8;
            updateSlider();
            return;
        } else {
            clearError();
        }

        // Add mandatory characters to password
        randomPassword = mandatoryChars.join('');

        // Fill the remaining password length
        for (let i = mandatoryChars.length; i < passLength; i++) {
            let randomChar = staticPassword[getRandomIndex(staticPassword.length)];
            if (excludeDuplicate) {
                if (!randomPassword.includes(randomChar) || randomChar === " ") {
                    randomPassword += randomChar;
                } else {
                    i--;
                }
            } else {
                randomPassword += randomChar;
            }
        }

        // Shuffle the password to prevent predictable sequences
        randomPassword = randomPassword.split('').sort(() => getRandomIndex(2) - 0.5).join('');

        passwordInput.value = randomPassword;

        if (saveToHistory) {
            addPasswordToHistory(randomPassword);
        }

        updatePassIndicator();
    };

    // Function to update password strength indicator
    const updatePassIndicator = () => {
        const passLength = parseInt(lengthSlider.value);
        const entropyPerChar = Math.log2(staticPassword.length);
        const totalEntropy = entropyPerChar * passLength;

        let strength = '';
        let color = '';

        if (totalEntropy < 28) {
            strength = 'Very Weak';
            color = '#e64a4a';
            passIndicator.id = "very-weak";
        } else if (totalEntropy < 36) {
            strength = 'Weak';
            color = '#e67e22';
            passIndicator.id = "weak";
        } else if (totalEntropy < 60) {
            strength = 'Moderate';
            color = '#f1c80b';
            passIndicator.id = "moderate";
        } else if (totalEntropy < 128) {
            strength = 'Strong';
            color = '#43a047';
            passIndicator.id = "strong";
        } else {
            strength = 'Very Strong';
            color = '#1e88e5';
            passIndicator.id = "very-strong";
        }

        document.getElementById('pass-strength').textContent = strength;
        document.getElementById('pass-strength').style.color = color;
    };

    // Function to update the password length slider without saving to history
    const updateSlider = () => {
        document.querySelector(".pass-length .details span").innerText = lengthSlider.value;
        generatePassword(false);  // Regenerate password, but don't add to history
    };
    

    // Function to copy password to clipboard
    const copyPassword = () => {
        navigator.clipboard.writeText(passwordInput.value)
            .then(() => {
                copyIcon.innerText = "check";
                copyIcon.style.color = "#4285f4";
                setTimeout(() => {
                    copyIcon.innerText = "copy_all";
                    copyIcon.style.color = "#707070";
                }, 1500);
            })
            .catch(err => {
                showError("Failed to copy password: " + err);
            });
    };

    // Function to save settings to localStorage
    const saveSettings = () => {
        const settings = {
            length: lengthSlider.value,
            options: {}
        };
        options.forEach(option => {
            settings.options[option.id] = option.checked;
        });
        localStorage.setItem('passwordGeneratorSettings', JSON.stringify(settings));
    };

    // Function to load settings from localStorage
    const loadSettings = () => {
        const settings = JSON.parse(localStorage.getItem('passwordGeneratorSettings'));
        if (settings) {
            lengthSlider.value = settings.length;
            options.forEach(option => {
                if (settings.options.hasOwnProperty(option.id)) {
                    option.checked = settings.options[option.id];
                }
            });
            updateSlider(); // Update the slider display
        } else {
            updateSlider(); // Ensure slider is initialized
        }
    };

    // Initialize tooltips (if using Tippy.js)
    if (typeof tippy === 'function') {
        tippy('[data-tippy-content]');
    }

    // Event listeners
    copyIcon.addEventListener("click", copyPassword);

    // Save settings when options change
    options.forEach(option => {
        option.addEventListener('change', () => {
            clearError();
            saveSettings();
            updatePassIndicator();
        });
    });

    // Event listener for length slider input
    lengthSlider.addEventListener('input', () => {
    clearError();
    saveSettings();
    updateSlider();        // Add this line
    updatePassIndicator();
    });

    generateBtn.addEventListener("click", () => generatePassword(true));  // Add to history when button is clicked
    clearHistoryBtn.addEventListener("click", clearHistory);

    // Load settings on page load
    loadSettings();

    // Initial password generation
    generatePassword(false);
});
