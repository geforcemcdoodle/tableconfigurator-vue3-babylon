<template>
  <div class="accordion-item">
    <div
      class="accordion-header cursor-color"
      id="headingTwo"
      @click="
        moveCamera(1);
        updateEdited($event, 1)
      "
    >
      <button
        class="accordion-button collapsed py-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseTwo"
        aria-expanded="false"
        aria-controls="collapseTwo"
      >
        Linoleumfarbe
      </button>
      <!-- <checknote v-bind:edit="toEdit[1]" v-bind:nowEdited="nowEdited" v-bind:menuID="1"></checknote> -->
    </div>
    <div
      id="collapseTwo"
      class="accordion-collapse collapse"
      aria-labelledby="headingTwo"
      data-bs-parent="#accordion"
    >
      <div class="accordion-body">
        <!-- seven color categories -->
        <div class="d-flex justify-content-left">
          <div style="color: #2d4156; font-weight: bold;">{{ store.table.color.name }}</div>
          <svg-icon class="mx-2" type="mdi" :path="mdi_compare" @click="compareColor()"></svg-icon>
          <div v-if="isColorCompareActive" class="">vergleiche Farbe mit</div>
          <div style="color: #2d4156; font-weight: bold;">{{ store.table.color_compare.name }}</div>
        </div>
        <br />
        <div class="d-flex align-items-center color-category">
          <input
            class="pic"
            v-for="(pic, index) in Colors.bright.options"
            v-bind:key="pic"
            @click="onColor($event, 'bright', pic)"
            type="image"
            :src="Colors.bright.paths[index]"
          />
        </div>
        <div class="d-flex align-items-center color-category">
          <input
            class="pic"
            v-for="(pic, index) in Colors.dark.options"
            v-bind:key="pic"
            @click="onColor($event, 'dark', pic)"
            type="image"
            :src="Colors.dark.paths[index]"
          />
        </div>
        <div class="d-flex align-items-center color-category">
          <input
            class="pic"
            v-for="(pic, index) in Colors.grey.options"
            v-bind:key="pic"
            @click="onColor($event, 'grey', pic)"
            type="image"
            :src="Colors.grey.paths[index]"
          />
        </div>
        <div class="d-flex align-items-center color-category">
          <input
            class="pic"
            v-for="(pic, index) in Colors.blue.options"
            v-bind:key="pic"
            @click="onColor($event, 'blue', pic)"
            type="image"
            :src="Colors.blue.paths[index]"
          />
        </div>
        <div class="d-flex align-items-center color-category">
          <input
            class="pic"
            v-for="(pic, index) in Colors.red.options"
            v-bind:key="pic"
            @click="onColor($event, 'red', pic)"
            type="image"
            :src="Colors.red.paths[index]"
          />
        </div>
        <div class="d-flex align-items-center color-category">
          <input
            class="pic"
            v-for="(pic, index) in Colors.green.options"
            v-bind:key="pic"
            @click="onColor($event, 'green', pic)"
            type="image"
            :src="Colors.green.paths[index]"
          />
        </div>
        <div class="d-flex align-items-center color-category">
          <input
            class="pic"
            v-for="(pic, index) in Colors.yellow.options"
            v-bind:key="pic"
            @click="onColor($event, 'yellow', pic)"
            type="image"
            :src="Colors.yellow.paths[index]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Checknote from './Checknote.vue';
import { useStore } from '../stores/table'
import { defineComponent } from 'vue'
import Calculation from '../Calculation.js'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiCompare } from '@mdi/js'

