const script = document.currentScript;
const url = new URL(script.src)
const apiKey = url.searchParams.get("apiKey")

const baseUrl = 'https://bloom-engine.netlify.app/.netlify/functions/api'
// const baseUrl = 'http://localhost:8888/.netlify/functions/api'

const getInputData = () => {
    const inputData = {};
    document.querySelectorAll('#bloom-container input[data-label], #bloom-container select[data-label]').forEach(input => {
        console.log(input.dataset.label)
        inputData[input.dataset.label] = input.value;
    });

    return inputData;
}

const getOutputLabels = () => {
    return Array.from(document.querySelectorAll('#bloom-container [data-label]:not(input):not(select)'))
        .map(el => el.dataset.label);
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#bloom-container form').addEventListener('submit', (event) => {
        event.preventDefault()

        const req = {
            inputs: getInputData(),
            outputs: getOutputLabels()
        }

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
                output = data.data
                Object.keys(output).forEach(result => {
                    document.querySelector(`[data-label="${result}"]`).innerText = output[result]
                })
            })
    })
});