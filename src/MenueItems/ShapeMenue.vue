<template>
  <div class="accordion-item">
    <div
      class="accordion-header cursor-measure"
      id="headingOne"
      @click="
        moveCamera(0);
        updateEdited($event, 0)
      "
    >
      <button
        class="accordion-button collapsed py-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseOne"
        aria-expanded="false"
        aria-controls="collapseOne"
      >
        Plattenform
        <!-- <checknote v-bind:edit="toEdit[0]" v-bind:nowEdited="nowEdited" v-bind:menuID="0"></checknote> -->
      </button>
    </div>

    <div
      id="collapseOne"
      class="accordion-collapse collapse"
      aria-labelledby="headingOne"
      data-bs-parent="#accordion"
    >
      <div class="accordion-body plateform">
        <div class="container m-0">
          <div class="row">
            <div
              data-toggle="tooltip"
              title="140,00 €/m²"
              class="col shape"
              :class="{ rectangle: !isActive.rectangle, 'rectangle-clicked': isActive.rectangle }"
              @click="changePlateform('rectangle', 0, $event)"
            ></div>
            <div
              data-toggle="tooltip"
              title="140,00 €/m² + 52 €"
              class="col shape"
              :class="{ barrel1: !isActive.barrel1, 'barrel1-clicked': isActive.barrel1 }"
              @click="changePlateform('barrel1', 1, $event)"
            ></div>
            <div
              data-toggle="tooltip"
              title="140,00 €/m² + 52 €"
              class="col shape"
              :class="{ barrel2: !isActive.barrel2, 'barrel2-clicked': isActive.barrel2 }"
              @click="changePlateform('barrel2', 2, $event)"
            ></div>
            <div
              data-toggle="tooltip"
              title="140,00 €/m² + 52 €"
              class="col shape"
              :class="{ ellipse: true, 'ellipse-clicked': isActive.ellipse }"
              @click="changePlateform('ellipse', 3, $event)"
            ></div>
            <div class="col-6"></div>
          </div>
        </div>
        <hr />

        <div class="row">
          <div class="unit">
            <label for="length">Länge:</label>
            <input
              id="length"
              type="number"
              class="input-number"
              v-model="length"
              min="120"
              max="200"
            />
          </div>
          <input
            data-toggle="tooltip"
            title="+12.23 €"
            type="range"
            class="form-control-range"
            v-model="length"
            min="120"
            max="200"
          />
        </div>

        <div class="row" style="padding-top: 14px">
          <div class="unit">
            <label for="width">Breite:</label>
            <input
              id="width"
              type="number"
              class="input-number"
              v-model="width"
              min="80"
              max="130"
            />
          </div>
          <input type="range" class="form-control-range" v-model="width" min="80" max="130" />
        </div>

        <hr />
        <div class="row">
          <div class="unit">
            <label for="radius">Eckradius:</label>
            <input
              id="radius"
              type="number"
              class="input-number"
              v-model="radius"
              min="0"
              :max="radiusMax"
            />
          </div>
          <input
            type="range"
            class="form-control-range"
            v-model="radius"
            min="0"
            :max="radiusMax"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// $(document).ready(function(){
//   $('[data-toggle="tooltip"]').tooltip();
// });
// import Checknote from './Checknote.vue';
import Calculation from '../Calculation.js'
import { useStore } from '../stores/table'
import { defineComponent } from 'vue'

