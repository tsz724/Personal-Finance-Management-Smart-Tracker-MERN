import React from 'react'

const loadGoogleScript = (onLoad) => {
  if (document.getElementById('google-identity')) {
    onLoad()
    return
  }

  const script = document.createElement('script')
  script.id = 'google-identity'
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = onLoad
  document.body.appendChild(script)
}

const GoogleAuthButton = ({ onAuthSuccess, onAuthError }) => {
  const buttonRef = React.useRef(null)

  React.useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
      if (onAuthError) {
        onAuthError('Google Client ID is missing. Please configure it.')
      }
      return
    }

    const initialize = () => {
      if (!window.google || !window.google.accounts || !buttonRef.current) {
        return
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response?.credential) {
            if (onAuthError) {
              onAuthError('Google sign-in failed. Please try again.')
            }
            return
          }
          onAuthSuccess(response.credential)
        },
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
        text: 'continue_with',
      })
    }

    loadGoogleScript(initialize)
  }, [onAuthSuccess, onAuthError])

  return (
    <div className="w-full flex justify-center">
      <div ref={buttonRef} />
    </div>
  )
}

export default GoogleAuthButton
