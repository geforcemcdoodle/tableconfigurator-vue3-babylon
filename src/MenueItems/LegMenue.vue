<template>
  <div class="accordion-item">
    <div
      class="accordion-header cursor-color"
      id="headingFive"
      @click="moveCamera(4); updateEdited($event, 1)
      "
    >
      <button
        class="accordion-button collapsed py-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseFive"
        aria-expanded="false"
        aria-controls="collapseFive"
      >
        Tischbeine
      </button>
      <!-- <checknote v-bind:edit="toEdit[1]" v-bind:nowEdited="nowEdited" v-bind:menuID="1"></checknote> -->
    </div>

    <div id="collapseFive" class="collapse" data-parent="#accordion">
      <div class="accordion-body">
        <div class="row" style="padding-top: 14px">
          <div class="unit">
            <label for="height">Höhe:</label>
            <input
              id="heigth"
              type="number"
              class="input-number"
              v-model="height"
              min="70"
              max="120"
            />
          </div>
          <input type="range" class="form-control-range" v-model="height" min="70" max="120" />
        </div>

        <img
          class="pic-leg"
          v-for="(pic, index) in dataImages"
          v-bind:key="pic"
          @click="selectImage($event, pic)"
          :src="pic.src"
        />
      </div>
    </div>
  </div>
</template>

<script>
// import Checknote from './Checknote.vue';
import { defineComponent } from 'vue'
import { useStore } from '../stores/table'
import Calculation from '../Calculation.js'
import leg from '../models/1leg_dark_steel.glb?url'
import laptop from '../models/laptop.gltf?url'
import { OBJFileLoader } from '@babylonjs/loaders/OBJ/objFileLoader'

export default defineComponent({
  components: {
    // Checknote
  },
  mixins: [Calculation],
  props: ['update'],
  setup() {
    const store = useStore()
    return {
      store
    }
  },

  data() {
    return {
      dataImages: [
        {
          id: '1',
          src: new URL(`../pics/Legs/leg1.png`, import.meta.url).href,
          alt: 'Tischkufen H-Form'
        },
        { id: '2', src: new URL(`../pics/Legs/leg2.png`, import.meta.url).href, alt: 'Tischkufen' },
        {
          id: '3',
          src: new URL(`../pics/Legs/leg3.png`, import.meta.url).href,
          alt: 'Tischbeine schwarz'
        },
        {
          id: '4',
          src: new URL(`../pics/Legs/leg4.png`, import.meta.url).href,
          alt: 'Tischbeine weiß'
        }
      ],
      height: 70,
      isEdited(menuId) {
        this.store.toEdit[menuId] = false
      }
    }
  },

  methods: {
    updateEdited: function (evt, menuId) {
      this.store.nowEdited = menuId
      // check if scrollbar is used and then let parts fade out
      // reach scrollbar parent
      // let scrollbar = document.getElementsByClassName('scrollbar')[0];
      // let accordion = scrollbar.children[0];
      // let pos = scrollbar.scrollTop;
      // let max = scrollbar.scrollHeight;
    },
    selectImage: function (evt, pic) {
      this.changeTableLeg(pic.id)
    },
    changeTableLeg: function (id) {
      console.log('toDO')
      // this.changeToWoodLegs();
    },
    changeToWoodLegs() {
      /* with circular profile as default
       */
      let leg_qty = this.store.table.legs.length
      for (let i = 0; i < leg_qty; i++) {
        this.store.table.legs[i].dispose(false, true)
      }

      for (let i = 0; i < 4; i++) {
        this.store.table.legs.push(
          BABYLON.Mesh.CreateRibbon(
            '',
            this.defineLeg(i + 1),
            false,
            false,
            0,
            this.store.scene,
            true,
            BABYLON.Mesh.DOUBLESIDE
          )
        )
        this.store.table.legs[i].material = this.getMaterial(image_table_edge)
      }
    }
  },

  watch: {
    // scaling value for pixel to cm is 10
    height: function (value) {
      this.store.table.geometry.height = value / this.cm_To_pixel
      this.updateAll()
    }
  }
})
</script>

<style lang="scss">
.pic-leg {
  width: 80px;
  height: 100px;
  padding-right: 10px;
  padding-top: 15px;
  margin-left: 1px;
}
</style>
