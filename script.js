var addToDoButton = document.getElementById('addToDo');
var toDoContainer = document.getElementById('toDoContainer');
var inputField = document.getElementById('inputField');
var timeField = document.getElementById('timeField');
var tasks = [];

window.onload = function () {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        createTask(task.text, task.done, task.remainingSeconds, task.paused);
    });
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
    if (done) paragraph.classList.add('paragraph_click');

    timer.classList.add('timer');

    pauseBtn.classList.add('pause-btn');
    pauseBtn.style.width = '28px';
    pauseBtn.style.height = '24px';
    pauseBtn.style.padding = '2px 0';
    pauseBtn.style.fontSize = '14px';
    pauseBtn.style.cursor = 'pointer';
    pauseBtn.style.marginLeft = '0';

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
            deleteTimeout = setTimeout(() => {
                toDoContainer.removeChild(taskWrapper);
                tasks = tasks.filter(t => t.text !== text);
                saveTasks();
            }, 5000);
        } else if (deleteTimeout) {
            clearTimeout(deleteTimeout);
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