export default defineComponent({
  // components: { 'checknote': Checknote },
  mixins: [Calculation],
  components: {
    SvgIcon
  },
  setup() {
    const store = useStore()
    return {
      store
    }
  },
  data() {
    return {
      mdi_compare: mdiCompare,
      dataImages: [
        { id: '1', src: '../pics/Legs/leg1.png', alt: 'Tischkufen H-Form' },
        { id: '2', src: '../pics/Legs/leg2.png', alt: 'Tischkufen' },
        { id: '3', src: '../pics/Legs/leg3.png', alt: 'Tischbeine schwarz' },
        { id: '4', src: '../pics/Legs/leg4.png', alt: 'Tischbeine weiß' }
      ],
      isColorCompareActive: false,
      /* data for table top and legs that is spread to 'Mountings.vue' by
         event emitters */
      nowEdited: 0,
      /* data for cable conduct */
      cables: [],
      // sorted after a fashion
      Colors: {
        bright: {
          options: ['2206-Oyster-Shell', '4176-Mushroom', '4177-Vapour', '4185-Powder'],
          paths: []
        },
        dark: {
          options: ['2209-Black-Olive', '4023-Nero', '4166-Charcoal', '4178-Iron'],
          paths: []
        },
        grey: {
          options: [
            '2162-Duck-Egg',
            '2182-Potato-Skin',
            '2187-Brown-Rice',
            '2208-Mushroom-Medley',
            '4172-Mauve',
            '4175-Pebble'
          ],
          paths: []
        },
        blue: {
          options: [
            '2204-Poppy-Seed',
            '2214-Blue-Berry',
            '4132-Ash',
            '4155-Pewter',
            '4179-Smokey-Blue',
            '4180-Aquavert',
            '4181-Midnight-Blue'
          ],
          paths: []
        },
        red: {
          options: [
            '2166-Nutmeg-Spice',
            '2207-Cinnamon-Bark',
            '2210-Hot-Salsa',
            '2211-Tangerine-Zest',
            '4154-Burgundy',
            '4164-Salsa',
            '4186-Orange-Blast'
          ],
          paths: []
        },
        green: {
          options: ['2213-Baby-Lettuce', '4174-Conifer', '4183-Pistachio', '4184-Olive'],
          paths: []
        },
        yellow: {
          options: [
            '2186-Blanched-Almond',
            '2212-Fresh-Pineapple',
            '4157-Pearl',
            '4182-Spring-Green'
          ],
          paths: []
        }
      },
      isEdited(menuId) {
        this.toEdit[menuId] = false
      },
      isSelected: false
    }
  },
  created() {
    // load images before they are needed
    let i = 0
    for (let category in this.Colors) {
      for (let name of this.Colors[category].options) {
        this.Colors[category].paths.push(
          new URL(`../pics/WEB/small/${category}/${name}.jpg`, import.meta.url).href
        )
        let imageToCache = new Image()
        let l = this.Colors[category].paths.length
        imageToCache.src = this.Colors[category].paths[l - 1]
      }
    }
  },
  methods: {
    compareColor: function () {
      this.isColorCompareActive = true;
    },
    onColor: function (evt, category, color) {

      if (this.isColorCompareActive) {
        this.store.table.linoleum.texture_path_compare = new URL(
          `../pics/WEB/${category}/${color}.jpg`,
          import.meta.url
        ).href

        this.changeLinoleumMultiMaterial();
        
      } else {
        this.store.table.color = { category: category, name: color }

        this.store.table.linoleum.texture_path = new URL(
          `../pics/WEB/${category}/${color}.jpg`,
          import.meta.url
        ).href

        this.changeLinoleumMaterial();
      }


      // this.isEdited(1);
      // chosen color shall be kept highlighted when 'Linoleumfarbe'-card is closed
      
      const all = document.querySelectorAll('.color-selected');
      all.forEach((element) => {
        element.classList.remove('color-selected');
      });
      evt.target.classList.add('color-selected')
    },
    updateEdited: function (evt, menuId) {
      this.nowEdited = menuId
      // check if scrollbar is used and then let parts fade out
      // reach scrollbar parent
      // let scrollbar = document.getElementsByClassName('scrollbar')[0];
      // let accordion = scrollbar.children[0];
      // let pos = scrollbar.scrollTop;
      // let max = scrollbar.scrollHeight;
      // console.log('scrollHeight: ' + max);
      // console.log(accordion);
      // console.log('clientHeight: ' + accordion.clientHeight);
      // console.log(evt.srcElement);
    },
  }
})
</script>
<style lang="scss">
.color-category {
  height: 2.5em;
  padding: 0.1em;
}
.color-selected {
  width: 2.8em !important;
}
</style>
