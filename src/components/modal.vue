<template>
    <CModal backdrop="static" :visible="visible" @close="onClose">
        <CModalHeader>
            <CModalTitle>{{headerTitle}}</CModalTitle>
        </CModalHeader>
        <CModalBody>
            {{contentBody}}
            <slot name="bodySlot" ></slot>
        </CModalBody>
        <CModalFooter>
            <CButton color="secondary" @click="onClose">
                Close
            </CButton>
            <CButton color="primary" @click="onSubmit">Save changes</CButton>
        </CModalFooter>
    </CModal>
</template>
<script>
    import {CModal, CModalHeader, CModalTitle, CModalBody, CButton, CModalFooter} from '@coreui/vue';
    export default {
        components: { CModal, CModalHeader, CModalTitle, CModalBody, CButton, CModalFooter},
        emits: ['showHidenModal', 'submitModal'],
        props: {
            initialVisibleModal: Boolean,
            initialHeaderTitle: String,
            initialContentBody: Object
        },
        data() {
            return {
                headerTitle: this.initialHeaderTitle,
                contentBody: this.initialContentBody,
            };
        },
        computed: {
            visible: function() {
                return this.initialVisibleModal
            },
        },
        methods: {
            onClose() {
                this.visible = false;
                this.$emit("showHidenModal", this.visible);
            },
            onSubmit() {
                this.$emit("submitModal");
                this.onClose()
            }
        },
    }
    //https://viblo.asia/p/vuejs-tao-thanh-phan-dialog-tai-su-dung-nhieu-lan-WAyK8V89lxX
</script>