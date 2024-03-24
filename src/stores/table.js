import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => {
    return {
      assetsManager: null,
      cable_active: null,
      cables: [],
      camera: null,
      cm_To_pixel: 10,
      dome: null,
      isActive: {
        menu: {
          leg: false
        }
      },
      holes: [],
      nowEdited: 0,
      table: {
        color: { category: 'blue', name: '2204-Poppy-Seed' },
        color_compare: { category: '', name: '' },
        core_material: new URL('../pics/core_material/Mammutbaum-Holz_quer.jpg', import.meta.url).href,
        coverBottom: null,
        degree: 90,
        edge: {
          mesh: null,
          texture_path: new URL('../pics/edge/roteiche_radial.jpg', import.meta.url).href
        },
        geometry: {
          thickness: 0.25,
          length: 12,
          width: 8,
          radius: 0.01,
          height: 7,
          plateform: 'rectangle',
          vector_translate_1: null,
          vector_translate_2: null,
          vector_translate_3: null,
          vector_translate_4: null
        },
        linoleum: {
          mesh: null,
          texture_path: new URL('../pics/WEB/blue/2204-Poppy-Seed.jpg', import.meta.url).href,
          texture_path_compare: null,
          thickness: 0.03
        },
        legs: []
      },
      scene: null,
      shopping_cart: {
        qty: 1,
        price: {
          base: 386,
          coverBottom: 0,
          degree: 0, //31
          edge: 0,
          legs: 40,
          linoleum: 0,
          radius: 0, //52
          cable: 0,
          shape: 0 //52
        }
      },
      toEdit: [true, true, true, true, true]
    }
  },
  getters: {
    price_area(state) {
      return ((state.table.geometry.length * state.table.geometry.width) / 100) * 140 + 40
    },
    price_total(state) {
      return (
        (this.price_area +
          state.shopping_cart.price.base +
          state.shopping_cart.price.degree +
          state.shopping_cart.price.radius +
          state.shopping_cart.price.cable +
          state.shopping_cart.price.shape) *
        state.shopping_cart.qty
      ).toFixed(2)
    }
  }
})
