document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // Function to switch themes
    const switchTheme = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.querySelector('.container').classList.add('dark-mode');
            themeToggleBtn.classList.add('dark-mode');
            themeToggleBtn.textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('dark-mode');
            document.querySelector('.container').classList.remove('dark-mode');
            themeToggleBtn.classList.remove('dark-mode');
            themeToggleBtn.textContent = 'Light Mode';
        }
        localStorage.setItem('passwordGeneratorTheme', isDark ? 'dark' : 'light');
    };

    // Event listener for theme toggle button
    themeToggleBtn.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        switchTheme(isDark);
    });

    // Load theme preference on page load
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('passwordGeneratorTheme') || 'light';
        const isDark = savedTheme === 'dark';
        switchTheme(isDark);
    };

    loadTheme();
});
