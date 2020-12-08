import { types, flow } from 'mobx-state-tree'

export const CONTRACT_KITTY = 6;

export const createSubstrateKittiesAppStore = (defaultValue = {}, options = {}) => {
  const Box = types.model({
    id: types.string
    })
  const SubstrateKittiesAppStore = types
    .model('SubstrateKittiesAppStore', {
      blind_box: types.array(Box)
      // kitty: types.maybeNull(types.number)
    })
    .actions(self => ({
      setBox (box) {
        for (var box_id in box){
            self.blind_box.push(box[box_id].id)
            console.log(box_id)
          }
      },
      async queryBox (runtime) {
        return await runtime.query(CONTRACT_KITTY, 'ObserveBox')
      }
    }))

  return SubstrateKittiesAppStore.create(defaultValue)
}

