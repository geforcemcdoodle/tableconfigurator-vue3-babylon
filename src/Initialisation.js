import earcut from 'earcut'
import Calculation from './Calculation.js'
import { useStore } from './stores/table'
import leg from './models/1leg_dark_steel.glb?url'
import glb_texture from './pics/core_material/Mammutbaum-Holz_quer.jpg'
import { OBJFileLoader } from '@babylonjs/loaders/OBJ/objFileLoader'

export default {
  mixins: [Calculation],
  setup() {
    const store = useStore()
    return {
      store
    }
  },
  data() {
    return {
      camera: null,
      initCamera: function () {
        this.store.camera = new BABYLON.ArcRotateCamera(
          'Camera',
          0,
          10,
          15,
          new BABYLON.Vector3(0, 3, 0),
          this.store.scene
        )
        this.store.camera.setPosition(new BABYLON.Vector3(0, 10, 15))
        this.store.camera.attachControl(this.store.canvas, false)
        this.store.camera.lowerBetaLimit = Math.PI / 100
        this.store.camera.upperBetaLimit = Math.PI / 2 - Math.PI / 100
        this.store.camera.lowerRadiusLimit = 5
        this.store.camera.upperRadiusLimit = 45
        // this.store.camera.wheelDeltaPercentage = 0.02;
        // camera trail
        BABYLON.ArcRotateCamera.prototype.spinTo = function (whichprop, targetval, speed) {
          var ease = new BABYLON.CubicEase()
          ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
          BABYLON.Animation.CreateAndStartAnimation(
            'at4',
            this,
            whichprop,
            speed,
            120,
            this[whichprop],
            targetval,
            0,
            ease
          )
        }
      },
      initLight: function () {
        let hemisphericLight = new BABYLON.HemisphericLight(
          '',
          new BABYLON.Vector3(0, 1, 0),
          this.store.scene
        )
        hemisphericLight.intensity = 1000
        // so that we can see the bottom of the table
        let pointLight = new BABYLON.PointLight('', new BABYLON.Vector3(0, 3, 0), this.store.scene)


        // so that we can see the table edge
        // 2DO: one side still remains dark for incomprehensible reason
        let pointLight2 = new BABYLON.PointLight(
          '',
          new BABYLON.Vector3(this.store.table.geometry.width + 10, this.store.table.geometry.height+10, this.store.table.geometry.length + 10),
          this.store.scene
        )
        let pointLight3 = new BABYLON.PointLight(
          '',
          new BABYLON.Vector3(-this.store.table.geometry.width - 10, this.store.table.geometry.height+10, this.store.table.geometry.length + 10),
          this.store.scene
        )
        let pointLight4 = new BABYLON.PointLight(
          '',
          new BABYLON.Vector3(this.store.table.geometry.width + 10, this.store.table.geometry.height+10, -this.store.table.geometry.length - 10),
          this.store.scene
        )
        let pointLight5 = new BABYLON.PointLight(
          '',
          new BABYLON.Vector3(-this.store.table.geometry.width - 10, this.store.table.geometry.height+10, -this.store.table.geometry.length - 10),
          this.store.scene
        )
        //illuminate the table leg
        let pointLight6 = new BABYLON.PointLight(
          '',
          new BABYLON.Vector3(0 , this.store.table.geometry.height-1, this.store.table.geometry.length/2 + 2),
          this.store.scene
        )
        pointLight6.intensity = 100
      },

      initDecoration: function () {
        /* called by 'Standort'
           ImportMesh currently can't load locally stored files, thus this.store.assetsManager is used
        */
        this.store.assetsManager = new BABYLON.this.store.assetsManager(this.store.scene)
        this.store.assetsManager.autoHideLoadingUI = 1
        let scale = 10
        //BABYLON.SceneLoader.ImportMesh('', 'https://raw.githubusercontent.com/BabylonJS/MeshesLibrary/master/', 'boombox.glb', this.store.scene, (meshes) => {
        BABYLON.SceneLoader.ImportMesh(
          null,
          './models/',
          '1leg_dark_steel.glb',
          this.store.scene,
          (meshes) => {
            this.importMesh = meshes[0]
            this.importMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD)
            this.importMesh.scaling = new BABYLON.Vector3(scale, scale, scale)
            this.importMesh.position = new BABYLON.Vector3(
              (0.8 * this.geometry.length) / 2,
              this.geometry.height + 3 * this.thickness,
              (-0.8 * this.geometry.width) / 2
            )
          }
        )
        this.store.assetsManager.autoHideLoadingUI = 1
        let laptop = null
        const meshTask = this.store.assetsManager.addMeshTask('', '', './models/1leg_dark_steel.glb')
        meshTask.onSuccess = function (task) {
          laptop = task.loadedMeshes[0]
          laptop.scaling = new BABYLON.Vector3(scale, scale, scale)
          laptop.position = new BABYLON.Vector3(
            0,
            this.geometry.height + 3 * this.thickness,
            (-0.4 * this.geometry.width) / 2
          )
        }
        laptop.material = this.getMaterial(this.texture_jpg, true)
        this.store.assetsManager.load()
      },
      initTableLegs() {
        let _this = this;
        let scale = 10,
          x1 = this.store.table.geometry.length / 2 - 0.5,
          x2 = -this.store.table.geometry.length / 2 + 0.5,
          y = -this.store.table.geometry.thickness - this.store.table.linoleum.thickness

        // Shading is not visible so try
        OBJFileLoader.OPTIMIZE_WITH_UV = true
        OBJFileLoader.IMPORT_VERTEX_COLORS = true
        OBJFileLoader.COMPUTE_NORMALS = true
        OBJFileLoader.OPTIMIZE_NORMALS = true

        this.store.assetsManager = new BABYLON.AssetsManager(this.store.scene)        
        this.store.assetsManager.autoHideLoadingUI = true
        this.store.assetsManager.useDefaultLoadingScreen = false
        let leg1 = null,
          leg2 = null

        // 1st leg
        const meshTask1 = this.store.assetsManager.addMeshTask('leg1', '', leg)
        // 2nd leg
        const meshTask2 = this.store.assetsManager.addMeshTask('leg2', '', leg)

        meshTask1.onSuccess = function (task) {
          leg1 = task.loadedMeshes[0];
          leg1.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
          leg1.scaling = new BABYLON.Vector3(scale, scale, scale);
          leg1.position = new BABYLON.Vector3(x1, y, -_this.store.table.leg_width/2);
          leg1.name = 'leg1';
          task.loadedMeshes[0] = leg1;
          _this.store.table.legs.push(leg1);
        }
        meshTask2.onSuccess = function (task) {
          leg2 = task.loadedMeshes[0];
          leg2.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
          leg2.scaling = new BABYLON.Vector3(scale, scale, scale);
          leg2.position = new BABYLON.Vector3(x2, y, -_this.store.table.leg_width/2);
          leg2.name = 'leg2';
          _this.store.table.legs.push(leg2)
        }

        this.store.assetsManager.load();
      },
      getGLBMaterial() {
        let material = new BABYLON.StandardMaterial("baseMat", this.store.scene);

        let textureTask = this.store.assetsManager.addTextureTask("image task", glb_texture);
        textureTask.onSuccess = function (task) {
          material.diffuseTexture = task.texture;
        };
        return material;
      },
      initWall() {
        /**
         *  Called by Customisation>>Location
         */
        let contour = this.getWallContour()
        this.wall = BABYLON.MeshBuilder.CreatePolygon(
          '',
          { shape: contour, depth: 30, sideOrientation: 2, updatable: true },
          this.store.scene
        )
        this.updateWall()
        this.wall.rotate(BABYLON.Axis.Z, Math.PI, BABYLON.Space.WORLD)
        this.updateCamera()
      },
      initTableEdge() {
        let shape = this.defineShape()
        let Uvs = this.defineUVs(shape)
        this.store.table.edge.mesh = BABYLON.MeshBuilder.CreateRibbon(
          '',
          {
            pathArray: shape,
            closeArray: false,
            closePath: false,
            offset: 0,
            updatable: true,
            uvs: Uvs,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
          },
          this.store.scene
        )
        this.store.table.edge.mesh.material = this.getMaterial(this.store.table.edge.texture_path)
      },
      initContour() {
        this.store.table.contour = this.defineContour(this.store.table.geometry)
      },
      initLinoleum() {
        this.store.table.linoleum.mesh = BABYLON.MeshBuilder.ExtrudePolygon(
          '',
          {
            shape: this.store.table.contour,
            depth: this.store.table.linoleum.thickness,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            updatable: true
          },
          this.store.scene,
          earcut
        )

        this.store.table.linoleum.mesh.position = new BABYLON.Vector3(
          0,
          this.store.table.geometry.height +
            this.store.table.geometry.thickness +
            this.store.table.linoleum.thickness,
          0
        )
        this.store.table.linoleum.mesh.material = this.getMaterial(
          this.store.table.linoleum.texture_path,
          false
        )
      },
      initCoverBottom() {
        this.store.table.coverBottom = BABYLON.MeshBuilder.ExtrudePolygon(
          '',
          { shape: this.store.table.contour, depth: 0.01, updatable: true },
          this.store.scene,
          earcut
        )
        this.store.table.coverBottom.position = new BABYLON.Vector3(0, this.store.table.geometry.height, 0)
        this.store.table.coverBottom.material = this.getMaterial(this.store.table.core_material)
      }
    }
  }
}
