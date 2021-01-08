import { types, flow } from 'mobx-state-tree'

export const CONTRACT_KITTY = 6;

export const createSubstrateKittiesAppStore = (defaultValue = {}, options = {}) => {
  const SubstrateKittiesAppStore = types
    .model('SubstrateKittiesAppStore', {
      blindBox: types.array(types.string),
      kittyNum: types.maybeNull(types.number),
      ownedBox: types.array(types.string),
    })
    .actions(self => ({
      setBox: flow(function* setBox(box) {
        for (var box_id in box) {
          var id = box[box_id].id
          if (self.blindBox.indexOf(id) < 0)
            self.blindBox.push(id)
        }
      }),
      setKitties: flow(function* setKitties(kitties) {
        self.kittyNum = kitties.length
      }),
      setOwnedBox: flow(function* setOwnedBox(ownedBox) {
        for (var box_id in ownedBox) {
          var id = ownedBox[box_id]
          if (self.ownedBox.indexOf(id) < 0)
            self.ownedBox.push(id)
        }
      }),
      async queryBox(runtime) {
        // Observe the boxes
        return await runtime.query(CONTRACT_KITTY, 'ObserveBox')
      },
      async queryKitties(runtime) {
        return await runtime.query(CONTRACT_KITTY, 'ObserveKitties')
      },
      async queryOwnedBox(runtime) {
        return await runtime.query(CONTRACT_KITTY, 'ObserveOwnedBox')
      },
    }))

  return SubstrateKittiesAppStore.create(defaultValue)
}

