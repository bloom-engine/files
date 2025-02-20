const script = document.currentScript;
const url = new URL(script.src)
const apiKey = url.searchParams.get("apiKey")

const baseUrl= 'https://bloom-engine.netlify.app/.netlify/functions/api'

function getInputData() {
    const inputData = {};
    document.querySelectorAll('#bloom-container input[data-label], #bloom-container select[data-label]').forEach(input => {
        console.log(input.dataset.label)
        inputData[input.dataset.label] = input.value;
    });

    return inputData;
}

function getOutputLabels() {
    return Array.from(document.querySelectorAll('#bloom-container #outputs [data-label]'))
        .map(el => el.dataset.label);
}

fetch(`${baseUrl}/initialize`,
    {
        method: 'GET', // or 'POST', 'PUT', etc.
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': `${apiKey}`,
        }
    }
)
    .then(res => res.text())
    .then(html => {
        const container = document.getElementById('bloom-container');
        container.innerHTML = html;

        const req = {
            inputs: {},
            outputs: []
        }

        document.querySelector('#bloom-container form').addEventListener('submit', (event) => {
            event.preventDefault()
            req.inputs = getInputData()
            req.outputs = getOutputLabels()
            let output = {}

            fetch(`${baseUrl}/v3.0`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': `${apiKey}`,
                },
                body: JSON.stringify(req)
            })
            .then(response => response.json())
            .then(data => {
                output=data.data
                console.log(output)
            Object.keys(output).forEach(result => {
                document.querySelector(`[data-label="${result}"]`).innerText = document.querySelector(`[data-label="${result}"]`).innerText.replace('{}', output[result])
            })
        })
            .catch(error => console.error('Error:', error));

            
        })
    });