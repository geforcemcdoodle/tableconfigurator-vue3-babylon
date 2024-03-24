<template>
  <div class="accordion-item">
     <div
      class="accordion-header cursor-color"
      id="headingSix"
    >
      <button
        class="accordion-button collapsed py-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseSix"
        aria-expanded="false"
        aria-controls="collapseSix"
      >
        Standort
      </button>
      <!-- <checknote v-bind:edit="toEdit[1]" v-bind:nowEdited="nowEdited" v-bind:menuID="1"></checknote> -->
    </div>

    <div
      id="collapseSix"
      class="accordion-collapse collapse"
      aria-labelledby="headingSix"
      data-bs-parent="#accordion"
    >
      <div class="accordion-body">    
        Bodenbelag<br />
        <input
          class="w-25 rounded"
          @click="onFloor($event)"
          type="image"
          :src="floor.pics"
        />
        <hr />
        Wand<br />
        <input
          class="w-25 rounded"
          @click="onWall($event)"
          type="image"
          :src="wall.pics"
        />
        <hr />
        <button type="button" @click="makePhotoDome">360° Photo hochladen</button>
      </div>
    </div>
  </div>
</template>

<script>
import Calculation from '../Calculation.js';
import { useStore } from '../stores/table'

export default {
  setup() {
    const store = useStore()
    return {
      store
    }
  },
  mixins: [Calculation],
  data() {
    return {
      floor: { 
        pics: new URL(`../pics/Floor/stab-optik-eiche-struktur.jpg`, import.meta.url).href
      },
      wall: {
        pics:new URL(`../pics/Wall/359993_5.jpg`, import.meta.url).href
      }
    }
  },
  methods: {
    makePhotoDome: function () {
      this.makePhotoDome();
    },
    onFloor: function (evt) {
      console.log(evt);
      // eventBus.$emit('changeFloor')
    },
    onWall: function (evt) {
      // eventBus.$emit('changeWall')
    }
  }
}
</script>
<style lang="scss">

</style>