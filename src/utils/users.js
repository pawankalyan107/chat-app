const users = []

// addUser, removeUser, getUser, getUsers

export const addUser = ({ id, username, room }) => {
  // clean the data
  let userName = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // validate the data
  if (!userName || !room) {
    return {
      error: 'Username and room are required!'
    }
  }

  // check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.userName === userName
  })

  // validate username
  if (existingUser) {
    return {
      error: 'Username is in use'
    }
  }

  // store user
  const user = { id, userName, room }
  users.push(user)
  return { user }
}

export const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

export const getUser = (id) => {
  const userIndex = users.find((user) => user.id === id)
  return userIndex
}

export const getUsersInRoom = (roomName) => {
  roomName = roomName.trim().toLowerCase()
  return users.filter((user) => user.room === roomName)
}
