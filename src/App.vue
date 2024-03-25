<script>
import Assembly from './Assembly.vue'
import Menue from './Menue.vue'
import Initialisation from './Initialisation.js'
import * as BABYLON from '@babylonjs/core/Legacy/legacy'
import { useStore } from './stores/table'
import { mdiCartOutline } from '@mdi/js'
import SvgIcon from '@jamescoyle/vue-icon'

export default {
  mixins: [Initialisation],
  components: {
    Assembly,
    Menue,
    SvgIcon
  },
  name: 'app',
  setup() {
    const store = useStore()
    return {
      store
    }
  },
  data() {
    return {
      cart_outline: mdiCartOutline,
      price_singly: 386.64,
      price_total: 386.64,
      quantity: 1,
      media: [
        {
          src: new URL(`./pics/Legs/leg1_detail1.png`, import.meta.url).href,
          caption: 'Detail 1',
          thumb: new URL(`./pics/Legs/leg1_detail1_h150.png`, import.meta.url).href
        },
        {
          src: new URL(`./pics/Legs/leg1_detail2.png`, import.meta.url).href,
          caption: 'Detail 2',
          thumb: new URL(`./pics/Legs/leg1_detail2_h150.png`, import.meta.url).href
        }
      ]
    }
  },
  methods: {
    openGallery(index) {
      console.log(index)
    }
  },
  watch: {
    quantity: function (value) {
      this.price_total = this.price_singly * value
      this.price_total = this.price_total.toFixed(2)
    }
  }
}
</script>

<template>
  <p style="text-align: center">Arbeitsprobe von Paul Middendorf (work in progress)</p>
  <div class="d-flex-inline brico-container">
    <div class="row">
      <div class="col-md-8 stick-assembly">
        <assembly />
        <div v-if="store.isActive.menu.leg">
          <ul style="margin: 0; padding: 0">
            <li
              v-for="(image, index) in media"
              :key="index"
              style="display: inline-block; margin: 0 5px 5px 0"
            >
              <img
                :src="image.thumb"
                style="height: 100px; cursor: pointer"
                @click="openGallery(index)"
              />
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-4 app-col-right g-5">
        <div class="menu-intro text-center text-md-start">
          <span class="product-type d-none d-md-block">Tischkonfigurator</span>
          <h5 style="color: #2d4156; font-weight: bold;">Gestalten Sie Ihren Tisch</h5>
          <p class="d-none d-sm-block">
          </p>
        </div>

        <menue />

        <div class="stick-shopping-cart">
          <div class="row">
            <div class="col">
              <label class="shopping-cart__qty-label" for="qty">Menge</label>
            </div>
            <div class="d-flex col">
              <input
                id="qty"
                type="number"
                class="w-25 border-box h4 rounded bg-white mx-1 border-0 input-number"
                v-model="quantity"
                min="1"
                max="100"
              />
              <button type="button" class="bg-white font-weight-bold text-center rounded border-0 mx-1 mb-2"><b>+</b></button>
              <button type="button" class="bg-white mr-2 pr-2 mr-2 font-weight-bold text-center rounded border-0 mb-2"><b>-</b></button>
            </div>
          </div>

          <div class="row shopping-cart__price">
            <div class="col">
              <div class="sum">Gesamtpreis &nbsp</div>
              <div class="tax">(inkl. 16% MwSt.)</div>
            </div>
            <br />
            <div class="col">
              <!-- <input type="number" class="quantity" v-model="store.shopping_cart.qty" min="1"> -->
              <div class="price">{{ store.price_total }} €</div>
            </div>
          </div>

          <div class="row">
            <button class="cart">
              <svg-icon class="color" type="mdi" :path="cart_outline"></svg-icon>
              In den Warenkorb
            </button>
          </div>

          <div class="d-sm-flex justify-content-end d-none">
            <div class="icon-truck"></div>
            <div class="transport-time" style="padding: 1px">Versand:&nbsp</div>
            <div class="" style="">10 € pro Bestellung</div>
          </div>
          <div class="d-sm-flex justify-content-end d-none">
            <!-- &nbsp this is no solution, escpecially with other languages -->
            <div class="icon-clock"></div>
            <div class="transport-time">Lieferzeit:&nbsp</div>
            <div>1-2 Wochen&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</div>
          </div>
        </div>

        <div class="d-flex justify-content-end d-sm-none">
          <div class="icon-truck"></div>
          <div class="transport-time" style="padding: 1px">Versand:&nbsp</div>
          <div class="" style="">10 € pro Bestellung</div>
        </div>
        <div class="d-flex justify-content-end d-sm-none">
          <!-- &nbsp this is no solution, escpecially with other languages -->
          <div class="icon-clock"></div>
          <div class="transport-time">Lieferzeit:&nbsp</div>
          <div>1-2 Wochen&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</div>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss">
