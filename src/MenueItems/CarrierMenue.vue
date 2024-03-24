<template>
  <div class="accordion-item">
    <div class="accordion-header cursor-color" id="headingThree" @click="moveCamera(2)">
      <button
        class="accordion-button collapsed py-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseThree"
        aria-expanded="false"
        aria-controls="collapseThree"
      >
        Trägerplatte
      </button>
      <!-- <checknote v-bind:edit="toEdit[1]" v-bind:nowEdited="nowEdited" v-bind:menuID="1"></checknote> -->
    </div>

    <div
      id="collapseThree"
      class="accordion-collapse collapse"
      aria-labelledby="headingThree"
      data-bs-parent="#accordion"
    >
      <div class="accordion-body">
        <div class="row mb-3">
          <div>
            <select
              v-model="plate.type.choice"
            >
              <option v-for="value in plate.type.options">{{ value }}</option>              
            </select>
          </div>
        </div>
        <div class="plate-menu">
          <div class="plate-menu-title">Echtholz-Kante:</div>
          
          <div id="carousel" class="carousel slide">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img :src="plate.edge.paths[0]" class="d-block pic-edge-size" alt="...">
                <text x="50%" y="50%" fill="#444" dy=".3em">{{plate.edge.options[0]}}</text>
              </div>
              <div class="carousel-item">
                <img :src="plate.edge.paths[1]" class="d-block pic-edge-size" alt="...">
                <text x="50%" y="50%" fill="#444" dy=".3em">{{plate.edge.options[1]}}</text>
              </div>
              <div class="carousel-item">
                <img :src="plate.edge.paths[2]" class="d-block pic-edge-size" alt="...">
                <text x="50%" y="50%" fill="#444" dy=".3em">{{plate.edge.options[2]}}</text>
              </div>
              <div class="carousel-item">
                <img :src="plate.edge.paths[3]" class="d-block pic-edge-size" alt="...">
                <text x="50%" y="50%" fill="#444" dy=".3em">{{plate.edge.options[3]}}</text>
              </div>
              <div class="carousel-item">
                <img :src="plate.edge.paths[4]" class="d-block pic-edge-size" alt="...">
                <text x="50%" y="50%" fill="#444" dy=".3em">{{plate.edge.options[4]}}</text>
              </div>
            </div>
            <button @click="slidePrevious()" class="carousel-control-prev" type="button" data-bs-target="#carousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button @click="slideNext()" class="carousel-control-next" type="button" data-bs-target="#carousel" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>


        <hr>
        <div class="plate-menu-title">Plattenstärke:</div>
        <div v-for="value in plate.thickness.options" v-bind:key="value" class="form-check-inline">
          <label class="form-check-label">
          <input @click="changePlate('thickness', value*10)" type="radio" class="form-check-input" name="thicknessradio">{{value}}mm
          </label>
        </div>
        <hr>
        <div class="plate-menu-title">Kantenschräge:</div>
        <div v-for="value in plate.degree.options" v-bind:key="value" class="form-check-inline">
          <label class="form-check-label">
          <input @click="changePlate('degree', value)" type="radio" class="form-check-input" name="degreeradio">{{value}}°
          </label>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Checknote from './Checknote.vue';
import { defineComponent } from 'vue'
import { useStore } from '../stores/table'
import Calculation from '../Calculation.js'

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
      nowEdited: 0,
      plate: {
        form: { name: 'rectangle', id: 0 },
        type: {
          choice: 'Stäbchenplatte',
          options: [ 'Stäbchenplatte', 'Multiplex Birke', 'MDF schwarz durchgefärbt' ],
          
          paths: [
            new URL(`../pics/edge/multiplex_birke.jpg`, import.meta.url).href,
            new URL(`../pics/edge/multiplex_buche.jpg`, import.meta.url).href,
            new URL(`../pics/edge/mdf_black.jpg`, import.meta.url).href
          ]
        },
        edge: {
          choice: 'Roteiche',
          options: ['Roteiche', 'Buche', 'Kirschbaum', 'Lärche', 'Nussbaum'],
          paths: [
            new URL(`../pics/edge/roteiche_radial.jpg`, import.meta.url).href,
            new URL(`../pics/edge/buche_radial.jpg`, import.meta.url).href,
            new URL(`../pics/edge/kirschbaum_radial.jpg`, import.meta.url).href,
            new URL(`../pics/edge/laerche_radial.jpg`, import.meta.url).href,
            new URL(`../pics/edge/nussbaum_radial.jpg`, import.meta.url).href
          ]
        },
        thickness: { choice: 25, options: [18, 24, 25, 27] },
        degree: { choice: 90, options: [90, 25] }
      },
      toEdit: [true, true, true, true, true],

      isEdited(menuId) {
        this.toEdit[menuId] = false
      }
    }
  },
  methods: {
    slidePrevious() {
      let index_prev = this.getIndexPrev();

      let index = index_prev == 0 ? 4 : index_prev - 1;
      this.changeEdgeMaterial(this.plate.edge.paths[index]);
      
    },
    slideNext() {
      let index_prev = this.getIndexPrev();

      let index = index_prev == 4 ? 0 : index_prev + 1;
      this.changeEdgeMaterial(this.plate.edge.paths[index]);
      
    },
    getIndexPrev() {
      let active = document.getElementsByClassName('carousel-item active');
      let edge_option_prev_name = active[0].innerText;
      let index_prev = this.plate.edge.options.indexOf(edge_option_prev_name);

      return index_prev;
    },
    changePlate: function (property, value) {
      if (property === 'thickness') {
        this.store.table.geometry.thickness = value / this.cm_To_pixel / 100;
        this.updateAll();
      } else if (property === 'edge') {
      } else if (property === 'type') {
        let index = this.plate.type.options.indexOf(value);
      } else if (property === 'degree') {
        this.store.shopping_cart.price.degree = value == 90 ? 0 : 31;
        this.store.table.degree = value;
        this.updateTableEdge();
        this.updateCoverBottom();
      }
      this.isEdited(2)
    },
  },
  watch: {
    'plate.type.choice': function (value) {
      switch (value) {
        case 'Stäbchenplatte':
          this.changeCoreMaterial(
            new URL(`../pics/core_material/Mammutbaum-Holz_quer.jpg`, import.meta.url).href,
            new URL(`../pics/core_material/multiplex_buche_ged_furniert.jpeg`, import.meta.url).href
            );
          break;
        case 'Multiplex Birke':
          this.changeCoreMaterial(
            new URL(`../pics/edge/multiplex_buche.jpg`, import.meta.url).href,
            new URL(`../pics/edge/buche_radial.jpg`, import.meta.url).href,
          );
          break;
        case 'MDF schwarz durchgefärbt':
          this.changeCoreMaterial(
            new URL(`../pics/edge/mdf_black.jpg`, import.meta.url).href,
            new URL(`../pics/edge/mdf_black.jpg`, import.meta.url).href,
          );
          break;
      }
    }    
  }
})
</script>
<style lang="scss">
.pic-edge-size {
  width: 100%;
  height: 100px;
}
</style>
