// NFA for regex: aba + bb + c(aaa + aa + a)*
const nfa = {
    start: 'q0',
    accept: 'q25',
    transitions: {
        'q0': {'ε': ['q1', 'q7', 'q11']},
        'q1': {'a': ['q2']},
        'q2': {'ε': ['q3']},
        'q3': {'b': ['q4']},
        'q4': {'ε': ['q5']},
        'q5': {'a': ['q6']},
        'q6': {'ε': ['q25']},
        'q7': {'b': ['q8']},
        'q8': {'ε': ['q9']},
        'q9': {'b': ['q10']},
        'q10': {'ε': ['q25']},
        'q11': {'c': ['q12']},
        'q12': {'ε': ['q13', 'q15', 'q19', 'q25']},
        'q13': {'a': ['q14']},
        'q14': {'ε': ['q13', 'q25']},
        'q15': {'a': ['q16']},
        'q16': {'ε': ['q17']},
        'q17': {'a': ['q18']},
        'q18': {'ε': ['q15', 'q25']},
        'q19': {'a': ['q20']},
        'q20': {'ε': ['q21']},
        'q21': {'a': ['q22']},
        'q22': {'ε': ['q23']},
        'q23': {'a': ['q24']},
        'q24': {'ε': ['q19', 'q25']},
        'q25': {}
    }
};

// DFA after subset construction
const dfa = {
    start: 'A',
    accept: ['D', 'F', 'G', 'H'],
    transitions: {
        'A': {'a': 'B', 'b': 'C', 'c': 'D'},
        'B': {'a': 'Z', 'b': 'E', 'c': 'Z'},
        'C': {'a': 'Z', 'b': 'F', 'c': 'Z'},
        'D': {'a': 'G', 'b': 'Z', 'c': 'Z'},
        'E': {'a': 'H', 'b': 'Z', 'c': 'Z'},
        'F': {'a': 'Z', 'b': 'Z', 'c': 'Z'},
        'G': {'a': 'G', 'b': 'Z', 'c': 'Z'},
        'H': {'a': 'Z', 'b': 'Z', 'c': 'Z'},
        'Z': {'a': 'Z', 'b': 'Z', 'c': 'Z'}
    }
};

// Minimized DFA
const minDfa = {
    start: 'A',
    accept: ['DG', 'FH'],
    transitions: {
        'A': {'a': 'B', 'b': 'C', 'c': 'DG'},
        'B': {'a': 'Z', 'b': 'E', 'c': 'Z'},
        'C': {'a': 'Z', 'b': 'FH', 'c': 'Z'},
        'E': {'a': 'FH', 'b': 'Z', 'c': 'Z'},
        'DG': {'a': 'DG', 'b': 'Z', 'c': 'Z'},
        'FH': {'a': 'Z', 'b': 'Z', 'c': 'Z'},
        'Z': {'a': 'Z', 'b': 'Z', 'c': 'Z'}
    },
    merged: [
        ['D', 'G'],
        ['F', 'H']
    ]
};

// Initialize Viz.js
let viz = null;

async function initViz() {
    viz = new Viz();
}

// Generate NFA Diagram
async function generateNFADiagram() {
    const dot = `
digraph NFA {
    rankdir=LR;
    node [shape=circle, style=filled, fillcolor="#1a1a2e", fontcolor="#00d4ff", color="#00d4ff", fontname="JetBrains Mono"];
    edge [fontcolor="#00ff9d", color="#00d4ff", fontname="JetBrains Mono"];
    
    start [shape=point, width=0];
    start -> q0[color="#00ff9d"];
    
    // q0 highlighted in GREEN (start state)
    q0 [shape=circle, fillcolor="#00ff9d20", fontcolor="#00ff9d" , color="#00ff9d", penwidth=3, fontweight=bold];
    
    q25 [shape=doublecircle, fillcolor="#00ff9d20", color="#00ff9d", penwidth=2];
    
    q0 -> q1 [label="ε"];
    q0 -> q7 [label="ε"];
    q0 -> q11 [label="ε"];
    
    q1 -> q2 [label="a"];
    q2 -> q3 [label="ε"];
    q3 -> q4 [label="b"];
    q4 -> q5 [label="ε"];
    q5 -> q6 [label="a"];
    q6 -> q25 [label="ε"];
    
    q7 -> q8 [label="b"];
    q8 -> q9 [label="ε"];
    q9 -> q10 [label="b"];
    q10 -> q25 [label="ε"];
    
    q11 -> q12 [label="c"];
    q12 -> q13 [label="ε"];
    q12 -> q15 [label="ε"];
    q12 -> q19 [label="ε"];
    q12 -> q25 [label="ε"];
    
    q13 -> q14 [label="a"];
    q14 -> q13 [label="ε"];
    q14 -> q25 [label="ε"];
    
    q15 -> q16 [label="a"];
    q16 -> q17 [label="ε"];
    q17 -> q18 [label="a"];
    q18 -> q15 [label="ε"];
    q18 -> q25 [label="ε"];
    
    q19 -> q20 [label="a"];
    q20 -> q21 [label="ε"];
    q21 -> q22 [label="a"];
    q22 -> q23 [label="ε"];
    q23 -> q24 [label="a"];
    q24 -> q19 [label="ε"];
    q24 -> q25 [label="ε"];
    
    bgcolor="transparent";
}`;
    try {
        const svg = await viz.renderString(dot);
        document.getElementById('nfa-diagram').innerHTML = svg;
    } catch (error) {
        console.error('Error rendering NFA:', error);
        document.getElementById('nfa-diagram').innerHTML = '<div style="color: #ff4444;">Error rendering diagram</div>';
    }
}

