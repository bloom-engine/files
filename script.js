const script = document.currentScript;
const url = new URL(script.src)
const apiKey = url.searchParams.get("apiKey")

const baseUrl = 'https://app.bloom-engine.cloud/api'
// const baseUrl = 'http://localhost:8888/api'

const getInputData = () => {
    const inputData = {};
    document.querySelectorAll('#bloom-container input[data-label], #bloom-container select[data-label]').forEach(input => {
        inputData[input.dataset.label] = input.value;
    });

    return inputData;
}

const getOutputLabels = () => {
    return Array.from(document.querySelectorAll('#bloom-container [data-label]:not(input):not(select)'))
        .map(el => el.dataset.label);
}

const checkType = (input) => {
    if (!Array.isArray(input)) {
        return "SV";
    }

    if (input.every(item => !Array.isArray(item))) {
        return "1D";
    }

    if (input.every(item => Array.isArray(item))) {
        return "2D";
    }

    return "MA";
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#bloom-container form').addEventListener('submit', (event) => {
        event.preventDefault()
        const submitBtn = document.querySelector("#bloom-container form button")
        submitBtn.disabled = true;

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

                let parentNode

                Object.keys(output).forEach(result => {
                    const dataVal = output[result]

                    try {
                        switch (checkType(dataVal)) {
                            case "SV":
                                document.querySelector(`[data-label="${result}"]`).innerText = dataVal
                                break
                            case "1D":
                                dataVal.forEach((ele, index) => {
                                    const row = document.querySelector(`[data-label="${result}"]`)
                                    const cell = row.querySelector(`[data-col="${index + 1}"]`)
                                    if (cell) {
                                        cell.innerText = ele
                                    }
                                })
                                break
                            case "2D":
                                dataVal.forEach((ele, index) => {
                                    const clonedNode = document.querySelector(`[data-label="${result}"]`).cloneNode(true)
                                    parentNode = document.querySelector(`[data-label="${result}"]`).parentNode

                                    ele.forEach((e, i) => {
                                        const cell = clonedNode.querySelector(`[data-col="${i + 1}"]`)
                                        if (cell) {
                                            cell.innerText = e.trim()
                                        }
                                    })
                                    parentNode.appendChild(clonedNode)
                                })
                                break
                            case "MA":
                                console.log('Invalid bloom result')
                        }
                    } catch (err) {
                        console.error(err)
                    }
                })

                if (parentNode && parentNode.firstElementChild) {
                    parentNode.removeChild(parentNode.firstElementChild);
                }

            }).finally(() => {
                submitBtn.disabled = false;
            })
    })
});