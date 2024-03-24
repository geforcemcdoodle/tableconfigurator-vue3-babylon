<template>
  <div>
    <!-- <div class="scrollbar scrollbar-lady-lips thin" @scroll="handleScroll($event)"> -->
    <div class="accordion" id="accordion">
      <shape-menue></shape-menue>
      <color-menue></color-menue>
      <carrier-menue></carrier-menue>
      <cable-menue></cable-menue>
      <leg-menue v-bind:update="checknote"></leg-menue>
      <environment-menue></environment-menue>
    </div>

  </div>
</template>

<script>
// $(document).ready(function(){
//   $('[data-toggle="tooltip"]').tooltip();
// });
import ShapeMenue from './MenueItems/ShapeMenue.vue'
import { defineComponent } from 'vue'
import Initialisation from './Initialisation.js'
import { useStore } from './stores/table'

// import Checknote from './MenueItems/Checknote.vue';
import ColorMenue from './MenueItems/ColorMenue.vue'
import CableMenue from './MenueItems/CableMenue.vue'
import CarrierMenue from './MenueItems/CarrierMenue.vue'
import EnvironmentMenue from './MenueItems/EnvironmentMenue.vue';
import LegMenue from './MenueItems/LegMenue.vue'

export default defineComponent({
  setup() {
    const store = useStore()
    return {
      store
    }
  },
  mixins: [Initialisation],
  props: ['tableEdge', 'dimensions'],
  components: {
    ShapeMenue,
    CarrierMenue,
    // Checknote,
    ColorMenue,
    CableMenue,
    LegMenue,
    EnvironmentMenue,
  },

  data() {
    return {
      checknote: {
        nowEdited: 0,
        toEdit: [true, true, true, true, true]
      },
      toEdit: [true, true, true, true, true],
      nowEdited: 0,
      prices: [0, 0, 0, 0, 0, 0, 0, 0],
      // sorted after a fashion
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
    updateEdited: function (evt, menuId) {
      this.nowEdited = menuId
      // check if scrollbar is used and then let parts fade out
      // reach scrollbar parent
      let scrollbar = document.getElementsByClassName('scrollbar')[0]
      let accordion = scrollbar.children[0]
      let pos = scrollbar.scrollTop
      let max = scrollbar.scrollHeight
      console.log('scrollHeight: ' + max)
      console.log(accordion)
      console.log('clientHeight: ' + accordion.clientHeight)
      console.log(evt.srcElement)
    },
    showColorCarousel: function (color) {
      // eventBus.$emit('showColorCarousel', color);
    },
    resetStyle: function (evt) {
      evt.target.style.width = '20px'
    }
  },
  computed: {
    radiusMax: function () {
      // depends on the plate form but we take an empirical value for simplicity
      let newMax = this.width * 0.4
      this.radius = Math.min(this.radius, newMax).toFixed(1)
      return newMax
    }
  }
})
</script>

<style lang="scss">
@import './scss/scrollbar';
@import './scss/accordeon';
@import './scss/input';

.pic {
  border-radius: 30%;
  width: 2em;
  margin-left: 0.1em;
  transition: width 0.3s;
  &:hover {
    width: 2.8em;
  }
}
.accordion-button {
  background-color: #F4F4F9 !important;  
  font-size: 1.2em !important;
  color: #282d52;
  &:focus {
    box-shadow: 0 0 0 0.15rem #9D9FAF !important;
  }  
}
.accordion-button:not(.collapsed) {
  fill: red !important;
}
.icon-color {
  background-color: white;
}
</style>