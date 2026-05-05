// --- DOM ELEMENTS ---
const outputDiv = document.getElementById('output');
const contentContainer = document.querySelector('.terminal-content');
const inputLineDiv = document.getElementById('input-line');
const hiddenInput = document.getElementById('hidden-input');
const cmdText = document.getElementById('cmd-text');
const cursor = document.getElementById('cursor');

// --- STATE VARIABLES ---
let lineIndex = 0;
let isTerminalActive = false;

// --- UTILITIES ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// --- CORE TERMINAL UI FUNCTIONS ---
function printLine(text, cssClass = '') {
  const lineElem = document.createElement('div');
  lineElem.className = 'line ' + cssClass;
  
  lineElem.textContent = text === "" ? '\u00A0' : text;
  
  outputDiv.appendChild(lineElem);
  trimBuffer(); 
}

function typeLine(text, cssClass = '') {
  return new Promise(resolve => {
    const lineElem = document.createElement('div');
    lineElem.className = 'line ' + cssClass;

    outputDiv.appendChild(lineElem);

    let charIndex = 0;
    
    function typeChar() {
      if (charIndex < text.length) {
        lineElem.textContent += text.charAt(charIndex);
        charIndex++;
        trimBuffer(); // Check height during typing
        
        let nextDelay = 60;
        if (text.charAt(charIndex - 1) === '.') {
            nextDelay = 600; 
        }
        setTimeout(typeChar, nextDelay);
      } else {
        resolve();
      }
    }
    typeChar();
  });
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
  img.onload = () => trimBuffer();
  
  // If the image fails to load, print an error
  img.onerror = () => {
    printLine(`ERROR: Could not render visual data from ${url}`, "error");
    wrapper.remove();
  };
}

function printIframe(url) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.className = 'terminal-iframe';
  iframe.setAttribute('allow', 'autoplay; fullscreen');
  
  const wrapper = document.createElement('div');
  wrapper.className = 'line';
  wrapper.appendChild(iframe);
  outputDiv.appendChild(wrapper);

  iframe.onload = () => trimBuffer();
  
  iframe.onerror = () => {
    printLine(`ERROR: Could not connect to ${url}`, "error");
    wrapper.remove();
  };
}

// --- BOOT SEQUENCE LOGIC ---
const bootSequence = [
  { text: "Nyxium OS v3.11 (x86_64 kernel)" },
  { text: "Initializing system hardware..." },
  { text: "Detecting GPU..................... NVIDIA RTX 4090" },
  { text: "Checking video memory............. 24GB [ OK ]" },
  { text: "Setting display mode.............. 8-Bit Retro [ OK ]" },
  { text: "" },
  { text: "Welcome to Nyxium Network Systems" },
  { text: "" },
  { text: "[  OK  ] Initializing system drivers." },
  { text: "[  OK  ] Mounting storage partitions." },
  { text: "[  OK  ] Starting VR network services." },
  { text: "[FAILED] Connecting to pfSense security uplink.", cssClass: "error" },
  { text: "WARNING: Network is running in unprotected mode.", cssClass: "warning" },
  { text: "[  OK  ] Reached target: Multi-User System." },
  { text: "" },
  { text: "[[ Power Diagnostic ]]" },
  { text: "UPS Status: Battery at 4% capacity." },
  { text: "WARNING: UPS battery is degraded. Replace immediately.", cssClass: "warning" },
  { text: "" },
  { text: "[[ User Session ]]" },
  { text: "Establishing session for: kiwi" },
  { text: "Checking administrator permissions..." },
  { text: "ERROR: Motivation core failed to initialize.", cssClass: "error" },
  { text: "Kernel panic: System state is 'depressed'.", cssClass: "error" },
  { text: "Dumping error logs to memory..." },
  { text: "Attempting to find a restore point..." }
];

const finalMessage = "No functional state ever existed for [kiwi].";

function printBootLines() {
  if (lineIndex < bootSequence.length) {
    const lineItem = bootSequence[lineIndex];
    printLine(lineItem.text, lineItem.cssClass || '');
    lineIndex++;
    
    const delay = lineItem.text === "..." ? 800 : (Math.random() * 150 + 20);
    setTimeout(printBootLines, delay);
  } else {
    setTimeout(typeFinalMessage, 1200);
  }
}

function typeFinalMessage() {
  printLine(""); 
  typeLine(finalMessage).then(() => {
    setTimeout(activateTerminal, 1000);
  });
}

function activateTerminal() {
  printLine("");
  inputLineDiv.style.display = 'block';
  isTerminalActive = true;
  hiddenInput.focus();
  trimBuffer();
}

// --- COMMAND PROCESSING ---
const commands = {
  help: async () => {
    printLine("Nyxium Systems Shell - Available Commands:");
    printLine("  whoami   - Print current user status");
    printLine("  status   - Check hardware/motivation vitals");
    printLine("  sudo     - Execute command as superuser");
    printLine("  clear    - Clear terminal output");
    printLine("  reboot   - Restart system boot sequence");
    printLine("  say      - Prints text character-by-character");
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
  say: async (args) => {
    const msg = args.slice(1).join(' ');
    if (msg) {
      await typeLine(msg);
    } else {
      printLine("Usage: say [message]", "error");
    }
  },
  print: async (args) => {
    await commands.say(args);
  },
  ls: async () => {
    printLine("datasets/  scripts/  broken_dreams/  tax_returns_2024.pdf");
  },
  dir: async () => {
    await commands.ls();
  },
  butts: async () => {
    printLine("ERROR: Physiological assets not found in current virtual state.", "error");
  },
  dicks: async () => {
    await commands.butts();
  },
  pony: async (args) => {
    const path = args[1] ? `/${args[1]}` : '';
    printLine(`Connecting to areweponyyet.com${path}...`);
    await sleep(1000);
    printIframe(`https://areweponyyet.com${path}`);
  },
  ponies: async (args) => {
    await commands.pony(args);
  },
  lewd: async () => {
    printLine("Accessing encrypted vault...");
    await sleep(2000);
    printLine("ERROR: Directory /home/kiwi/Downloads/furry/nsfw is corrupted.", "error");
  },
  lewds: async () => {
    await commands.lewd();
  },
  porn: async () => {
    await commands.lewd();
  },
  nyx: async () => {
    printLine(`Loading visual data...`);
    await sleep(1000);
    printImage("https://static1.e621.net/data/32/a4/32a46a95af503b20d6b70e17f7aafa83.jpg");
  },
  furry: async () => {
    await commands.nyx();
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

async function processCommand(cmd) {
  const args = cmd.split(' ');
  const mainCmd = args[0].toLowerCase();

  if (!mainCmd) return;

  await sleep(150);

  const commandFunc = commands[mainCmd];
  if (commandFunc) {
    await commandFunc(args);
  } else {
    printLine(`bash: ${mainCmd}: command not found`, "error");
  }
}

// --- EVENT LISTENERS ---
// Re-trim on window resize to ensure nothing is cut off
window.addEventListener('resize', trimBuffer);

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
hiddenInput.addEventListener('keydown', async (e) => {
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

// --- INITIALIZATION ---
window.onload = () => {
  console.log("window.onload fired");
  setTimeout(printBootLines, 800);
};