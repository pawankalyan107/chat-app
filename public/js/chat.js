const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $message = document.querySelector('#messages')

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Query Search
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
  // new message element
  const $newMessage = $message.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // visible Height
  const visibleHeight = $message.offsetHeight

  // Height of the message container
  const containerHeight = $message.scrollHeight
  
  // How far have i scrolled?
  const scrollOffset = $message.scrollTop + visibleHeight
  console.log(containerHeight, newMessageHeight, scrollOffset)

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $message.scrollTop = $message.scrollHeight
  }
}

socket.on('message', (data) => {
  const html = Mustache.render(messageTemplate, {
    user: data.userName,
    message: data.text,
    createdAt: moment(data.createdAt).format('h:mm a')
  })
  $message.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('locationMessage', (url) => {
  console.log(url)
  const html = Mustache.render(locationTemplate, {
    user: url.userName,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm a')
  })
  $message.insertAdjacentHTML('beforeend', html)
  autoScroll()
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

  let messageValue = e.target.elements.message.value
  socket.emit('clientMessage', messageValue, (acknowledgement) => {
    console.log(acknowledgement)
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
  })
})

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }
  $locationButton.setAttribute('disabled', 'disabled')
  navigator.geolocation.getCurrentPosition((position) => {
    const location = { lat: position.coords.latitude, lon: position.coords.longitude }
    socket.emit('location', location, (message) => {
      console.log(message)
    })
    $locationButton.removeAttribute('disabled')
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
