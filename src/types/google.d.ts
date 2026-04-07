// Tipos para Google Identity Services (GSI)
interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

interface GoogleIdConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

interface Google {
  accounts: {
    id: {
      initialize: (config: GoogleIdConfig) => void
      prompt: () => void
      renderButton: (element: HTMLElement, options: object) => void
      disableAutoSelect: () => void
    }
  }
}

declare const google: Google
