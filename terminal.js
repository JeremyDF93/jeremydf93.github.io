const outputDiv = document.getElementById('output');
const contentContainer = document.querySelector('.terminal-content');
const inputLineDiv = document.getElementById('input-line');
const hiddenInput = document.getElementById('hidden-input');
const cmdText = document.getElementById('cmd-text');
const cursor = document.getElementById('cursor');

let lineIndex = 0;
let isTerminalActive = false;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const bootSequence = [
  "Nyxium OS v3.11 (x86_64 kernel)",
  "Initializing system hardware...",
  "Detecting GPU..................... NVIDIA RTX 4090",
  "Checking video memory............. 24GB [ OK ]",
  "Setting display mode.............. 8-Bit Retro [ OK ]",
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

function printImage(url) {
  const img = document.createElement('img');
  img.src = url;
  img.className = 'terminal-img';
  
  // Create a wrapper to help with spacing
  const wrapper = document.createElement('div');
  wrapper.className = 'line';
  wrapper.appendChild(img);
  outputDiv.appendChild(wrapper);

  // Wait for the image to actually have dimensions before trimming
  img.onload = () => {
    trimBuffer();
  };
  
  // If the image fails to load, print an error
  img.onerror = () => {
    printLine(`ERROR: Could not render visual data from ${url}`, "error");
    wrapper.remove();
  };
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

// Handle hitting Enter
hiddenInput.addEventListener('keydown', async (e) => { // Added async here
  if (e.key === 'Enter' && isTerminalActive) {
    const cmd = hiddenInput.value.trim();
    
    // 1. Echo the command
    printLine(`kiwi@nyxium.io:~$ ${cmd}`);
    
    // 2. Clear and hide the input line so it doesn't show during pauses
    hiddenInput.value = '';
    cmdText.textContent = '';
    inputLineDiv.style.display = 'none'; 
    isTerminalActive = false; // Lock input during processing

    // 3. Wait for the command to fully finish processing
    await processCommand(cmd);
    
    // 4. Bring the input line back once processing is done
    inputLineDiv.style.display = 'block';
    isTerminalActive = true;
    hiddenInput.focus();
    trimBuffer();
  }
});

const commands = {
  help: async () => {
    printLine("Nyxium Systems Shell - Available Commands:");
    printLine("  whoami   - Print current user status");
    printLine("  status   - Check hardware/motivation vitals");
    printLine("  sudo     - Execute command as superuser");
    printLine("  clear    - Clear terminal output");
    printLine("  reboot   - Restart system boot sequence");
  },
  whoami: async () => {
    printLine("kiwi - permanently undefined.", "warning");
  },
  status: async () => {
    printLine("Diagnostics:");
    printLine("- Motivation Core: OFFLINE", "error");
    printLine("- UPS Battery: 4% (Replace immediately)", "warning");
    printLine("- Disappointment Level: 100%");
  },
  sudo: async () => {
    printLine("kiwi is not in the sudoers file. This incident will be reported to absolutely nobody.", "error");
  },
  clear: async () => {
    outputDiv.innerHTML = '';
  },
  reboot: async () => {
    printLine("System going down for reboot NOW...", "warning");
    isTerminalActive = false;
    inputLineDiv.style.display = 'none';
    setTimeout(() => location.reload(), 1000);
  },
  ls: async () => {
    printLine("datasets/  scripts/  broken_dreams/  tax_returns_2024.pdf");
  },
  dir: async () => {
    await commands.ls(); // Alias
  },
  butts: async () => {
    printLine("ERROR: Physiological assets not found in current virtual state.", "error");
  },
  dicks: async () => {
    await commands.butts(); // Alias
  },
  pony: async () => {
    printLine("Connecting to areweponyyet.com...");
    await sleep(5000);
    printLine("ERR_CONNECTION_TIMED_OUT", "error");
  },
  ponies: async () => {
    await commands.pony(); // Alias
  },
  lewd: async () => {
    printLine("Accessing encrypted vault...");
    await sleep(2000);
    printLine("ERROR: Directory /home/kiwi/Downloads/furry/nsfw is corrupted.", "error");
  },
  lewds: async () => {
    await commands.lewd(); // Alias
  },
  porn: async () => {
    await commands.lewd(); // Alias
  },
  nyx: async () => {
    printLine(`Loading visual data...`);
    await sleep(1000);
    printImage("https://static1.e621.net/data/32/a4/32a46a95af503b20d6b70e17f7aafa83.jpg");
  },
  furry: async () => {
    await commands.nyx(); // Alias
  },
  image: async (args) => {
    if (args[1]) {
      printLine(`Loading visual data from ${args[1]}...`);
      await sleep(1000);
      printImage(args[1]);
    } else {
      printLine("Usage: image [url]", "error");
    }
  }
};

window.onload = () => {
  console.log("window.onload fired");
  setTimeout(printBootLines, 800);
};

async function processCommand(cmd) {
  const args = cmd.toLowerCase().split(' ');
  const mainCmd = args[0];

  if (!mainCmd) return;

  await sleep(150);

  const commandFunc = commands[mainCmd];
  if (commandFunc) {
    await commandFunc(args);
  } else {
    printLine(`bash: ${mainCmd}: command not found`, "error");
  }
}

window.onload = () => {
  console.log("window.onload fired");
  setTimeout(printBootLines, 800);
};