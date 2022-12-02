<template>
    <CModal backdrop="static" :visible="visible" @close="onClose">
        <CModalHeader>
            <CModalTitle>Modal title</CModalTitle>
        </CModalHeader>
        <CModalBody>Woohoo, you're reading this text in a modal!</CModalBody>
        <CModalFooter>
            <CButton color="secondary" @click="() => { visible = false }">
                Close
            </CButton>
            <CButton color="primary">Save changes</CButton>
        </CModalFooter>
    </CModal>
</template>
<script>
    import {CModal, CModalHeader, CModalTitle, CModalBody, CButton, CModalFooter} from '@coreui/vue';
    export default {
        components: { CModal, CModalHeader, CModalTitle, CModalBody, CButton, CModalFooter},
        emits: ['showHidenModal'],
        computed: {
            visible: function() {
                console.log(this.visible, this.initialVisibleModal)
                return this.initialVisibleModal
            },
        },
        props: {
            initialVisibleModal: Boolean
        },
        methods: {
            onClose(e) {
                this.visible = false;
                console.log(this.visible)
                this.$emit("showHidenModal", this.visible);
            }
        }
    }
    //https://viblo.asia/p/vuejs-tao-thanh-phan-dialog-tai-su-dung-nhieu-lan-WAyK8V89lxX
</script>