// Generate DFA Diagram
async function generateDFADiagram() {
    const dot = `
digraph DFA {
    rankdir=LR;
    node [shape=circle, style=filled, fillcolor="#1a1a2e", fontcolor="#00d4ff", color="#00d4ff", fontname="JetBrains Mono"];
    edge [fontcolor="#00ff9d", color="#00d4ff", fontname="JetBrains Mono"];
    
    start [shape=point, width=0];
    start -> A[color="#00ff9d"];
    
    A [shape=circle, fillcolor="#00ff9d20", fontcolor="#00ff9d" , color="#00ff9d", penwidth=3, fontweight=bold];

    D [shape=doublecircle, fillcolor="#00ff9d20", color="#00ff9d", penwidth=2];
    F [shape=doublecircle, fillcolor="#00ff9d20", color="#00ff9d", penwidth=2];
    G [shape=doublecircle, fillcolor="#00ff9d20", color="#00ff9d", penwidth=2];
    H [shape=doublecircle, fillcolor="#00ff9d20", color="#00ff9d", penwidth=2];

    A -> B [label="a"];
    A -> C [label="b"];
    A -> D [label="c"];
    
    B -> E [label="b"];
    C -> F [label="b"];
    D -> G [label="a"];
    E -> H [label="a"];
    G -> G [label="a"];

    B -> Z [label="a,c"];
    C -> Z [label="a,c"];
    D -> Z [label="b,c"];
    E -> Z [label="b,c"];
    F -> Z [label="a,b,c"];
    G -> Z [label="b,c"];
    H -> Z [label="a,b,c"];
    Z -> Z [label="a,b,c"];
    
    bgcolor="transparent";
}`;
    
    try {
        const svg = await viz.renderString(dot);
        document.getElementById('dfa-diagram').innerHTML = svg;
    } catch (error) {
        console.error('Error rendering DFA:', error);
        document.getElementById('dfa-diagram').innerHTML = '<div style="color: #ff4444;">Error rendering diagram</div>';
    }
}

// Generate Minimized DFA Diagram
async function generateMinDFADiagram() {
    const dot = `
digraph MinDFA {
    rankdir=LR;
    node [shape=circle, style=filled, fillcolor="#1a1a2e", fontcolor="#00d4ff", color="#00d4ff", fontname="JetBrains Mono"];
    edge [fontcolor="#00ff9d", color="#00d4ff", fontname="JetBrains Mono"];
    
    start [shape=point, width=0];
    start -> A[color="#00ff9d"];

    A [shape=circle, fillcolor="#00ff9d20", fontcolor="#00ff9d" , color="#00ff9d", penwidth=3, fontweight=bold];
    
    DG [shape=doublecircle, fillcolor="#00ff9d20", color="#00ff9d", penwidth=2, label="D,G"];
    FH [shape=doublecircle, fillcolor="#00ff9d20", color="#00ff9d", penwidth=2, label="F,H"];
    
    A -> B [label="a"];
    A -> C [label="b"];
    A -> DG [label="c"];
    
    B -> E [label="b"];
    B -> Z [label="a,c"];
    
    C -> FH [label="b"];
    C -> Z [label="a,c"];
    
    E -> FH [label="a"];
    E -> Z [label="b,c"];
    
    DG -> DG [label="a"];
    DG -> Z [label="b,c"];
    
    FH -> Z [label="a,b,c"];
    Z -> Z [label="a,b,c"];
    
    bgcolor="transparent";
}`;
    
    try {
        const svg = await viz.renderString(dot);
        document.getElementById('min-diagram').innerHTML = svg;
    } catch (error) {
        console.error('Error rendering Minimized DFA:', error);
        document.getElementById('min-diagram').innerHTML = '<div style="color: #ff4444;">Error rendering diagram</div>';
    }
}

