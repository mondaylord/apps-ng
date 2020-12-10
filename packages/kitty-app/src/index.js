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
   * Updates the counter by querying the kitty contract
   * The type definitions of `GetCount` request and response can be found at contract/kitty.rs
   */
  async function updateBox () {
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

  /**
   * The `increment` transaction payload object
   * It follows the command type definition of the contract (at contract/kitty.rs)
   */
  const packCommandPayload = useMemo(() => {
      return {
        Pack: {}
      }
  },[inc])

  const openCommandPayload = useMemo(() => {
    const num = parseInt(inc)
    if (isNaN(num) || inc < 0 || inc >= 10) {
      return {}
    } else {
      const blind_box_id = kittyApp.blind_box[num];
      return {
        Open: {blind_box_id}
      }
    }
      
  },[inc])

  return (
    <Container>
      <section>
        <div>PRuntime: {appRuntime ? 'yes' : 'no'}</div>
        <div>PRuntime ping: {appRuntime.latency || '+∞'}</div>
        <div>PRuntime connected: {appRuntime?.channelReady ? 'yes' : 'no'}</div>
      </section>
      <Spacer y={1}/>

      <h3>Box</h3>
      <section>
        <div>Blind Box: {kittyApp.blind_box.length === 0 ? 'empty box' : kittyApp.blind_box.length}</div>
        <div><Button onClick={updateBox}>ObserveBox</Button></div>
      </section>
      <Spacer y={1}/>

      <h3>Pack Kitties</h3>
      <section>
        <ButtonWrapper>
          {/**  
            * PushCommandButton is the easy way to send confidential contract txs.
            * Below it's configurated to send Kitty::Increment()
            */}
          <PushCommandButton
              // tx arguments
              contractId={CONTRACT_KITTY}
              payload={packCommandPayload}
              // display messages
              modalTitle='SubstrateKitties.Pack()'
              modalSubtitle={`Pack the kitty by ${inc}`}
              onSuccessMsg='Tx succeeded'
              // button appearance
              buttonType='secondaryLight'
              icon={PlusIcon}
              name='Send'
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
              modalSubtitle={`Open the kitty by ${inc}`}
              onSuccessMsg='Tx succeeded'
              // button appearance
              buttonType='secondaryLight'
              icon={PlusIcon}
              name='Send'
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
