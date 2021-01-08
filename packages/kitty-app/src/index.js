import React, { useEffect, useState, useMemo } from 'react'
import styled from "styled-components"
import { observer } from 'mobx-react'
import { Button, Input, Spacer, useInput, useToasts } from '@zeit-ui/react'
import { Plus as PlusIcon } from '@zeit-ui/react-icons'

import { useStore } from "@/store"
import Container from '@/components/Container'
import UnlockRequired from '@/components/accounts/UnlockRequired'
import PushCommandButton from '@/components/PushCommandButton'

import { CONTRACT_KITTY, createSubstrateKittiesAppStore } from './utils/AppStore'
import { reaction } from 'mobx'

const ButtonWrapper = styled.div`
  margin-top: 5px;
  width: 200px;
`;

/**
 * Header of the Kitty app page
 */
const AppHeader = () => (
  <Container>
    <h1>Substrate Kitty!</h1>
  </Container>
)

/**
 * Body of the Kitty app page
 */
const AppBody = observer(() => {
  const { appRuntime, kittyApp } = useStore();
  const [, setToast] = useToasts()
  const { state: inc, bindings } = useInput('-1')

  /**
   * Updates the box length by querying the kitty contract
   * The type definitions of `ObserveBox` request and response can be found at contract/substrate_kitties.rs
   */
  async function updateBox() {
    if (!kittyApp) return
    try {
      const response = await kittyApp.queryBox(appRuntime)
      // Print the response in the original to the console
      console.log('Response::ObserveBox', response);
      kittyApp.setBox(response.ObserveBox.blindBox)
    } catch (err) {
      setToast(err.message, 'error')
    }
  }

  async function updateOwnedBox() {
    if (!kittyApp) return
    try {
      const response = await kittyApp.queryOwnedBox(appRuntime)
      // Print the response in the original to the console
      console.log('Response::ObserveOwnedBox', response);
      kittyApp.setOwnedBox(response.ObserveOwnedBox.ownedBox)
    } catch (err) {
      setToast(err.message, 'error')
    }
  }

  const packCommandPayload = useMemo(() => {
    return {
      Pack: {}
    }
  }, [inc])

  const openCommandPayload = useMemo(() => {
    const num = parseInt(inc)
    if (isNaN(num) || inc < 0 || inc >= kittyApp.blindBox.length || kittyApp.blindBox.length === 0) {
      console.log("You cannot open yet! Pack kitties first or enter a legal box number.")
      return {}
    } else {
      const blindBoxId = kittyApp.blindBox[num];
      return {
        Open: { blindBoxId }
      }
    }

  }, [inc])

  return (
    <Container>
      <section>
        <div>PRuntime: {appRuntime ? 'yes' : 'no'}</div>
        <div>PRuntime ping: {appRuntime.latency || '+∞'}</div>
        <div>PRuntime connected: {appRuntime?.channelReady ? 'yes' : 'no'}</div>
      </section>
      <Spacer y={1} />

      <h3>Boxes you can open</h3>
      <section>
        <div>Blind Box: {kittyApp.blindBox.length === 0 ? 'empty box' : kittyApp.blindBox.length}</div>
        <div>{kittyApp.blindBox.map((blindBox, id) => (
          <div key={id} >{blindBox}</div>
        ))}</div>
        <div><Button onClick={updateBox}>ObserveBox</Button></div>
      </section>
      <Spacer y={1} />

      <h3>Boxes you owned</h3>
      <section>
        <div>Blind Box: {kittyApp.ownedBox.length === 0 ? 'No owned box' : kittyApp.ownedBox.length}</div>
        <div>{kittyApp.ownedBox.map((ownedBox, id) => (
          <div key={id} >{ownedBox}</div>
        ))}</div>
        <div><Button onClick={updateOwnedBox}>ObserveOwnedBox</Button></div>
      </section>
      <Spacer y={1} />

      <h3>Pack Kitties</h3>
      <section>
        <ButtonWrapper>
          {/**  
            * PushCommandButton is the easy way to send confidential contract txs.
            * Below it's configurated to send Kitty::Pack()
            */}
          <PushCommandButton
            // tx arguments
            contractId={CONTRACT_KITTY}
            payload={packCommandPayload}
            // display messages
            modalTitle='SubstrateKitties.Pack()'
            modalSubtitle={`Pack the kitty with blind boxes`}
            onSuccessMsg='Tx succeeded'
            // button appearance
            buttonType='secondaryLight'
            icon={PlusIcon}
            name='Pack'
          />
        </ButtonWrapper>
      </section>

      <h3>Open Boxes</h3>
      <section>
        <div>
          <Input label="By" {...bindings} />
        </div>
        <ButtonWrapper>
          <PushCommandButton
            // tx arguments
            contractId={CONTRACT_KITTY}
            payload={openCommandPayload}
            // display messages
            modalTitle='Kitty.Open()'
            modalSubtitle={`Open the box which the number is ${inc}, id is ${kittyApp.blindBox[inc]}`}
            onSuccessMsg='Tx succeeded'
            // button appearance
            buttonType='secondaryLight'
            icon={PlusIcon}
            name='Open'
          />
        </ButtonWrapper>
      </section>

    </Container>
  )
})

/**
 * Injects the mobx store to the global state once initialized
 */
const StoreInjector = observer(({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore || !appStore.appRuntime) return
    if (typeof appStore.kittyApp !== 'undefined') return
    appStore.kittyApp = createSubstrateKittiesAppStore({})
  }, [appStore])

  useEffect(() => reaction(
    () => appStore.kittyApp,
    () => {
      if (appStore.kittyApp && !shouldRenderContent) {
        setShouldRenderContent(true)
      }
    },
    { fireImmediately: true })
  )

  return shouldRenderContent && children;
})

export default () => (
  <UnlockRequired>
    <StoreInjector>
      <AppHeader />
      <AppBody />
    </StoreInjector>
  </UnlockRequired>
)
