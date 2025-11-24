import { createMachine, assign } from 'xstate';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Mock Page type for visualization purposes
 */
type MockPage = null;

/**
 * Creates a login machine definition for visualization (without Page dependency)
 */
const createLoginMachineForViz = () => {
  return createMachine({
    id: 'loginMachine',
    initial: 'initial',
    context: {
      page: null as MockPage,
      username: '',
      password: '',
    },
    states: {
      initial: {
        on: {
          NAVIGATE_TO_LOGIN: {
            target: 'loginPage',
          },
        },
      },
      loginPage: {
        on: {
          SUBMIT_VALID_CREDENTIALS: {
            target: 'securePage',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
            }),
          },
          SUBMIT_INVALID_USERNAME: {
            target: 'loginPageWithError',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              errorMessage: () => 'Invalid username.',
            }),
          },
          SUBMIT_INVALID_PASSWORD: {
            target: 'loginPageWithError',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              errorMessage: () => 'Invalid password.',
            }),
          },
        },
      },
      securePage: {
        type: 'final',
      },
      loginPageWithError: {
        type: 'final',
      },
    },
  });
};

/**
 * Creates a registration machine definition for visualization (without Page dependency)
 */
const createRegisterMachineForViz = () => {
  return createMachine({
    id: 'registerMachine',
    initial: 'initial',
    context: {
      page: null as MockPage,
      username: '',
      password: '',
      confirmPassword: '',
    },
    states: {
      initial: {
        on: {
          NAVIGATE_TO_REGISTER: {
            target: 'registerPage',
          },
        },
      },
      registerPage: {
        on: {
          SUBMIT_VALID_REGISTRATION: {
            target: 'loginPage',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              confirmPassword: (_, event) => event.confirmPassword,
            }),
          },
          SUBMIT_MISSING_USERNAME: {
            target: 'registerPageWithError',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              confirmPassword: (_, event) => event.confirmPassword,
              errorMessage: () => 'All fields are required.',
            }),
          },
          SUBMIT_MISSING_PASSWORD: {
            target: 'registerPageWithError',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              confirmPassword: (_, event) => event.confirmPassword,
              errorMessage: () => 'All fields are required.',
            }),
          },
          SUBMIT_NON_MATCHING_PASSWORDS: {
            target: 'registerPageWithError',
            actions: assign({
              username: (_, event) => event.username,
              password: (_, event) => event.password,
              confirmPassword: (_, event) => event.confirmPassword,
              errorMessage: () => 'Passwords do not match.',
            }),
          },
        },
      },
      loginPage: {
        type: 'final',
      },
      registerPageWithError: {
        type: 'final',
      },
    },
  });
};

/**
 * Generates Mermaid diagram syntax for a state machine
 */
function generateMermaidDiagram(
  machine: ReturnType<typeof createMachine>
): string {
  const states = Object.keys(machine.config.states || {});
  const initial = machine.config.initial || 'initial';
  const lines: string[] = ['stateDiagram-v2', '    [*] --> ' + initial];

  for (const [stateName, stateConfig] of Object.entries(
    machine.config.states || {}
  )) {
    if (stateConfig.type === 'final') {
      lines.push(`    ${stateName} --> [*]`);
    } else if (stateConfig.on) {
      for (const [eventName, transition] of Object.entries(stateConfig.on)) {
        if (typeof transition === 'object' && transition.target) {
          lines.push(`    ${stateName} --> ${transition.target}: ${eventName}`);
        }
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generates a JSON representation suitable for XState Visualizer
 */
function generateVisualizerJSON(
  machine: ReturnType<typeof createMachine>
): string {
  return JSON.stringify(machine.config, null, 2);
}

/**
 * Main execution
 */
function main() {
  const outputDir = join(__dirname, '..', 'visualizations');

  // Create output directory if it doesn't exist
  try {
    require('fs').mkdirSync(outputDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  // Generate visualizations for login machine
  const loginMachine = createLoginMachineForViz();
  const loginMermaid = generateMermaidDiagram(loginMachine);
  const loginJSON = generateVisualizerJSON(loginMachine);

  writeFileSync(join(outputDir, 'login-machine.mmd'), loginMermaid);
  writeFileSync(join(outputDir, 'login-machine.json'), loginJSON);

  // Generate visualizations for register machine
  const registerMachine = createRegisterMachineForViz();
  const registerMermaid = generateMermaidDiagram(registerMachine);
  const registerJSON = generateVisualizerJSON(registerMachine);

  writeFileSync(join(outputDir, 'register-machine.mmd'), registerMermaid);
  writeFileSync(join(outputDir, 'register-machine.json'), registerJSON);

  // Generate HTML file with embedded Mermaid diagrams
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>State Machine Visualizations</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .machine-container {
            background: white;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        h2 {
            color: #555;
            margin-top: 0;
        }
        .mermaid {
            background: white;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .instructions {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 16px;
            margin-bottom: 24px;
            border-radius: 4px;
        }
        .instructions h3 {
            margin-top: 0;
            color: #1976D2;
        }
        .instructions code {
            background: #fff;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <h1>🎭 State Machine Visualizations</h1>
    
    <div class="instructions">
        <h3>📖 How to Use</h3>
        <p><strong>Option 1: View Mermaid Diagrams</strong> - The diagrams below are interactive and rendered using Mermaid.js</p>
        <p><strong>Option 2: XState Visualizer</strong> - Copy the JSON from <code>visualizations/*.json</code> files and paste into <a href="https://stately.ai/viz" target="_blank">stately.ai/viz</a></p>
        <p><strong>Option 3: Mermaid Live Editor</strong> - Copy the content from <code>visualizations/*.mmd</code> files and paste into <a href="https://mermaid.live" target="_blank">mermaid.live</a></p>
    </div>

    <div class="machine-container">
        <h2>🔐 Login State Machine</h2>
        <div class="mermaid">
${loginMermaid}
        </div>
    </div>

    <div class="machine-container">
        <h2>📝 Registration State Machine</h2>
        <div class="mermaid">
${registerMermaid}
        </div>
    </div>
</body>
</html>`;

  writeFileSync(join(outputDir, 'index.html'), htmlContent);

  console.log('✅ State machine visualizations generated successfully!');
  console.log('\n📁 Output files:');
  console.log(
    `   - ${join(outputDir, 'index.html')} (Interactive HTML with Mermaid diagrams)`
  );
  console.log(`   - ${join(outputDir, 'login-machine.mmd')} (Mermaid diagram)`);
  console.log(
    `   - ${join(outputDir, 'login-machine.json')} (XState Visualizer format)`
  );
  console.log(
    `   - ${join(outputDir, 'register-machine.mmd')} (Mermaid diagram)`
  );
  console.log(
    `   - ${join(outputDir, 'register-machine.json')} (XState Visualizer format)`
  );
  console.log('\n🌐 Open the HTML file in your browser to view the diagrams!');
  console.log(
    '   Or visit https://stately.ai/viz and paste the JSON content for interactive visualization.'
  );
}

main();