// Render NFA Table
function renderNFATable() {
    const symbols = ['a', 'b', 'c', 'ε'];
    const states = Object.keys(nfa.transitions).sort((a, b) => {
        const numA = parseInt(a.substring(1));
        const numB = parseInt(b.substring(1));
        return numA - numB;
    });

    let html = '<table><thead><tr><th>State</th>';
    symbols.forEach(sym => html += `<th>${sym}</th>`);
    html += '</tr></thead><tbody>';

    states.forEach(state => {
        const isStart = state === nfa.start;
        const isAccept = state === nfa.accept;
        html += `<tr>`;
        html += `<td class="${isStart ? 'start-state' : ''} ${isAccept ? 'accept-state' : ''}">${state}</td>`;
        symbols.forEach(sym => {
            const targets = nfa.transitions[state]?.[sym] || [];
            html += `<td>${targets.join(', ') || '∅'}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('nfa-table').innerHTML = html;
}

// Render DFA Table
function renderDFATable() {
    const symbols = ['a', 'b', 'c'];
    const states = Object.keys(dfa.transitions).sort();

    let html = '<table><thead><tr><th>State</th>';
    symbols.forEach(sym => html += `<th>${sym}</th>`);
    html += '</tr></thead><tbody>';

    states.forEach(state => {
        const isStart = state === dfa.start;
        const isAccept = dfa.accept.includes(state);
        html += `<tr>`;
        html += `<td class="${isStart ? 'start-state' : ''} ${isAccept ? 'accept-state' : ''}">${state}</td>`;
        symbols.forEach(sym => {
            const target = dfa.transitions[state]?.[sym] || '∅';
            html += `<td>${target}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('dfa-table').innerHTML = html;
}

// Render Minimized DFA Table
function renderMinDFATable() {
    const symbols = ['a', 'b', 'c'];
    const states = Object.keys(minDfa.transitions).sort();

    let html = '<table><thead><tr><th>State</th>';
    symbols.forEach(sym => html += `<th>${sym}</th>`);
    html += '</tr></thead><tbody>';

    states.forEach(state => {
        const isStart = state === minDfa.start;
        const isAccept = minDfa.accept.includes(state);
        html += `<tr>`;
        html += `<td class="${isStart ? 'start-state' : ''} ${isAccept ? 'accept-state' : ''}">${state}</td>`;
        symbols.forEach(sym => {
            const target = minDfa.transitions[state]?.[sym] || '∅';
            html += `<td>${target}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('min-table').innerHTML = html;

    // Show merged states
    let mergedHtml = '<div class="card" style="background: rgba(0, 212, 255, 0.05); border-color: var(--primary);"><div class="card-body">';
    mergedHtml += '<h5 style="color: var(--primary); margin-bottom: 1rem;">Merged State Groups:</h5>';
    minDfa.merged.forEach(group => {
        const minState = group[0] + ',' + group[1];
        mergedHtml += `<div style="padding: 0.5rem; color: var(--text-light); font-family: 'JetBrains Mono', monospace;"><strong>${minState}:</strong> ${group.join(', ')}</div>`;
    });
    mergedHtml += '</div></div>';
    document.getElementById('merged-states').innerHTML = mergedHtml;
}

// Simulate string
function simulateString() {
    const input = document.getElementById('test-string').value.trim();
    if (!input) {
        alert('Please enter a test string!');
        return;
    }

    const steps = [];
    let currentState = minDfa.start;
    steps.push({state: currentState, symbol: '', status: 'Start'});

    for (let i = 0; i < input.length; i++) {
        const symbol = input[i];
        const nextState = minDfa.transitions[currentState]?.[symbol];

        if (!nextState || nextState === '∅') {
            steps.push({state: currentState, symbol, status: 'Rejected ✗', final: true});
            renderSimulation(steps, false);
            return;
        }

        currentState = nextState;
        steps.push({state: currentState, symbol, status: 'Processing'});
    }

    const accepted = minDfa.accept.includes(currentState);
    steps[steps.length - 1].status = accepted ? 'Accepted ✓' : 'Rejected ✗';
    steps[steps.length - 1].final = true;
    renderSimulation(steps, accepted);
}

function renderSimulation(steps, accepted) {
    let html = '';
    steps.forEach((step, idx) => {
        const isLast = idx === steps.length - 1;
        const statusClass = step.final ? (accepted ? 'accepted' : 'rejected') : '';
        
        html += `<div class="step-item">`;
        html += `<div class="step-state">${step.state}</div>`;
        if (step.symbol) {
            html += `<div class="step-arrow">→</div>`;
            html += `<div class="step-symbol">'${step.symbol}'</div>`;
        }
        html += `<div class="step-status ${statusClass}">${step.status}</div>`;
        html += `</div>`;
    });

    document.getElementById('simulation-steps').innerHTML = html;
}

function quickTest(str) {
    document.getElementById('test-string').value = str;
    simulateString();
}

// Initialize everything
async function init() {
    await initViz();
    renderNFATable();
    renderDFATable();
    renderMinDFATable();
    await generateNFADiagram();
    await generateDFADiagram();
    await generateMinDFADiagram();
}

// Run initialization when page loads
window.addEventListener('load', init);
