export const generateMessage = (userName,data) => {
  return {
    userName,
    text: data,
    createdAt: new Date().getTime()
  }
}

export const generateLocationMessage = (userName, url) => {
  return {
    userName,
    url,
    createdAt: new Date().getTime()
  }
}