export default defineComponent({
  mixins: [Calculation],
  setup() {
    const store = useStore()
    return {
      store
    }
  },
  data() {
    return {
      /* data for table top and legs that is spread to 'Mountings.vue' by
         event emitters */
      area: 0,
      length: 120,
      width: 80,
      radius: 0,
      isActive: {
        rectangle: true,
        barrel1: false,
        barrel2: false,
        ellipse: false
      },
      nowEdited: 0,
      toEdit: [true, true, true, true, true],
      prices: [0, 0, 0, 0, 0, 0, 0, 0],
      cables: [],
      plate: {
        form: { name: 'rectangle', id: 0 }
      },
      isEdited(menuId) {
        this.toEdit[menuId] = false
      }
    }
  },
  methods: {
    handleScroll: function (evt) {
      /**
       * let upper and lower cards fade out
       */
      let accordion = evt.target.children
      let cards = accordion[0].children
      let scrollbar = evt.target
      let pos = scrollbar.scrollTop,
        // height of scrollbar is 365, defined in scrollbar.scss
        max = scrollbar.scrollHeight - 365,
        relPos = pos / max
      let fadeOut = document.getElementsByClassName('fadeOut')[0]
      if (relPos > 0.9) {
        fadeOut.style.visibility = 'hidden'
      }
      if (relPos < 0.9) {
        fadeOut.style.visibility = 'visible'
      }
    },
    changePlateform: function (plateform, id, evt) {
      // highlight present selection
      this.plate.form.name = plateform
      this.plate.form.id = id
      this.store.table.geometry.plateform = plateform
      // set focus on the selected shape svg
      Object.keys(this.isActive).forEach((shape) => {
        this.isActive[shape] = false
      })
      this.isActive[plateform] = true
      this.updateAll()      
    },
    getSiblings: function (e) {
      // for collecting siblings
      let siblings = []
      // if no parent, return no sibling
      if (!e.parentNode) {
        return siblings
      }
      // first child of the parent node
      let sibling = e.parentNode.firstChild
      // collecting siblings
      while (sibling) {
        if (sibling.nodeType === 1 && sibling !== e) {
          siblings.push(sibling)
        }
        sibling = sibling.nextSibling
      }
      return siblings
    },
    updateEdited: function (evt, menuId) {
      this.nowEdited = menuId
      // check if scrollbar is used and then let parts fade out
    },
    showColorCarousel: function (color) {
      // eventBus.$emit('showColorCarousel', color);
    }
  },
  watch: {
    length: function (value) {
      this.store.table.geometry.length = value / this.cm_To_pixel
      this.updateAll()
      // this.isEdited(0)
    },
    width: function (value) {
      this.store.table.geometry.width = value / this.cm_To_pixel
      this.updateAll()
      // this.isEdited(0)
    },
    radius: function (value) {
      // radius must not be zero, because of the plate contour calculations
      value = value == 0.0 ? 0.01 : value
      this.store.shopping_cart.price.radius = value == 0.01 ? 0 : 52
      this.store.table.geometry.radius = value / this.cm_To_pixel
      this.updateAll()
      // this.isEdited(0)
    }
  },
  computed: {
    radiusMax: function () {
      // depends on the plate form but we take an empirical value for simplicity
      // let newMax = this.width * 0.4
      // this.radius = Math.min(this.radius, newMax).toFixed(1)
      // return newMax
    }
  }
})
</script>

<style lang="scss">
@import '../scss/scrollbar';
@import '../scss/accordeon';
@import '../scss/input';

.shape {
  background-size: contain !important;
  height: 3em !important;
}
.rectangle {
  background: url('../pics/rectangle.svg') no-repeat;
  padding-left: 2px;
  height: 4em;
  width: 5em !important;
  &:hover {
    background: url('../pics/rectangle_filled.svg') no-repeat;
    background-size: contain;
    height: 3em;
  }
}
.barrel1 {
  background: url('../pics/barrel1.svg') no-repeat;
  padding-left: 6px;
  height: 3em !important;
  width: 5em !important;
  &:hover {
    background: url('../pics/barrel1_filled.svg') no-repeat;
    background-size: contain;
    height: 3em;
  }
}
.barrel2 {
  background: url('../pics/barrel2.svg') no-repeat;
  padding-left: 6px;
  &:hover {
    background: url('../pics/barrel2_filled.svg') no-repeat;
    background-size: contain;
  }
}
.ellipse {
  background: url('../pics/ellipse.svg') no-repeat;
  padding-left: 6px;
  &:hover {
    background: url('../pics/ellipse_filled.svg') no-repeat;
    background-size: contain;
  }
}
.form-control-range {
  display: inline;
  top: 8px;
}
.form-control {
  position: relative;
  left: 16px;
  padding: 0px 0px 0px 0px;
}
.tooltip {
  position: relative;
  font-size: 20px;
  background-color: #ffffff;
}
.rectangle-clicked {
  background: url('../pics/rectangle_filled.svg') no-repeat;
}
.barrel1-clicked {
  background: url('../pics/barrel1_filled.svg') no-repeat;
}
.barrel2-clicked {
  background: url('../pics/barrel2_filled.svg') no-repeat;
}
.ellipse-clicked {
  background: url('../pics/ellipse_filled.svg') no-repeat;
}
</style>
