import 'whatwg-fetch' // `fetch` polyfill for Safari

function setUserLocalStorage({ token, user }) {
  localStorage.token = token
  localStorage.userId = user.id
  localStorage.email = user.email
  localStorage.username = user.username
}

export let signup = async ({ body, callback }) => {
  let response = await fetch(`${API_URL}/signup`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    let { success, message } = await response.json()
    callback({ success, message })
  }
  else throw response.error
}

export let login = async ({ body, callback }) =>  {
    let response = await fetch(`${API_URL}/api/login`, {
      method: `POST`,
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify(body),
    })
    if (response.ok)  {
      let { success, message, token, user, confirmFail } = await response.json()
      if (success) {
        setUserLocalStorage({ token, user })
        callback({ success, message, user })
      }
      else callback({ message, confirmFail })
    }
    else throw response.error
}

export let forgotPassword = async (body, callback) => {
  let response = await fetch(`${API_URL}/forgot-password`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    let { success, message } = await response.json()

    if (success) callback({success, message})
    else callback({ message })
  }
  else throw response.error
}

export let newPassword = async (body, callback) => {
  let response = await fetch(`${API_URL}/new-password`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    let { success, message } = await response.json()
    if (success) await login({ body, callback })
    else callback({ message })
  }
  else throw response.error
}

export let confirmUser = async (body, callback) => {
  let response = await fetch(`${API_URL}/confirm-user`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    let { success, token, user, message } = await response.json()
    if (success) {
<<<<<<< HEAD
      setUserLocalStorage({ token, user })
=======
      localStorage.token = token
      localStorage.userId = user.id
      localStorage.email = user.email
      localStorage.username = user.username
>>>>>>> ea79f2c... Refactored common login code, removed unnecessary save logic in retryConfirm handler
      callback({ success, token, user })
    }
    else callback({ message })
  }
  else throw response.error
}

export let retryConfirmUser = async (body, callback) => {
  let response = await fetch(`${API_URL}/retry-confirm-user`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    let { success, message } = await response.json()
    if (success) callback({ success })
    else callback({ message })
  }
  else throw response.error
}
