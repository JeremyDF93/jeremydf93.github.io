const bootSequence = [
  "Arch Linux Boot Loader v3.11",
  "Host: nyxium.io",
  "Hardware detection initiated...",
  "GPU: NVIDIA GeForce RTX 4090 found.",
  "",
  "[  OK  ] Mounting file systems...",
  "[  OK  ] Loading AI image datasets...",
  "[  OK  ] Compiling Udon VRChat scripts...",
  "[FAILED] Initializing pfSense network...",
  "ERROR: Management IP incorrectly requesting DHCP from tagged VLAN 10.",
  "Bypassing network protocol...",
  "",
  "Diagnosing power systems...",
  "Querying APC Smart-UPS via USB...",
  "WARNING: Battery capacity at 4%.",
  "Power redundancy non-existent. Living on the edge.",
  "",
  "Attempting to load site administrator profile...",
  "Kernel panic - not syncing: Motivation core not found. Dumping memory...",
  "",
  "Memory successfully dumped...",
  "Searching for restore point..."
];

const finalMessage = "No functional state ever existed for [kiwi].";

const outputDiv = document.getElementById('output');
const inputLineDiv = document.getElementById('input-line');
const hiddenInput = document.getElementById('hidden-input');
const cmdText = document.getElementById('cmd-text');
const cursor = document.getElementById('cursor');

let lineIndex = 0;
let isTerminalActive = false;

// THE HARDWARE BUFFER MANAGER
// Deletes old lines so the DOM doesn't grow infinitely
function trimBuffer() {
  const maxLines = 35; // Adjust this if you want more/less history kept in memory
  while (outputDiv.childElementCount > maxLines) {
    outputDiv.removeChild(outputDiv.firstChild);
  }
}

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
  trimBuffer(); // Clean up old memory
}

function activateTerminal() {
  printLine("");
  inputLineDiv.style.display = 'block';
  isTerminalActive = true;
  hiddenInput.focus();
}

// --- INTERACTIVE TERMINAL LOGIC ---

document.addEventListener('click', () => {
  if (isTerminalActive) hiddenInput.focus();
});

hiddenInput.addEventListener('input', (e) => {
  cmdText.textContent = e.target.value;
  cursor.classList.add('typing');
  
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
    default:
      printLine(`bash: ${mainCmd}: command not found`, "error");
  }
}

window.onload = () => {
  setTimeout(printBootLines, 800);
};
