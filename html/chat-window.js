let messages = [];
const chatLog = document.getElementById('chat-log');
const message = document.getElementById('message');
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = message.value;
    const newMessage = {"role": "user","content":`${messageText}`};
    messages.push(newMessage);
    message.value = '';
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add('message--sent');
    messageElement.innerHTML = `
    <div class ="message__text">${messageText}</div>
    `;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;

    fetch('/api/', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            messages
        })
    })
    .then(res => res.json())
    .then(data => {
        let newAssistantMessage = {"role": "assistant","content":`${data.completion.content}`};
        messages.push(newAssistantMessage);
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add('message--recieved');
        messageElement.innerHTML = `
        <div class ="message__text">${data.completion.content}</div>
        `;
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    })
})