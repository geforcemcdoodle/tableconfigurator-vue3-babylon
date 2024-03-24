<template>
  <canvas class="canvas-mounting" id="canvas"></canvas>
  <div class="row overlap-with-canvas">
    <div>
      <svg-icon
        class="icon-color"
        type="mdi"
        :path="cube_outline"
        @click="perspective('iso')"
      ></svg-icon>
      <svg-icon
        class="icon-color"
        type="mdi"
        :path="square_outline"
        @click="perspective('front')"
      ></svg-icon>
      <svg-icon
        class="icon-color"
        type="mdi"
        :path="magnify_plus_outline"
        @click="zoomIn"
      ></svg-icon>
      <svg-icon
        class="icon-color"
        type="mdi"
        :path="magnify_minus_outline"
        @click="zoomOut"
      ></svg-icon>
    </div>
  </div>
</template>

<script>
import Initialisation from './Initialisation.js'
import earcut from 'earcut'
import { useStore } from './stores/table';
import SvgIcon from '@jamescoyle/vue-icon'
import {
  mdiCubeOutline,
  mdiSquareOutline,
  mdiMagnifyPlusOutline,
  mdiMagnifyMinusOutline
} from '@mdi/js'

export default {
  mixins: [Initialisation],
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
      cube_outline: mdiCubeOutline,
      square_outline: mdiSquareOutline,
      magnify_plus_outline: mdiMagnifyPlusOutline,
      magnify_minus_outline: mdiMagnifyMinusOutline
    }
  },
  methods: {
    createScene() {
      let _this = this
      this.canvas = document.getElementById('canvas')
      this.engine = new BABYLON.Engine(this.canvas, true)
      this.store.scene = new BABYLON.Scene(this.engine)      
      this.store.scene.clearColor = new BABYLON.Color3(1, 1, 1)
      // this.store.scene.createDefaultEnvironment({
      //   createSkybox: false,
      //   enableGroundMirror: false,
      // });

      //reducing Memory Usage
      this.store.scene.clearCachedVertexData()

      this.initCamera()
      this.initLight()
      this.initTableEdge()
      this.initContour()
      this.initLinoleum()
      this.initCoverBottom()
      this.initTableLegs()

      this.engine.runRenderLoop(function () {
        _this.store.scene.render()
      })
    },
    perspective(value) {
      if (value === 'front') {
        this.store.camera.setPosition(new BABYLON.Vector3(0, 10, 15))
      } else {
        this.store.camera.setPosition(new BABYLON.Vector3(-10, 20, 10))
      }
    },
    zoomIn() {
      this.store.camera.radius -= 0.5;
    },
    zoomOut() {
      this.store.camera.radius += 0.5;
      console.log(this.store.camera);
    }
  },
  mounted() {
    this.createScene()
  }
}
</script>

<style lang="scss">
.canvas-mounting {
  width: 100%;
  min-width: 50%;
  box-shadow: 1px 1px 10px 1px rgba(9, 9, 9, 0.1);
  &:focus {
    box-shadow: 1px 1px 10px 1px rgba(9, 9, 9, 0.8);
    border: none;
  }
}
.overlap-with-canvas {
  position: relative;
  top: -30px;
  text-align: center;
}
</style>
