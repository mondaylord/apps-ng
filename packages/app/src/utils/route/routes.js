import PhalaWalletPage from '@phala/wallet'
import AppSettingsPage from '@/components/SettingsPage'
import HelloWorldAppPage from '@phala/helloworld-app'
import KittyAppPage from '@phala/kitty-app'

export const COMPONENT_ROUTES = {
  wallet: PhalaWalletPage,
  settings: AppSettingsPage,
  helloworldapp: HelloWorldAppPage,
  kittyapp: KittyAppPage
}

export const MENU_ROUTES = {
  WALLET: '/wallet',
  SETTINGS: '/settings',
  HELLOWORLDAPP: '/helloworldapp',
  KITTYAPP: '/kittyapp'
}