* {
  font-family: Hind, sans-serif;
  color: #4f4f4f;
}
@media (max-width: 768px) {
  .menu-intro {
    padding-bottom: 0px !important;
  }
  .stick-shopping-cart {
    position: sticky !important;
    z-index: 10;
    //width: 100%;
    bottom: 10px;
    background-color: #f4f4f9;
  }
  .brico-container {
    margin: 0px 0px !important;
  }
  .stick-assembly {
    top: 1px;
    position: sticky;
    z-index: 10;
    margin: 0px 0px !important;
  }
  .app-col-right {
    margin: 0px 0px !important;
  }
}
@media (max-width: 576px) {
  .brico-container {
    margin: 0px 0px !important;
  }
  .stick-assembly {
    top: 1px;
    position: sticky;
    z-index: 10;
    margin: 0px 0px !important;
  }
}
.stick-shopping-cart {
  background-color: #f4f4f9;
}
.shopping-cart__qty-label {
  color: #2D4156;  
  font-weight: bold;
}
.app-col-right {
  position: relative;
  min-height: 90vh;
}
.brico-container {
  padding: 0 15px;
  margin: 0 65.5px;
}
.menu-intro {
  padding-bottom: 100px;
}
.product-type {
  font-family: Montserrat, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #4f4f4f;
}
p {
  font-family: Montserrat, sans-serif;
  font-size: 0.875rem;
  font-weight: 100;
  color: #4f4f4f;
}
h5 {
  font-weight: 600;
  color: #212529;
}
div.container {
  margin-top: 60px;
}
.shopping-cart__price {
  background-color: #f4f4f9;
}
.infos {
  background-color: #fff;
  position: relative;
  margin-left: 0px;
  margin-right: 0px;
  top: 210px;
  border-top: 1px solid rgb(202, 200, 200);
  font-size: 14px;
}
.transport-time {
  font-weight: bold;
}
.custom-shop {
  height: 770px;
}
.mdi-cart-outline {
  color: grey;
}
.icon-truck {
  width: 20px;
  height: 20px;
  margin-left: 1px;
  background-color: grey;
  background: url('https://api.iconify.design/mdi-truck-outline.svg?width=18&height=18') no-repeat
    center center;
}
.icon-clock {
  width: 20px;
  height: 20px;
  margin-left: 1px;
  background: url('https://api.iconify.design/mdi-clock-outline.svg?width=18&height=18') no-repeat
    center center;
}
.cart {
  font-family: Hind, sans-serif;
  width: 100%;
  //margin: 1px 14px;
  background: #e9eced;
  font-size: 24px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  line-height: 1.5;
  //padding: 0px 6px 12px;
  background: linear-gradient(180deg #e9eced 26%, #212529 76%);
  color: grey;
  border: none;
  //background: linear-gradient(180deg,#8c1243 26%,#690541 76%);
}
.sum-tax {
  position: absolute;
  right: 20px;
}
.sum {
  color: #2D4156;
  font-weight: bold;
  font-size: 14px;
}
.tax {
  font-size: 12px;
  color: grey;
}
.price {
  color: #212529;
  font-size: 24px;
  font-weight: bold;
  margin-right: 10px;
  margin-left: 10px;
}
.quantity {
  font-size: 20px;
  width: 30px;
  margin: 0px 0px 7px 0px;
  padding: 0px 7px;
  background-color: #f4f4f9;
}
.shop {
  width: 360px;
  border: solid;
  border-color: #ddd;
  border-width: 1px;
  position: absolute;
  bottom: 0;
  background-color: #f4f4f9;
  box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.25);

  .shop-quantity-price {
    margin-top: 16px;
    margin-right: 10px;
    display: flex;
    justify-content: flex-end;
  }
}
.stick-shopping-cart {
  //2DO: where does 10.5 come from, use variables
  margin: 10.5px 0px;
  padding: 10.5px;
  position: absolute;
  width: 100%;
  left: 10.5px;
  bottom: 1px;
}
</style>