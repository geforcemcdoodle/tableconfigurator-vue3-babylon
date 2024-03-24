<template>
  <div class="card-progress">
    <span v-if="edit || menuID == nowEdited" class="mdi mdi-pencil-circle-outline edit"></span>
    <span v-if="!edit && !(menuID == nowEdited)" class="mdi mdi-check-circle-outline check"></span>
  </div>
</template>

<script>
export default {
  props: ['edit', 'menuID', 'nowEdited'],
  data() {
    return {
      // TODO shall I put toEdit() or updateEdit() in here?
    }
  }
}
</script>
