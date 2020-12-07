import { types, flow } from 'mobx-state-tree'

export const CONTRACT_KITTY = 6;

export const createSubstrateKittiesAppStore = (defaultValue = {}, options = {}) => {
  const Box = types.model({
    id: types.string,
    box: types.identifier
    })
  const SubstrateKittiesAppStore = types
    .model('SubstrateKittiesAppStore', {
      blind_box: types.map(Box)
      // kitty: types.maybeNull(types.number)
    })
    .actions(self => ({
      setBox (num) {
        self.blind_box = num
      },
      async queryBox (runtime) {
        return await runtime.query(CONTRACT_KITTY, 'ObserveBox')
      }
    }))

  return SubstrateKittiesAppStore.create(defaultValue)
}

