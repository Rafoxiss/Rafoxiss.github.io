var addToDoButton = document.getElementById('addToDo');
var toDoContainer = document.getElementById('toDoContainer');
var inputField = document.getElementById('inputField');
var timeField = document.getElementById('timeField');
var bgColorPicker = document.getElementById('bgColorPicker');
var tasks = [];

window.onload = function () {
    // Charge les tâches
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        createTask(task.text, task.done, task.remainingSeconds, task.paused);
    });

    // Charge couleur fond sauvegardée (ou défaut)
    const savedColor = localStorage.getItem('backgroundColor') || '#aa7cea';
    document.body.style.backgroundColor = savedColor;
    bgColorPicker.value = savedColor;
    addToDoButton.style.backgroundColor = savedColor; // applique aussi au bouton +

    updateTaskBackgroundColors(savedColor);
}

addToDoButton.onclick = function () {
    if (inputField.value.trim() !== "") {
        let seconds = parseInt(timeField.value) > 0 ? parseInt(timeField.value) * 60 : 0;
        createTask(inputField.value.trim(), false, seconds, false);
        inputField.value = "";
        timeField.value = "";
    }
}

function createTask(text, done = false, remainingSeconds = 0, paused = false) {
    const taskWrapper = document.createElement('div');
    taskWrapper.classList.add('task-wrapper');
    taskWrapper.style.display = 'flex';
    taskWrapper.style.alignItems = 'center';
    taskWrapper.style.gap = '10px';

    const paragraph = document.createElement('p');
    paragraph.style.flex = '1';

    const timerPauseWrapper = document.createElement('div');
    timerPauseWrapper.style.display = 'flex';
    timerPauseWrapper.style.alignItems = 'center';
    timerPauseWrapper.style.gap = '4px';

    const timer = document.createElement('span');
    const pauseBtn = document.createElement('button');

    let deleteTimeout = null;

    paragraph.innerText = text;
    paragraph.classList.add('paragraphe_style');

    if (done) {
        paragraph.classList.add('paragraph_click');
        paragraph.style.backgroundColor = 'red';
        paragraph.style.color = 'white';
    } else {
        paragraph.style.backgroundColor = document.body.style.backgroundColor;
        paragraph.style.color = 'white'; // texte blanc quand tâche non cochée
    }

    timer.classList.add('timer');

    pauseBtn.classList.add('pause-btn');
    pauseBtn.style.width = '28px';
    pauseBtn.style.height = '24px';
    pauseBtn.style.padding = '2px 0';
    pauseBtn.style.fontSize = '14px';
    pauseBtn.style.cursor = 'pointer';
    pauseBtn.style.marginLeft = '0';
    pauseBtn.style.backgroundColor = document.body.style.backgroundColor; // bouton pause couleur fond
    pauseBtn.style.color = 'white'; // texte bouton pause en blanc

    if (remainingSeconds > 0) {
        updateTimerDisplay(timer, remainingSeconds);
        pauseBtn.textContent = paused ? '▶' : '⏸';
        pauseBtn.disabled = false;
    } else {
        timerPauseWrapper.style.display = 'none';
    }

    pauseBtn.addEventListener('click', function () {
        if (remainingSeconds > 0) {
            paused = !paused;
            pauseBtn.textContent = paused ? '▶' : '⏸';
            saveTasks();
        }
    });

    paragraph.addEventListener('click', function () {
        paragraph.classList.toggle('paragraph_click');

        if (paragraph.classList.contains('paragraph_click')) {
            paragraph.style.backgroundColor = '#fb6565';
            paragraph.style.color = 'white';
            deleteTimeout = setTimeout(() => {
                toDoContainer.removeChild(taskWrapper);
                tasks = tasks.filter(t => t.text !== text);
                saveTasks();
            }, 5000);
        } else {
            if (deleteTimeout) clearTimeout(deleteTimeout);
            paragraph.style.backgroundColor = document.body.style.backgroundColor;
            paragraph.style.color = 'white'; // texte blanc quand décoché
        }

        saveTasks();
    });

    paragraph.addEventListener('dblclick', function () {
        if (deleteTimeout) clearTimeout(deleteTimeout);
        toDoContainer.removeChild(taskWrapper);
        tasks = tasks.filter(t => t.text !== text);
        saveTasks();
    });

    timerPauseWrapper.appendChild(timer);
    timerPauseWrapper.appendChild(pauseBtn);

    taskWrapper.appendChild(paragraph);
    taskWrapper.appendChild(timerPauseWrapper);
    toDoContainer.appendChild(taskWrapper);

    let interval = null;
    if (remainingSeconds > 0) {
        interval = setInterval(() => {
            if (!paused && remainingSeconds > 0) {
                remainingSeconds--;
                updateTimerDisplay(timer, remainingSeconds);
                saveTasks();
            } else if (remainingSeconds === 0 && timer.innerText !== "⏱️ Temps écoulé !") {
                timer.innerText = "⏱️ Temps écoulé !";
                timer.style.color = 'red';
                pauseBtn.disabled = true;
                pauseBtn.style.opacity = 0.5;
                pauseBtn.style.cursor = "default";
                clearInterval(interval);
                saveTasks();
            }
        }, 1000);
    }
}

function updateTimerDisplay(el, sec) {
    let min = Math.floor(sec / 60);
    let s = sec % 60;
    el.innerText = `⏱️ ${min}:${s.toString().padStart(2, '0')}`;
}

function saveTasks() {
    const updated = Array.from(toDoContainer.children).map(child => {
        const text = child.querySelector('p').innerText;
        const done = child.querySelector('p').classList.contains('paragraph_click');
        const timerText = child.querySelector('.timer').innerText;
        const pauseBtn = child.querySelector('.pause-btn');
        const paused = pauseBtn && pauseBtn.textContent.includes('▶');

        let seconds = 0;
        if (timerText.includes(':')) {
            const [min, sec] = timerText.replace("⏱️ ", "").split(":");
            seconds = parseInt(min) * 60 + parseInt(sec);
        }

        return { text, done, remainingSeconds: seconds, paused };
    });

    localStorage.setItem('tasks', JSON.stringify(updated));
    tasks = updated;
}

// Mets à jour la couleur de fond et du texte des tâches non cochées
function updateTaskBackgroundColors(color) {
    const taskTexts = document.querySelectorAll('.paragraphe_style');
    taskTexts.forEach(taskText => {
        if (!taskText.classList.contains('paragraph_click')) {
            taskText.style.backgroundColor = color;
            taskText.style.color = 'white'; // texte blanc
        }
    });

    // Mise à jour bouton pause aussi, s'il y en a
    const pauseButtons = document.querySelectorAll('.pause-btn');
    pauseButtons.forEach(btn => {
        btn.style.backgroundColor = color;
        btn.style.color = 'white';
    });
}

// Gestion changement couleur fond
bgColorPicker.addEventListener('change', function () {
    document.body.style.backgroundColor = this.value;
    addToDoButton.style.backgroundColor = this.value;  // Change aussi le bouton +
    updateTaskBackgroundColors(this.value);
    localStorage.setItem('backgroundColor', this.value);
});

document.getElementById('clearAll').addEventListener('click', function () {
    if (confirm("Es-tu sûr de vouloir supprimer toutes les tâches ?")) {
        toDoContainer.innerHTML = "";
        tasks = [];
        localStorage.removeItem('tasks');
    }
});