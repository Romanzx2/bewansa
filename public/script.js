let timer;
let isRunning = false;
let [minutes, seconds, milliseconds] = [0, 0, 0];
const leaderboardUrl = '/api/leaderboard';
let currentInitials = '';
let isAdmin = false;

function updateDisplay() {
    const display = document.getElementById('display');
    display.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(Math.floor(milliseconds / 10)).padStart(2, '0')}`;
}

function startStop() {
    const startStopBtn = document.getElementById('startStopBtn');
    if (isRunning) {
        clearInterval(timer);
        startStopBtn.innerText = 'Start';
        startStopBtn.style.backgroundColor = '#28a745'; // Green color
        showInitialsForm();
    } else {
        timer = setInterval(() => {
            milliseconds += 10;
            if (milliseconds === 1000) {
                milliseconds = 0;
                seconds++;
                if (seconds === 60) {
                    seconds = 0;
                    minutes++;
                }
            }
            updateDisplay();
        }, 10);
        startStopBtn.innerText = 'Stop';
        startStopBtn.style.backgroundColor = '#dc3545'; // Red color
    }
    isRunning = !isRunning;
}

function reset() {
    clearInterval(timer);
    isRunning = false;
    [minutes, seconds, milliseconds] = [0, 0, 0];
    updateDisplay();
    const startStopBtn = document.getElementById('startStopBtn');
    startStopBtn.innerText = 'Start';
    startStopBtn.style.backgroundColor = '#28a745'; // Green color
    hideInitialsForm();
}

function showInitialsForm() {
    document.getElementById('initialsForm').style.display = 'block';
}

function hideInitialsForm() {
    document.getElementById('initialsForm').style.display = 'none';
}

async function saveInitials() {
    const initialsInput = document.getElementById('initialsInput');
    if (initialsInput.value.length === 3) {
        currentInitials = initialsInput.value;
        initialsInput.value = '';
        hideInitialsForm();
        await saveTime(currentInitials);
    } else {
        alert('Please enter exactly 3 initials.');
    }
}

async function saveTime(initials) {
    const totalMilliseconds = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
    const newEntry = { initials, minutes, seconds, milliseconds, totalMilliseconds };

    const response = await fetch(leaderboardUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
    });

    if (response.ok) {
        updateLeaderboard();
    } else {
        alert('Failed to save time');
    }
}

async function updateLeaderboard() {
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';

    const response = await fetch(leaderboardUrl);
    if (response.ok) {
        const data = await response.json();
        data.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.innerText = `${index + 1}. ${entry.initials} - ${String(entry.minutes).padStart(2, '0')}:${String(entry.seconds).padStart(2, '0')}:${String(Math.floor(entry.milliseconds / 10)).padStart(2, '0')}`;
            listItem.setAttribute('data-index', index);
            if (isAdmin) {
                listItem.style.cursor = 'pointer';
                listItem.title = 'Click to remove this score';
                listItem.addEventListener('click', () => removeScore(index));
            }
            leaderboardElement.appendChild(listItem);
        });
    } else {
        alert('Failed to load leaderboard');
    }
}

function showAdminForm() {
    document.getElementById('adminForm').style.display = 'block';
}

function hideAdminForm() {
    document.getElementById('adminForm').style.display = 'none';
}

async function verifyAdmin() {
    const adminPassword = document.getElementById('adminPassword').value;
    if (adminPassword === '1232') {
        isAdmin = true;
        hideAdminForm();
        updateLeaderboard(); // Update the leaderboard to make scores removable
    } else {
        alert('Incorrect password');
    }
}

async function removeScore(index) {
    if (isAdmin) {
        const response = await fetch(leaderboardUrl, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ index }),
        });
        if (response.ok) {
            updateLeaderboard();
        } else {
            alert('Failed to remove score');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    updateLeaderboard(); // Load and display the leaderboard from the server
});
