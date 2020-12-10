import { types, flow } from 'mobx-state-tree'

export const CONTRACT_KITTY = 6;

export const createSubstrateKittiesAppStore = (defaultValue = {}, options = {}) => {
  const SubstrateKittiesAppStore = types
    .model('SubstrateKittiesAppStore', {
      blind_box: types.array(types.string)
      // kitty: types.maybeNull(types.number)
    })
    .actions(self => ({
      setBox: flow(function* setBox(box) {
        for (var box_id in box){
          var id = box[box_id].id
          if (self.blind_box.indexOf(id) < 0)
            self.blind_box.push(id)
          }
      }),
      async queryBox (runtime) {
        return await runtime.query(CONTRACT_KITTY, 'ObserveBox')
      }
    }))

  return SubstrateKittiesAppStore.create(defaultValue)
}

