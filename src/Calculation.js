import earcut from 'earcut'
import { useStore } from './stores/table'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const store = useStore();
    return {
      store
    }
  },
  data() {
    return {
      cm_To_pixel: 10,
      profile: 'circle',
      getEllipseContour: function (geometry) {
        /* contains the circle as a special case */
        let a = geometry.length / 2
        let b = geometry.width / 2
        let dt = 0.1
        let points = []

        for (let t = 0; t <= Math.PI * 2; t += dt) {
          let x = a * Math.cos(t)
          let z = b * Math.sin(t)
          x = Number(x.toFixed(3))
          z = Number(z.toFixed(3))
          let v = new BABYLON.Vector3(x, 0, z)
          points.push(v)
        }
        return points
      },
      getRectangleContour: function (geometry) {
        /* called after change of geometry
             geometry begins with top right corner, then goes anticlockwise
          */
        geometry.vector_translate_1 = new BABYLON.Vector3(
          eval(`${geometry.length} / 2 - ${geometry.radius}`),
          0,
          eval(`${geometry.width} / 2 - ${geometry.radius}`)
        )
        let edge_top_right = this.defineEdgePoints(
          geometry.radius,
          0,
          90,
          geometry.vector_translate_1
        )
        geometry.vector_translate_2 = new BABYLON.Vector3(
          eval(`-${geometry.length} / 2 + ${geometry.radius}`),
          0,
          eval(`${geometry.width} / 2 - ${geometry.radius}`)
        )
        let edge_top_left = this.defineEdgePoints(
          geometry.radius,
          90,
          180,
          geometry.vector_translate_2
        )
        geometry.vector_translate_3 = new BABYLON.Vector3(
          eval(`-${geometry.length} / 2 +  ${geometry.radius}`),
          0,
          eval(`-${geometry.width} / 2 + ${geometry.radius}`)
        )
        let edge_bottom_left = this.defineEdgePoints(
          geometry.radius,
          180,
          270,
          geometry.vector_translate_3
        )
        geometry.vector_translate_4 = new BABYLON.Vector3(
          eval(`${geometry.length} / 2 -  ${geometry.radius}`),
          0,
          eval(`-${geometry.width} / 2 + ${geometry.radius}`)
        )
        let edge_bottom_right = this.defineEdgePoints(
          geometry.radius,
          270,
          360,
          geometry.vector_translate_4
        )
        // Merge edge points
        let contour = edge_top_right
          .concat(edge_top_left)
          .concat(edge_bottom_left)
          .concat(edge_bottom_right)
        contour.push(contour[0])
        return contour
      },
      getBarrel1Contour: function (geometry) {
        /* bulges top and bottom only */
        let l = geometry.length
        let w = geometry.width
        let r = geometry.radius
        let b = 1 // bulge value

        // define outer arc
        let r_l = (4 * b ** 2 + l ** 2) / 8 / b
        let ym_l = w / 2 - r_l

        let f_l = function (r, x) {
          return ym_l + (r ** 2 - x ** 2) ** (1 / 2)
        }
        let y_l = f_l(r_l - r, l / 2 - r)
        // hypothenuse
        let c = ym_l + (r_l ** 2 - (l / 2 - r) ** 2) ** (1 / 2) - y_l
        // angular distance to upper contact point with bulge as seen from edge
        let epsilon = (Math.acos(r / c) / Math.PI) * 180
        // edge points anticlockwise
        let edge_top_right = this.defineEdgePoints(
          r,
          0,
          90 - epsilon,
          new BABYLON.Vector3(l / 2 - r, 0, y_l)
        )
        let edge_top_left = this.defineEdgePoints(
          r,
          90 + epsilon,
          180,
          new BABYLON.Vector3(-l / 2 + r, 0, y_l)
        )
        let edge_bottom_left = this.defineEdgePoints(
          r,
          180,
          270 - epsilon,
          new BABYLON.Vector3(-l / 2 + r, 0, -y_l)
        )
        let edge_bottom_right = this.defineEdgePoints(
          r,
          270 + epsilon,
          360,
          new BABYLON.Vector3(l / 2 - r, 0, -y_l)
        )
        // angular distance to upper contact as seen from upper bulge
        let gamma = (Math.acos(Math.abs(edge_top_left[0].x) / r_l) / Math.PI) * 180
        let bulge_top = this.defineEdgePoints(
          r_l,
          gamma,
          180 - gamma,
          new BABYLON.Vector3(0, 0, ym_l)
        )
        // arc mesh bottom
        let bulge_bottom = this.defineEdgePoints(
          r_l,
          180 + gamma,
          360 - gamma,
          new BABYLON.Vector3(0, 0, -ym_l)
        )
        // merge segments
        let contour = edge_top_right
          .concat(bulge_top)
          .concat(edge_top_left)
          .concat(edge_bottom_left)
          .concat(bulge_bottom)
          .concat(edge_bottom_right)
        contour.push(contour[0])
        return contour
      },
      getBarrel2Contour: function (geometry) {
        /* bulges everywhere */
        let l = geometry.length,
          w = geometry.width,
          r = geometry.radius,
          b = 1 // bulge value

        let xySolution = function (a, b, c, d) {
          /*
              returns the centre coordinates of the upper left edge circle
              a = ym_l
              b = r_l
              c = r_w
              d = xm_w
              the x,y euqations are derived from https://www.wolframalpha.com/calculators/derivative-calculator/
            */
          let x =
            (a ** 2 * d -
              (a ** 6 * -1 +
                2 * a ** 4 * b ** 2 +
                2 * a ** 4 * c ** 2 -
                2 * a ** 4 * d ** 2 -
                a ** 2 * b ** 4 +
                2 * a ** 2 * b ** 2 * c ** 2 +
                2 * a ** 2 * b ** 2 * d ** 2 -
                a ** 2 * c ** 4 +
                2 * a ** 2 * c ** 2 * d ** 2 -
                a ** 2 * d ** 4) **
                (1 / 2) +
              b ** 2 * d -
              c ** 2 * d +
              d ** 3) /
            (2 * (a ** 2 + d ** 2))
          let y =
            ((-(
              a ** 2 * d -
              (a ** 6 * -1 +
                2 * a ** 4 * b ** 2 +
                2 * a ** 4 * c ** 2 -
                2 * a ** 4 * d ** 2 -
                a ** 2 * b ** 4 +
                2 * a ** 2 * b ** 2 * c ** 2 +
                2 * a ** 2 * b ** 2 * d ** 2 -
                a ** 2 * c ** 4 +
                2 * a ** 2 * c ** 2 * d ** 2 -
                a ** 2 * d ** 4) **
                (1 / 2) +
              b ** 2 * d -
              c ** 2 * d +
              d ** 3
            ) /
              (2 * (a ** 2 + d ** 2)) +
              c +
              d) *
              ((a ** 2 * d -
                (a ** 6 * -1 +
                  2 * a ** 4 * b ** 2 +
                  2 * a ** 4 * c ** 2 -
                  2 * a ** 4 * d ** 2 -
                  a ** 2 * b ** 4 +
                  2 * a ** 2 * b ** 2 * c ** 2 +
                  2 * a ** 2 * b ** 2 * d ** 2 -
                  a ** 2 * c ** 4 +
                  2 * a ** 2 * c ** 2 * d ** 2 -
                  a ** 2 * d ** 4) **
                  (1 / 2) +
                b ** 2 * d -
                c ** 2 * d +
                d ** 3) /
                (2 * (a ** 2 + d ** 2)) +
                c -
                d)) **
            (1 / 2)
          return [x, y]
        }
        let f_l = function (r, x) {
          /* gives the y coordinate of the top bulge */
          return ym_l + (r ** 2 - x ** 2) ** (1 / 2)
        }
        // define outer arc
        let r_l = (4 * b ** 2 + l ** 2) / 8 / b,
          ym_l = w / 2 - r_l,
          // w-bulge
          r_w = (4 * b ** 2 + w ** 2) / 8 / b,
          xm_w = r_w - l / 2,
          // top left edge circle centre
          [x0, y0] = xySolution(ym_l, r_l - r, r_w - r, xm_w),
          // hypotenuse
          c_l = f_l(r_l, x0) - y0,
          // angular distance to upper contact point with l-bulge
          epsilon_l = (Math.acos(r / c_l) / Math.PI) * 180,
          c_w = (r_w ** 2 - y0 ** 2) ** (1 / 2) - xm_w + x0,
          // angular distance to left contact point with w-bulge
          epsilon_w = (Math.acos(r / Math.abs(c_w)) / Math.PI) * 180,
          // edge points
          edge_top_right = this.defineEdgePoints(
            r,
            epsilon_w,
            90 - epsilon_l,
            new BABYLON.Vector3(-x0, 0, y0)
          ),
          edge_top_left = this.defineEdgePoints(
            r,
            90 + epsilon_l,
            180 - epsilon_w,
            new BABYLON.Vector3(x0, 0, y0)
          ),
          edge_bottom_left = this.defineEdgePoints(
            r,
            180 + epsilon_w,
            270 - epsilon_l,
            new BABYLON.Vector3(x0, 0, -y0)
          ),
          edge_bottom_right = this.defineEdgePoints(
            r,
            270 + epsilon_l,
            360 - epsilon_w,
            new BABYLON.Vector3(-x0, 0, -y0)
          ),
          // top l-bulge
          gamma_l = (Math.acos(Math.abs(edge_top_left[0].x) / r_l) / Math.PI) * 180,
          bulge_l_top = this.defineEdgePoints(
            r_l,
            gamma_l,
            180 - gamma_l,
            new BABYLON.Vector3(0, 0, ym_l)
          ),
          // bottom l-bulge
          bulge_l_bottom = this.defineEdgePoints(
            r_l,
            180 + gamma_l,
            360 - gamma_l,
            new BABYLON.Vector3(0, 0, -ym_l)
          ),
          // left w-bulge
          lastIndex = edge_top_left.length - 1,
          gamma_w = (Math.asin(Math.abs(edge_top_left[lastIndex].z) / r_w) / Math.PI) * 180,
          bulge_w_left = this.defineEdgePoints(
            r_w,
            180 - gamma_w,
            180 + gamma_w,
            new BABYLON.Vector3(xm_w, 0, 0)
          ),
          // right w-bulge
          bulge_w_right = this.defineEdgePoints(
            r_w,
            360 - gamma_w,
            360 + gamma_w,
            new BABYLON.Vector3(-xm_w, 0, 0)
          ),
          // merge all segements
          contour = edge_top_right
            .concat(bulge_l_top)
            .concat(edge_top_left)
            .concat(bulge_w_left)
            .concat(edge_bottom_left)
            .concat(bulge_l_bottom)
            .concat(edge_bottom_right)
            .concat(bulge_w_right)
        contour.push(contour[0])

        return contour
      },
      changeEdgeMaterial(path) {
        this.store.table.edge.mesh.material = this.getMaterialTiled(path);
      },
      changeCoreMaterial(path_edge, path_coverBottom) {
        this.store.table.edge.mesh.material = this.getMaterialTiled(path_edge);
        this.store.table.coverBottom.material = this.getMaterial(path_coverBottom);
      },
      getGeometryBottom() {
        /* the degree=25° case changes length and width
         */
        const length_bottom =
          this.store.table.geometry.length -
          this.store.table.geometry.thickness / Math.tan((this.store.table.degree / 180) * Math.PI)
        const width_bottom =
          this.store.table.geometry.width -
          this.store.table.geometry.thickness / Math.tan((this.store.table.degree / 180) * Math.PI)
        let geometryBottom = { ...this.store.table.geometry }
        geometryBottom.length = length_bottom
        geometryBottom.width = width_bottom
        return geometryBottom
      },
      defineShape() {
        /*
          thickness and height of tabletop-frame
          CreateRibbon expects point-array of the 3D-shape
          */
        let path = [
          new BABYLON.Vector3(0, this.store.table.geometry.height, 0),
          new BABYLON.Vector3(
            0,
            this.store.table.geometry.height + this.store.table.geometry.thickness,
            0
          )
        ]
        let contour = this.defineContour(this.store.table.geometry)
        let table_paths = null


        if (this.store.table.degree == 90) {
          table_paths = this.profileToRibbonPath(path, contour)
        } else if (this.store.table.degree == 25) {
          table_paths = this.profileToTaperedRibbonPath(path, contour)
        }
        return table_paths
      },
      defineLeg: function (leg_Number) {
        /*
          possible profiles are: round, square, feet
          the leg_path goes top-down
          leg_Number goes from 1-4 in counter-clockwise direction
          */
        let side_length = 0.5
        let leg_contour = []
        let shape_paths = []
        let leg_path = []
        let vector_position = null
        let f = 0.9
        // keep legs within the tableEdge
        if (this.store.table.geometry.plateform !== 'rectangle') {
          f = 0.75
        }
        // path goes top-down
        switch (leg_Number) {
          case 1:
            vector_position = this.store.table.geometry.vector_translate_1.multiply(
              new BABYLON.Vector3(f, f, f)
            )
            leg_path.push(new BABYLON.Vector3(1, 0, 1).addInPlace(vector_position))
            break
          case 2:
            vector_position = this.store.table.geometry.vector_translate_2.multiply(
              new BABYLON.Vector3(f, f, f)
            )
            leg_path.push(new BABYLON.Vector3(-1, 0, 1).addInPlace(vector_position))
            break
          case 3:
            vector_position = this.store.table.geometry.vector_translate_3.multiply(
              new BABYLON.Vector3(f, f, f)
            )
            leg_path.push(new BABYLON.Vector3(-1, 0, -1).addInPlace(vector_position))
            break
          case 4:
            vector_position = this.store.table.geometry.vector_translate_4.multiply(
              new BABYLON.Vector3(f, f, f)
            )
            leg_path.push(new BABYLON.Vector3(1, 0, -1).addInPlace(vector_position))
        }
        leg_path.push(
          new BABYLON.Vector3(0, this.store.table.geometry.height, 0).addInPlace(vector_position)
        )

        if (this.profile === 'square') {
          // profile
          leg_contour = [
            new BABYLON.Vector3(side_length, 0, side_length),
            new BABYLON.Vector3(-side_length, 0, side_length),
            new BABYLON.Vector3(-side_length, 0, -side_length),
            new BABYLON.Vector3(side_length, 0, -side_length),
            new BABYLON.Vector3(side_length, 0, side_length)
          ]
        }
        if (this.profile === 'circle') {
          leg_contour = this.defineEdgePoints(side_length / 2, 0, 360, new BABYLON.Vector3(0, 0, 0))
        }
        if (this.profile === 'feet_luxusproblem') {
          leg_contour = [
            new BABYLON.Vector3(side_length / 2, 0, 0),
            new BABYLON.Vector3(-side_length / 2, 0, 0),
            new BABYLON.Vector3(
              -side_length / 2,
              0,
              -(this.store.table.geometry.width - this.store.table.geometry.radius * 2)
            ),
            new BABYLON.Vector3(
              side_length / 2,
              0,
              -(this.store.table.geometry.width - this.store.table.geometry.radius * 2)
            ),
            new BABYLON.Vector3(side_length / 2, 0, 0)
          ]
        }
        // make profile to ribbon-path
        shape_paths = this.profileToRibbonPath(leg_path, leg_contour)
        return shape_paths
      },
      defineContour: function (geometry) {
        /*
            used for contour of the table or the slit
          */
        let contour = null
        switch (geometry.plateform) {
          case 'rectangle':
            contour = this.getRectangleContour(geometry)
            break
          case 'barrel1':
            contour = this.getBarrel1Contour(geometry)
            break
          case 'barrel2':
            contour = this.getBarrel2Contour(geometry)
            break
          case 'ellipse':
            contour = this.getEllipseContour(geometry)
            break
        }
        return contour
      },
      defineEdgePoints: function (radius, alpha_start, alpha_end, vector_translate) {
        /* alpha_start and alpha_end define the length of the circular arc
             anticlockwise
             the circular arc is moved in the x-z-plane by vector_translate
          */
        let edge_points = []
        let d_alpha = 2

        if (radius > 0) {
          for (let alpha = alpha_start; alpha <= alpha_end; alpha += d_alpha) {
            let x = radius * Math.cos((alpha * Math.PI) / 180)
            let z = radius * Math.sin((alpha * Math.PI) / 180)
            x = Number(x.toFixed(3))
            z = Number(z.toFixed(3))
            let v = new BABYLON.Vector3(x, 0, z)
            v.addInPlace(vector_translate)
            edge_points.push(v)
          }
        } else {
          // diameter of leg is 0.5
          let dr = 0.6
          switch (alpha_end) {
            case 90:
              edge_points.push(vector_translate.addInPlace(new BABYLON.Vector3(dr, 0, dr)))
              break
            case 180:
              edge_points.push(vector_translate.addInPlace(new BABYLON.Vector3(-dr, 0, dr)))
              break
            case 270:
              edge_points.push(vector_translate.addInPlace(new BABYLON.Vector3(-dr, 0, -dr)))
              break
            case 360:
              edge_points.push(vector_translate.addInPlace(new BABYLON.Vector3(dr, 0, -dr)))
          }
        }
        return edge_points
      },
      defineUVs: function (shape) {
        /* texture can't simply applied to the CreateRibbon-Mesh due to the curvature,
         */
        let UVs = []
        let n = shape.length - 1 // number of faces
        let s = 0.5, // v scaling factor
          t = 2

        for (let i = 0; i < n + 1; i++) {
          UVs.push(new BABYLON.Vector2((i * t) / n, 0))
          UVs.push(new BABYLON.Vector2((i * t) / n, s))
        }
        return UVs
      },
      getMaterial(imagePath, standardMaterialIsDefault = true) {
        let material = standardMaterialIsDefault
          ? new BABYLON.StandardMaterial('', this.store.scene)
          : new BABYLON.BackgroundMaterial('', this.store.scene)
        material.diffuseTexture = new BABYLON.Texture(imagePath, this.store.scene)
        material.diffuseTexture.vScale =
          this.store.table.geometry.width / this.store.table.geometry.length
        return material
      },
      getMultiMaterial(imagePath, standardMaterialIsDefault = true) {
        let material = standardMaterialIsDefault
          ? new BABYLON.StandardMaterial('', this.store.scene)
          : new BABYLON.BackgroundMaterial('', this.store.scene)
        material.diffuseTexture = new BABYLON.Texture(imagePath, this.store.scene)
        
        return material
      },
      getMaterialTiled(imagePath, standardMaterialIsDefault = true) {
        let material = standardMaterialIsDefault
          ? new BABYLON.StandardMaterial('', this.store.scene)
          : new BABYLON.BackgroundMaterial('', this.store.scene);
        material.diffuseTexture = new BABYLON.Texture(imagePath, this.store.scene);
        // tile in y-direction
        material.diffuseTexture.vScale = 2;
        // tile in x-direction
        material.diffuseTexture.uScale = 300;
        // tile in z-direction
        material.diffuseTexture.hScale = 300;

        return material
      },
      makePhotoDome() {
        const axes = new BABYLON.AxesViewer(this.store.scene, 2);
        this.store.dome = new BABYLON.PhotoDome(
          "testdome",
          "https://i.imgur.com/qxYLvg8.jpg",
          {
            resolution: 32,
            size: 100
          },
          this.store.scene
        );
        let scale = 0.5;
        this.store.dome.scaling = new BABYLON.Vector3(scale, scale, scale);
        this.store.dome.position = new BABYLON.Vector3(0, 0, 0);
        this.translateMeshes();
      },
      translateMeshes() {
        let dy = 10;
        this.store.table.edge.translate(new BABYLON.Vector3(0, 1, 0), -dy, BABYLON.Space.LOCAL);
        this.store.table.coverBottom.translate(new BABYLON.Vector3(0, 1, 0), -dy, BABYLON.Space.LOCAL);
        this.store.table.linoleum.mesh.translate(new BABYLON.Vector3(0, 1, 0), -dy, BABYLON.Space.LOCAL);

        this.translateImportedModels(dy);
      },
      translateImportedModels(dy) {
        let x1 = this.store.table.geometry.length / 2 - 0.5;
        let x2 = -this.store.table.geometry.length / 2 + 0.5;
        let y = -this.store.table.geometry.thickness - this.store.table.linoleum.thickness

        let leg1 = this.store.scene.getMeshByName("leg1");
        leg1.position = new BABYLON.Vector3(x1, y-dy, 0);

        let leg2 = this.store.scene.getMeshByName("leg2");
        leg2.position = new BABYLON.Vector3(x2, y-dy, 0);
        
      },
      moveCamera(card_number) {
        // 2DO: do sth better with css-focus
        this.store.isActive.menu.leg = false

        switch (card_number) {
          case 0:
            this.store.camera.spinTo('beta', Math.PI / 4, 100)
            this.store.camera.spinTo('alpha', Math.PI / 2, 100)

            this.store.camera.setTarget(new BABYLON.Vector3(0, 3, 0)); 
            this.store.camera.setPosition(new BABYLON.Vector3(0, 10, 15));
            break
          case 1: // 'Color and Cable Menu'
            this.store.camera.spinTo('beta', 0.791, 100)
            this.store.camera.spinTo('alpha', 2.07, 100)

            this.store.camera.setTarget(new BABYLON.Vector3(0, 3, 0));
            this.store.camera.setPosition(new BABYLON.Vector3(0, 10, 15));
            break
          case 2: // 'Plattenart'
            const { x, y, z } = this.store.table.linoleum.mesh.position;
            this.store.camera.setTarget(new BABYLON.Vector3(x,y,z));
            this.store.camera.setPosition(new BABYLON.Vector3(this.store.table.geometry.width +1, y -3, z));
            break
          case 4: // 'Tischgestell'
            this.store.isActive.menu.leg = true
            this.store.camera.spinTo('beta', 1.539, 100)
            this.store.camera.spinTo('alpha', 2.277, 100)
            this.store.camera.setTarget(new BABYLON.Vector3(0, 3, 0));
            this.store.camera.setPosition(new BABYLON.Vector3(0, 10, 15));
            break
          case 5: // 'Standort'
            this.store.camera.spinTo('beta', 1.188, 100)
            this.store.camera.spinTo('alpha', 2.107, 100)
            this.store.camera.spinTo('radius', 40, 100)
            this.store.camera.setTarget(new BABYLON.Vector3(0, 3, 0));
            this.store.camera.setPosition(new BABYLON.Vector3(0, 10, 15));
            break
        }
      },
      profileToRibbonPath: function (path, contour) {
        /* used for legs and tableEdge
         */
        let shape_paths = []
        for (var c = 0; c < contour.length; c++) {
          var cornerPath = []
          for (var p = 0; p < path.length; p++) {
            cornerPath.push(path[p].add(contour[c]))
          }
          shape_paths.push(cornerPath)
        }
        return shape_paths
      },
      profileToTaperedRibbonPath(path, contourTop) {
        /* consequence of degree = 25°
         */
        let contourBottom = this.defineContour(this.getGeometryBottom())
        let shape_paths = []
        for (var c = 0; c < contourTop.length; c++) {
          var cornerPath = []
          cornerPath.push(path[0].add(contourBottom[c]))
          cornerPath.push(path[1].add(contourTop[c]))
          shape_paths.push(cornerPath)
        }
        return shape_paths
      },
      updateAll() {
        /* the whole table is updated from bottom to top
         */
        this.updateTableEdge()
        this.updateLinoleum()
        this.updateCoverBottom()
        this.updateTableLegs()
        // this.updateDecoration();
      },
      updateCoverBottom() {
        /* after changes of degree
        */
        let contour = this.defineContour(this.getGeometryBottom());
        let coverBottom = BABYLON.MeshBuilder.CreatePolygon('', { shape: contour, holes: this.store.holes, depth: 0.01, sideOrientation: 2 }, this.store.scene, earcut);
        coverBottom.position = new BABYLON.Vector3(0, this.store.table.geometry.height, 0);
        this.store.table.coverBottom.dispose(false, true);
        this.store.table.coverBottom = coverBottom;
        this.store.table.coverBottom.material = this.getMaterial(this.store.table.core_material);
      },
      updateLinoleum() {
        let contour = this.defineContour(this.store.table.geometry)
        let linoleum = BABYLON.MeshBuilder.CreatePolygon(
          '',
          {
            shape: contour,
            holes: this.store.holes,
            depth: this.store.table.linoleum.thickness,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
          },
          this.store.scene,
          earcut
        )
        linoleum.position = new BABYLON.Vector3(
          0,
          this.store.table.geometry.height + this.store.table.geometry.thickness + this.store.table.linoleum.thickness,
          0
        )        
        linoleum.material = this.getMaterial(this.store.table.linoleum.texture_path, false)
        this.store.table.linoleum.mesh.dispose(false, true)
        this.store.table.linoleum.mesh = linoleum
      },
      changeLinoleumMaterial() {
        let linoleum_material = this.getMaterial(this.store.table.linoleum.texture_path, false);
        this.store.table.linoleum.mesh.material = linoleum_material;
      },
      changeLinoleumMultiMaterial() {
        let contour = this.defineContour(this.store.table.geometry)
        let linoleum = BABYLON.MeshBuilder.CreatePolygon(
          '',
          {
            shape: contour,
            holes: this.store.holes,
            depth: this.store.table.linoleum.thickness,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
          },
          this.store.scene,
          earcut
        )
        linoleum.position = new BABYLON.Vector3(
          0,
          this.store.table.geometry.height + this.store.table.geometry.thickness,
          0
        )        
        linoleum.material = this.getMaterial(this.store.table.linoleum.texture_path, false)



        var multimat = new BABYLON.MultiMaterial("multi", this.store.scene);

        var material0 = new BABYLON.StandardMaterial("mat0", this.store.scene);
        material0.diffuseColor = new BABYLON.Color3(1, 0, 0);

        var material1 = new BABYLON.StandardMaterial("mat1", this.store.scene);
        material1.diffuseColor = new BABYLON.Color3(0, 0, 1);
        
        var material2 = new BABYLON.StandardMaterial("mat2", this.store.scene);
        material2.emissiveColor = new BABYLON.Color3(0.4, 0, 0.4);


        multimat.subMaterials.push(material0);
        multimat.subMaterials.push(material1);
        multimat.subMaterials.push(material2);

        linoleum.material = multimat;

        linoleum.subMeshes = [];
        let verticesCount = linoleum.getTotalVertices();
        
        console.log(verticesCount);
        new BABYLON.SubMesh(0, 0, verticesCount, 0, 900, linoleum);
        new BABYLON.SubMesh(1, 0, verticesCount, 900, 900, linoleum);
        new BABYLON.SubMesh(2, 0, verticesCount, 1800, 2088, linoleum);

        this.store.table.linoleum.mesh.dispose(false, true)
        this.store.table.linoleum.mesh = linoleum
      },
      updateTableEdge() {
        /* degree = 90° by default or 25°
         */
        let mat = this.store.table.edge.mesh.material;
        this.store.table.edge.mesh.dispose();
        let shape = this.defineShape();
        let Uvs = this.defineUVs(shape);
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
        );
        this.store.table.edge.mesh.material = mat;
      },
      getLegPosition: function (leftOrRight) {
        /**
         *  0 = left, 1 = right
         */
        let x = [
            -this.store.table.geometry.length / 2 + 0.5,
            this.store.table.geometry.length / 2 - 0.5
          ],
          y = -this.store.table.geometry.thickness - this.store.table.linoleum.thickness

        return new BABYLON.Vector3(x[leftOrRight], y, 0)
      },
      updateTableLegs() {
        /* after change of height, length, width or edge radius of the table plate
          the position of the legs is updated
        */
        
        if (this.store.table.legs.length == 4) {
          for (let i = 0; i < 4; i++) {
            this.store.table.legs[i] = BABYLON.Mesh.CreateRibbon(
              '',
              this.defineLeg(i + 1),
              null,
              null,
              null,
              null,
              null,
              null,
              this.store.table.legs[i]
            )
          }
        } else {
          let leg1 = this.store.scene.getMeshByName("leg1");
          let leg2 = this.store.scene.getMeshByName("leg2");
          leg1.position = this.getLegPosition(0)
          leg2.position = this.getLegPosition(1)
        }
      },
      xz_To_xy_Trafo: function (contour) {
        /* CreateRibbon demands a profile defined in the xy-plane
           whereas ExtrudeShape needs a xz-plane */

        for (let i = 0; i < contour.length; i++) {
          contour[i].y = contour[i].z
          contour[i].z = 0
        }
        return contour
      }
    }
  }
})