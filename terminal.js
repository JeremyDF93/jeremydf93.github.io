const bootSequence = [
  "Nyxium OS v3.11 (x86_64 kernel)",
  "Initializing system hardware...",
  "Detecting GPU....................... NVIDIA RTX 4090",
  "Checking video memory............... 24GB [ OK ]",
  "Setting display mode................ 8-Bit Retro [ OK ]",
  "",
  "Welcome to Nyxium Network Systems",
  "",
  "[  OK  ] Initializing system drivers.",
  "[  OK  ] Mounting storage partitions.",
  "[  OK  ] Starting VR network services.",
  "[FAILED] Connecting to pfSense security uplink.",
  "Warning: Network is running in unprotected mode.",
  "[  OK  ] Reached target: Multi-User System.",
  "",
  "[[ Power Diagnostic ]]",
  "UPS Status: Battery at 4% capacity.",
  "WARNING: UPS battery is degraded. Replace immediately.",
  "",
  "[[ User Session ]]",
  "Establishing session for: kiwi",
  "Checking administrator permissions...",
  "ERROR: Motivation core failed to initialize.",
  "Kernel panic: System state is 'depressed'.",
  "Dumping error logs to memory...",
  "Attempting to find a restore point..."
];

const finalMessage = "No functional state ever existed for [kiwi].";

const outputDiv = document.getElementById('output');
const contentContainer = document.querySelector('.terminal-content');
const inputLineDiv = document.getElementById('input-line');
const hiddenInput = document.getElementById('hidden-input');
const cmdText = document.getElementById('cmd-text');
const cursor = document.getElementById('cursor');

let lineIndex = 0;
let isTerminalActive = false;

// DYNAMIC BUFFER MANAGER
// Checks physical pixels instead of line count
function trimBuffer() {
  // Use clientHeight for the exact "visible" inner area of the window
  const viewportHeight = window.innerHeight;
  
  // While the content height is greater than the window height
  while (contentContainer.scrollHeight > viewportHeight) {
    if (outputDiv.firstChild) {
      outputDiv.removeChild(outputDiv.firstChild);
    } else {
      break;
    }
  }
}

// Re-trim on window resize to ensure nothing is cut off
window.addEventListener('resize', trimBuffer);

function printBootLines() {
  if (lineIndex < bootSequence.length) {
    const lineText = bootSequence[lineIndex];
    printLine(lineText);
    lineIndex++;
    
    const delay = lineText === "..." ? 800 : (Math.random() * 150 + 20);
    setTimeout(printBootLines, delay);
  } else {
    setTimeout(typeFinalMessage, 1200);
  }
}

function typeFinalMessage() {
  printLine(""); 
  const finalElem = document.createElement('div');
  finalElem.className = 'line';
  outputDiv.appendChild(finalElem);

  let charIndex = 0;
  
  function typeChar() {
    if (charIndex < finalMessage.length) {
      finalElem.textContent += finalMessage.charAt(charIndex);
      charIndex++;
      trimBuffer(); // Check height during typing
      
      let nextDelay = 60;
      if (finalMessage.charAt(charIndex - 1) === '.') {
          nextDelay = 600; 
      }
      setTimeout(typeChar, nextDelay);
    } else {
      setTimeout(activateTerminal, 1000);
    }
  }
  typeChar();
}

function printLine(text, cssClass = '') {
  const lineElem = document.createElement('div');
  lineElem.className = 'line ' + cssClass;
  
  if (text.includes('ERROR') || text.includes('[FAILED]') || text.includes('Kernel panic')) {
    lineElem.classList.add('error');
  } else if (text.includes('WARNING')) {
    lineElem.classList.add('warning');
  }

  lineElem.textContent = text === "" ? '\u00A0' : text;
  
  outputDiv.appendChild(lineElem);
  trimBuffer(); 
}

function activateTerminal() {
  printLine("");
  inputLineDiv.style.display = 'block';
  isTerminalActive = true;
  hiddenInput.focus();
  trimBuffer();
}

// --- INTERACTIVE TERMINAL LOGIC ---

document.addEventListener('click', () => {
  if (isTerminalActive) hiddenInput.focus();
});

hiddenInput.addEventListener('input', (e) => {
  cmdText.textContent = e.target.value;
  cursor.classList.add('typing');
  trimBuffer(); // Handle overflow while user is typing a very long line
  
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    cursor.classList.remove('typing');
  }, 500);
});

hiddenInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && isTerminalActive) {
    const cmd = hiddenInput.value.trim();
    printLine(`kiwi@nyxium.io:~$ ${cmd}`);
    processCommand(cmd);
    hiddenInput.value = '';
    cmdText.textContent = '';
    trimBuffer();
  }
});

function processCommand(cmd) {
  const args = cmd.toLowerCase().split(' ');
  const mainCmd = args[0];

  if (!mainCmd) return; 

  switch (mainCmd) {
    case 'help':
      printLine("Nyxium Systems Shell - Available Commands:");
      printLine("  whoami   - Print current user status");
      printLine("  status   - Check hardware/motivation vitals");
      printLine("  sudo     - Execute command as superuser");
      printLine("  clear    - Clear terminal output");
      printLine("  reboot   - Restart system boot sequence");
      break;
    case 'whoami':
      printLine("kiwi - permanently undefined.", "warning");
      break;
    case 'status':
      printLine("Diagnostics:");
      printLine("- Motivation Core: OFFLINE", "error");
      printLine("- UPS Battery: 4% (Replace immediately)", "warning");
      printLine("- Disappointment Level: 100%");
      break;
    case 'sudo':
      printLine("kiwi is not in the sudoers file. This incident will be reported to absolutely nobody.", "error");
      break;
    case 'clear':
      outputDiv.innerHTML = '';
      break;
    case 'reboot':
      printLine("System going down for reboot NOW...", "warning");
      isTerminalActive = false;
      inputLineDiv.style.display = 'none';
      setTimeout(() => location.reload(), 1000);
      break;
    case 'ls':
    case 'dir':
      printLine("datasets/  scripts/  broken_dreams/  tax_returns_2024.pdf");
      break;
    case 'butts':
    case 'dicks':
      printLine("ERROR: Physiological assets not found in current virtual state.", "error");
      break;
    case 'pony':
    case 'ponies':
      printLine("Connecting to areweponyyet...");
      printLine("ERR_CONNECTION_TIMED_OUT", "error");
      break;
    case 'lewd':
    case 'lewds':
      printLine("Accessing encrypted vault...");
      printLine("ERROR: Directory /home/kiwi/Downloads/furry/nsfw is corrupted.", "error");
      break;
    case 'furry':
      printLine("Species: Unknown Hybrid.");
      printLine("Status: Needs more fluff.", "warning");
      break;
    default:
      printLine(`bash: ${mainCmd}: command not found`, "error");
  }
}

window.onload = () => {
  setTimeout(printBootLines, 800);
};