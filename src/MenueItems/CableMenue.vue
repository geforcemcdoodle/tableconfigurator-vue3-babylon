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
        data-bs-target="#collapseFour"
        aria-expanded="false"
        aria-controls="collapseFour"
      >
        Kabelauslass
      </button>
      <!-- <checknote v-bind:edit="toEdit[1]" v-bind:nowEdited="nowEdited" v-bind:menuID="1"></checknote> -->
    </div>

    <div
      id="collapseFour"
      class="accordion-collapse collapse"
      aria-labelledby="headingFour"
      data-bs-parent="#accordion"
    >
      <div class="accordion-body">
        <div class="row">
          <button type="button" @click="addCableConduct" class="btn btn-light w-75 mx-auto mb-3">
            <svg-icon
              style="color: red; opacity: 0.5;"
              type="mdi"
              :path="plus_circle_outline"
            ></svg-icon>
            Kabeldurchlass hinzufügen
          </button>
        </div>

        <div v-if="cables.length > 0">
          <div v-for="cable in cables" v-bind:key="cable.id">
            <div class="row">
              <hr/>              
              <div class="d-flex justify-content-left mb-2">
                <svg-icon
                  class="icon-color"
                  type="mdi"
                  :path="minus_circle_outline"
                  @click="removeCableConduct"
                ></svg-icon>
                <select v-model="cable.type">
                  <option>Aluminiumring (80mm)</option>
                  <option disabled>Spalt</option>
                  <option disabled>Rechteckiger Deckel (30x12cm)</option>
                  <option disabled>Kabelwanne (ohne Durchlass)</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="d-flex justify-content-left">
                <div class="me-3">Position {{ cable.id+1 }}:</div>
                <label for="x-value">x:</label>
                <input
                  id="x-value"
                  type="number"
                  pattern="[0-20]"
                  class="input-number arrow"
                  @blur="removeArrow"
                  @focus="showArrow('x', cable.id)"
                  @change="changePosX($event, cable.id)"
                  value="0"
                  min="-length/2"
                  max="length"
                  style="width: 3em"
                />cm&nbsp&nbsp&nbsp&nbsp x &nbsp&nbsp&nbsp&nbsp
                <label for="y-value">y:</label>
                <input
                  id="y-value"
                  type="number"
                  class="input-number"
                  @blur="removeArrow"
                  @focus="showArrow('z', cable.id)"
                  @change="changePosZ($event, cable.id)"
                  value="0"
                  min="-width/2"
                  max="width"
                  style="width: 3em"
                />cm
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Checknote from './Checknote.vue';
import Calculation from '../Calculation.js'
import { defineComponent } from 'vue'
import { useStore } from '../stores/table'
import earcut from 'earcut'
import SvgIcon from '@jamescoyle/vue-icon'
import {
  mdiMinusCircleOutline, mdiPlusCircleOutline
} from '@mdi/js'

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
      cables: [],
      minus_circle_outline: mdiMinusCircleOutline,
      plus_circle_outline: mdiPlusCircleOutline,
      toEdit: [true, true, true, true, true],
      nowEdited: 0
    }
  },

  methods: {
    addCableConduct: function () {
      let cable = {
        id: this.cables.length,
        type: 'Aluminiumring (80mm)',
        pos: { x: 0, z: 0 },
        tray: false
      }
      this.cables.push(cable)

      this.store.cables.push(cable)
      this.store.holes.push(
        this.defineEdgePoints(
          0.4,
          0,
          360,
          new BABYLON.Vector3(cable.pos.x, this.store.table.geometry.height + 1.1, cable.pos.z)
        )
      )
      this.updateCoverBottom()
      this.updateLinoleum()
      this.store.shopping_cart.cable += 17
      // this.isEdited(3);
    },
    changePosX: function (evt, id) {
      let data = { x: -Number(evt.target.value) / this.cm_To_pixel, id: id }

      this.checkHolePositionX(data)
      this.checkHolePositionZ({ id: data.id, z: this.store.cables[data.id].pos.z })

      let { x, z } = this.store.cables[data.id].pos

      if (this.store.cables[data.id].type === 'Spalt') {
        let slit_contour = this.getRectangleContour({
          length: 0.7 * this.store.table.geometry.length,
          width: 0.4,
          radius: 0.2
        })
        for (let i = 0; i < slit_contour.length; i++) {
          slit_contour[i].addInPlace(new BABYLON.Vector3(x, 0, z))
        }
        this.store.holes[data.id] = slit_contour
      } else {
        this.store.holes[data.id] = this.defineEdgePoints(0.4, 0, 360, new BABYLON.Vector3(x, 0, z))
      }
      this.updateCoverBottom()
      this.updateLinoleum()

      this.removeArrow()
      this.showArrow('x', id)
    },
    changePosZ: function (evt, id) {
      let data = { z: Number(evt.target.value) / this.cm_To_pixel, id: id }

      this.checkHolePositionZ(data)
      this.checkHolePositionX({ id: data.id, x: this.store.cables[data.id].pos.x })
      let { x, z } = this.store.cables[data.id].pos
      if (this.store.cables[data.id].type === 'Spalt') {
        let slit_contour = this.getRectangleContour({
          length: 0.7 * this.store.table.geometry.length,
          width: 0.4,
          radius: 0.2
        })
        for (let i = 0; i < slit_contour.length; i++) {
          slit_contour[i].addInPlace(new BABYLON.Vector3(x, 0, z))
        }
        this.store.holes[data.id] = slit_contour
      } else {
        this.store.holes[data.id] = this.defineEdgePoints(0.4, 0, 360, new BABYLON.Vector3(x, 0, z))
      }
      this.updateCoverBottom()
      this.updateLinoleum()

      this.removeArrow()
      this.showArrow('z', id)
    },
    changetype: function (evt, id) {
      this.cables[id].type = evt.target.value
    },
    checkHolePositionX(data) {
      // validate user input
      let { z } = this.store.cables[data.id].pos;
      let x = data.x;
      let height = this.store.table.geometry.height + this.store.table.geometry.thickness;
      // empirical value to constrain hole
      let buffer = 0.8; 
      let direction = new BABYLON.Vector3(x + Math.sign(x) * buffer, 0, z);
      let length = direction.length();

      let pickingInfo_HoleEdge = this.getPickingInfo_HoleEdge(height, direction, length);
      let pickingInfo_HoleLeg = this.getPickingInfo_HoleLeg(height, direction, length, x);

      console.log("Table edge hit: " + pickingInfo_HoleEdge.hit);
      console.log("Leg model hit: " + pickingInfo_HoleLeg.hit);

      // set position to the maximum
      if (pickingInfo_HoleEdge.hit === true) {
        this.store.cables[data.id].pos.x =
          x < 0 ? pickingInfo_HoleEdge.pickedPoint.x + buffer : pickingInfo_HoleEdge.pickedPoint.x - buffer;
      } else {
        this.store.cables[data.id].pos.x = x;
      }
    },
    getPickingInfo_HoleEdge(height, direction, length) {
      let ray = new BABYLON.Ray(new BABYLON.Vector3(0, height, 0), direction.normalizeFromLength(length), length);
      let rayH = new BABYLON.RayHelper(ray);
      rayH.show(this.store.scene, new BABYLON.Color3(255,0,0));
      let pickingInfo = ray.intersectsMesh(this.store.table.edge.mesh, false);      

      return pickingInfo;
    },
    getPickingInfo_HoleLeg(height, direction, length, x_displacement) {
      let ray = new BABYLON.Ray(new BABYLON.Vector3(0, height - this.store.table.geometry.thickness, 0), direction.normalizeFromLength(length), length);
      // let ray = new BABYLON.Ray(new BABYLON.Vector3(0, height, 0), direction.normalizeFromLength(length), length);

      console.log(length);

      let rayH = new BABYLON.RayHelper(ray);
      rayH.show(this.store.scene, new BABYLON.Color3(255,0,0));

      let leg = x_displacement < 0 ? this.store.scene.getMeshByName("leg1") : this.store.scene.getMeshByName("leg2");
      let pickingInfo = ray.intersectsMesh(leg, false);

      return pickingInfo;
    },
    checkHolePositionZ(data) {
      // validate user input
      let { x } = this.store.cables[data.id].pos,
        z = data.z,
        h = this.store.table.geometry.height + this.store.table.geometry.thickness,
        buffer = 0.8,
        direction = new BABYLON.Vector3(x, 0, z + Math.sign(z) * buffer),
        l = direction.length(),
        ray = new BABYLON.Ray(new BABYLON.Vector3(0, h, 0), direction.normalizeFromLength(l), l)
      let pickingInfo = ray.intersectsMesh(this.store.table.edge.mesh, true)
      // set position to the maximum
      if (pickingInfo.hit === true) {
        this.store.cables[data.id].pos.z =
          z < 0 ? pickingInfo.pickedPoint.z + buffer : pickingInfo.pickedPoint.z - buffer
      } else {
        this.store.cables[data.id].pos.z = z
      }
    },
    removeArrow: function () {
      this.store.table.linoleum.mesh.material.alpha = 1
      this.store.table.coverBottom.isVisible = true
      this.arrow.dispose(false, true)
    },
    removeCableConduct: function (id) {
      this.cables.splice(id, 1)
      for (let i = 0; i < this.cables.length; i++) {
        this.cables[i].id = i
      }

      this.store.cables.splice(id, 1)
      for (let i = 0; i < this.store.cables.length; i++) {
        this.store.cables[i].id = i
      }
      this.store.holes.splice(id, 1)
      this.updateCoverBottom()
      this.updateLinoleum()
      this.store.shopping_cart.price.cable -= 17
    },
    showArrow: function (axis, id) {
      /* in x or z direction, shown when cable outlet position field has focus
       */
      this.store.table.linoleum.mesh.material.alpha = 0.5
      this.store.table.coverBottom.isVisible = false
      let length = Number
      if (axis === 'x') {
        length = this.store.table.geometry.length / 2 - 0.8 + this.store.cables[id].pos.x
      } else {
        length = this.store.table.geometry.width / 2 - 0.8 - this.store.cables[id].pos.z
      }
      let h =
        this.store.table.geometry.height +
        this.store.table.geometry.thickness +
        this.store.table.linoleum.thickness +
        0.2
      let d = 0.05
      let f = 0.08
      let shape = [
        new BABYLON.Vector3(d, 0, -d),
        new BABYLON.Vector3(-length + d, 0, -d),
        new BABYLON.Vector3(-length + d, 0, -f * length),
        new BABYLON.Vector3(-length - d, 0, 0),
        new BABYLON.Vector3(-length + d, 0, f * length),
        new BABYLON.Vector3(-length + d, 0, d),
        new BABYLON.Vector3(d, 0, d),
        new BABYLON.Vector3(d, 0, -d)
      ]
      let mat = new BABYLON.StandardMaterial('arrowMat', this.store.scene)
      mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0)
      this.arrow = BABYLON.MeshBuilder.ExtrudePolygon(
        'arrowExtruded',
        { shape: shape, depth: 0.05, sideOrientation: 2, updatable: true },
        this.store.scene, earcut
      )
      this.arrow.material = mat
      if (axis === 'z') {
        this.arrow.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD)
      }
      this.arrow.position = new BABYLON.Vector3(
        this.store.cables[id].pos.x,
        h,
        this.store.cables[id].pos.z
      )
    },
    updateEdited: function (evt, menuId) {
      // this.nowEdited = menuId;
      // // check if scrollbar is used and then let parts fade out
      // // reach scrollbar parent
      // let scrollbar = document.getElementsByClassName('scrollbar')[0];
      // let accordion = scrollbar.children[0];
      // let pos = scrollbar.scrollTop;
      // let max = scrollbar.scrollHeight;
      // console.log('scrollHeight: ' + max);
      // console.log(accordion);
      // console.log('clientHeight: ' + accordion.clientHeight);
      // console.log(evt.srcElement);
    }
  }
})
</script>