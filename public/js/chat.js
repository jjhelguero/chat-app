const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messagesTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

socket.on('message', (message) => {
    const html = Mustache.render(messagesTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message) =>{
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocation.addEventListener('click', () => {
    $sendLocation.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition(position => {
        const location = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }

        socket.emit('sendLocation', location, () => {
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href='/'
    }
})