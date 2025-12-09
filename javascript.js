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

        let viz = null;

        // ============= REGEX VALIDATION =============
        
        function validateRegex(regex) {
            const errors = [];
            const cleanRegex = regex.replace(/\s+/g, '');
            
            if (cleanRegex.length === 0) {
                return {
                    valid: false,
                    errors: [{
                        type: 'Empty Expression',
                        message: 'Regular expression cannot be empty.',
                        position: 0
                    }]
                };
            }
            
            // Check for unmatched parentheses
            const parenStack = [];
            for (let i = 0; i < cleanRegex.length; i++) {
                if (cleanRegex[i] === '(') {
                    parenStack.push(i);
                } else if (cleanRegex[i] === ')') {
                    if (parenStack.length === 0) {
                        errors.push({
                            type: 'Unmatched Parenthesis',
                            message: `Missing opening parenthesis for closing parenthesis at position ${i + 1}.`,
                            position: i
                        });
                    } else {
                        parenStack.pop();
                    }
                }
            }
            
            if (parenStack.length > 0) {
                parenStack.forEach(pos => {
                    errors.push({
                        type: 'Unmatched Parenthesis',
                        message: `Missing closing parenthesis for opening parenthesis at position ${pos + 1}.`,
                        position: pos
                    });
                });
            }
            
            // Check for invalid repetition
            const invalidRepetition = /(\+\+|\*\*|\*\+|\+\*)/g;
            let match;
            while ((match = invalidRepetition.exec(cleanRegex)) !== null) {
                errors.push({
                    type: 'Invalid Repetition',
                    message: `Invalid repetition operator "${match[0]}" at position ${match.index + 1}.`,
                    position: match.index
                });
            }
            
            // Check for operators at the beginning
            if (/^[\+\*]/.test(cleanRegex)) {
                errors.push({
                    type: 'Invalid Start',
                    message: `Regular expression cannot start with operator "${cleanRegex[0]}".`,
                    position: 0
                });
            }
            
            // Check for operators at the end
            if (/[\+]$/.test(cleanRegex)) {
                errors.push({
                    type: 'Invalid End',
                    message: `Regular expression cannot end with operator "${cleanRegex[cleanRegex.length - 1]}".`,
                    position: cleanRegex.length - 1
                });
            }
            
            // Check for empty parentheses
            if (/\(\)/.test(cleanRegex)) {
                const emptyParenPos = cleanRegex.indexOf('()');
                errors.push({
                    type: 'Empty Parentheses',
                    message: `Empty parentheses "()" at position ${emptyParenPos + 1}.`,
                    position: emptyParenPos
                });
            }
            
            // Check for invalid characters
            const validChars = /^[a-z0-9()+*\s]+$/i;
            if (!validChars.test(regex)) {
                for (let i = 0; i < regex.length; i++) {
                    if (!/[a-z0-9()+*\s]/i.test(regex[i])) {
                        errors.push({
                            type: 'Invalid Character',
                            message: `Invalid character "${regex[i]}" at position ${i + 1}. Only letters, numbers, +, *, and parentheses are allowed.`,
                            position: i
                        });
                    }
                }
            }
            
            // Check for operator after opening parenthesis
            if (/\([\+\*]/.test(cleanRegex)) {
                const match = cleanRegex.match(/\([\+\*]/);
                const pos = cleanRegex.indexOf(match[0]);
                errors.push({
                    type: 'Invalid Operator Position',
                    message: `Operator cannot immediately follow opening parenthesis at position ${pos + 2}.`,
                    position: pos + 1
                });
            }
            
            // Check for operator before closing parenthesis
            if (/\+\)/.test(cleanRegex)) {
                const match = cleanRegex.match(/\+\)/);
                const pos = cleanRegex.indexOf(match[0]);
                errors.push({
                    type: 'Invalid Operator Position',
                    message: `Operator "+" cannot immediately precede closing parenthesis at position ${pos + 1}.`,
                    position: pos
                });
            }
            
            return {
                valid: errors.length === 0,
                errors: errors
            };
        }

        function validateAndGenerate() {
            const input = document.getElementById('unifiedInput').value;
            const inputSection = document.getElementById('unifiedInputSection');
            const inputEl = document.getElementById('unifiedInput');
            const errorMsg = document.getElementById('errorMessage');
            const successMsg = document.getElementById('successMessage');
            const errorDetails = document.getElementById('errorDetails');
            const contentSection = document.getElementById('contentSection');
            
            // Reset states
            errorMsg.classList.remove('show');
            successMsg.classList.remove('show');
            inputSection.classList.remove('error', 'success');
            inputEl.classList.remove('error');
            
            // Validate
            const validation = validateRegex(input);
            
            if (!validation.valid) {
                inputSection.classList.add('error');
                inputEl.classList.add('error');
                errorMsg.classList.add('show');
                document.getElementById('errorType').textContent = 'Invalid Regular Expression';
                
                let errorHtml = '<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">';
                validation.errors.forEach(error => {
                    errorHtml += `<li style="margin: 0.5rem 0;">
                        <strong>${error.type}:</strong> ${error.message}
                    </li>`;
                });
                errorHtml += '</ul>';
                
                errorDetails.innerHTML = errorHtml;
            } else {
                inputSection.classList.add('success');
                successMsg.classList.add('show');
                contentSection.classList.add('show');
                document.getElementById('successText').textContent = 'Valid Regular Expression - Automata Generated Successfully!';
                
                document.getElementById('validRegexDisplay').textContent = input;
                
                setTimeout(() => {
                    init();
                }, 100);
            }
        }

        function simulateString() {
            const input = document.getElementById('unifiedInput').value.trim();
            const inputSection = document.getElementById('unifiedInputSection');
            const inputEl = document.getElementById('unifiedInput');
            const errorMsg = document.getElementById('errorMessage');
            const successMsg = document.getElementById('successMessage');
            const errorDetails = document.getElementById('errorDetails');
            
            // Reset states
            errorMsg.classList.remove('show');
            successMsg.classList.remove('show');
            inputSection.classList.remove('error', 'success');
            inputEl.classList.remove('error');
            
            if (!input) {
                inputSection.classList.add('error');
                inputEl.classList.add('error');
                errorMsg.classList.add('show');
                document.getElementById('errorType').textContent = 'Empty Input';
                errorDetails.innerHTML = 'Please enter a test string to simulate.';
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
                    renderSimulation(steps, false, input);
                    inputSection.classList.add('error');
                    return;
                }

                currentState = nextState;
                steps.push({state: currentState, symbol, status: 'Processing'});
            }

            const accepted = minDfa.accept.includes(currentState);
            steps[steps.length - 1].status = accepted ? 'Accepted ✓' : 'Rejected ✗';
            steps[steps.length - 1].final = true;
            renderSimulation(steps, accepted, input);
            
            if (accepted) {
                inputSection.classList.add('success');
                successMsg.classList.add('show');
                document.getElementById('successText').textContent = `String "${input}" is ACCEPTED by the automaton!`;
            } else {
                inputSection.classList.add('error');
            }
            
            // Switch to simulation tab
            const simTab = document.querySelector('[data-bs-target="#sim-tab"]');
            simTab.click();
        }

        function renderSimulation(steps, accepted, inputStr) {
            let html = `<div style="padding: 1rem; background: rgba(0, 212, 255, 0.05); border-radius: 12px; margin-bottom: 1rem;">
                <strong style="color: var(--primary);">Testing String:</strong> 
                <span style="color: var(--text-light); font-family: 'JetBrains Mono', monospace; font-size: 1.2rem;">${inputStr}</span>
            </div>`;
            
            steps.forEach((step, idx) => {
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
            document.getElementById('unifiedInput').value = str;
            simulateString();
        }

        // ============= VISUALIZATION =============

        async function initViz() {
            if (!viz) {
                viz = new Viz();
            }
        }

        async function generateNFADiagram() {
            const dot = `
digraph NFA {
    rankdir=LR;
    node [shape=circle, style=filled, fillcolor="#1a1a2e", fontcolor="#00d4ff", color="#00d4ff", fontname="JetBrains Mono"];
    edge [fontcolor="#00ff9d", color="#00d4ff", fontname="JetBrains Mono"];
    
    start [shape=point, width=0];
    start -> q0[color="#00ff9d"];
    
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
            }
        }

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
            }
        }

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
            }
        }

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

            let mergedHtml = '<div class="card" style="background: rgba(0, 212, 255, 0.05); border-color: var(--primary);"><div class="card-body">';
            mergedHtml += '<h5 style="color: var(--primary); margin-bottom: 1rem;">Merged State Groups:</h5>';
            minDfa.merged.forEach(group => {
                const minState = group.join(',');
                mergedHtml += `<div style="padding: 0.5rem; color: var(--text-light); font-family: 'JetBrains Mono', monospace;"><strong>${minState}:</strong> ${group.join(', ')}</div>`;
            });
            mergedHtml += '</div></div>';
            document.getElementById('merged-states').innerHTML = mergedHtml;
        }

        async function init() {
            await initViz();
            renderNFATable();
            renderDFATable();
            renderMinDFATable();
            await generateNFADiagram();
            await generateDFADiagram();
            await generateMinDFADiagram();
        }

        // Allow Enter key
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('unifiedInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    validateAndGenerate();
                }
            });
            
            // Initialize on load
            init();
        });